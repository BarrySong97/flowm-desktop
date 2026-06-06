from __future__ import annotations

import datetime as dt
import json
import sqlite3
from decimal import Decimal
from pathlib import Path
from typing import Iterable

from beancount.core import account
from beancount.core import amount
from beancount.core import data
from beancount.core import position
from beancount.core.number import D
from beancount.parser import booking
from beancount.parser import grammar
from beancount.parser import parser


ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS_DIR = ROOT / "packages/db/migrations"


def parse_entries(source: str) -> list[data.Directive]:
    entries, errors, options_map = parser.parse_string(source)
    assert not errors, errors
    entries, booking_errors = booking.book(entries, options_map)
    assert not booking_errors, booking_errors
    return data.sorted(entries)


def connect_schema() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("pragma foreign_keys = on")
    for migration in sorted(MIGRATIONS_DIR.glob("*.sql")):
        sql = "\n".join(
            line for line in migration.read_text().splitlines() if not line.startswith("-->")
        )
        conn.executescript(sql)
    return conn


def _meta() -> dict[str, object]:
    return data.new_metadata("<sqlite>", 0)


def _date(value: object) -> str:
    assert isinstance(value, dt.date)
    return value.isoformat()


def _parse_date(value: str) -> dt.date:
    return dt.date.fromisoformat(value)


def _amount_number(value: amount.Amount | None) -> str | None:
    return None if value is None else str(value.number)


def _amount_currency(value: amount.Amount | None) -> str | None:
    return None if value is None else value.currency


def _amount(number: str, currency: str) -> amount.Amount:
    return amount.Amount(D(number), currency)


def _json(values: object) -> str:
    return json.dumps(values, sort_keys=True, separators=(",", ":"))


def _upsert_commodity(
    conn: sqlite3.Connection,
    currency: str,
    declared_at: str | None = None,
) -> None:
    conn.execute(
        """
        insert into commodities (currency, declared_at, meta)
        values (?, ?, null)
        on conflict(currency) do update set
          declared_at = coalesce(excluded.declared_at, commodities.declared_at)
        """,
        (currency, declared_at),
    )


def _account_id(conn: sqlite3.Connection, name: str) -> int:
    row = conn.execute("select id from accounts where name = ?", (name,)).fetchone()
    assert row is not None, f"missing account: {name}"
    return int(row["id"])


def _optional_account_id(conn: sqlite3.Connection, name: str) -> int | None:
    row = conn.execute("select id from accounts where name = ?", (name,)).fetchone()
    return None if row is None else int(row["id"])


def _insert_tag(conn: sqlite3.Connection, tag: str) -> None:
    conn.execute("insert or ignore into tags (tag) values (?)", (tag,))


def _insert_link(conn: sqlite3.Connection, link: str) -> None:
    conn.execute("insert or ignore into links (link) values (?)", (link,))


def _insert_tags(
    conn: sqlite3.Connection,
    table: str,
    id_column: str,
    id_value: int,
    tags: Iterable[str] | None,
) -> None:
    for tag in sorted(tags or []):
        _insert_tag(conn, tag)
        conn.execute(
            f"insert into {table} ({id_column}, tag) values (?, ?)",
            (id_value, tag),
        )


def _insert_links(
    conn: sqlite3.Connection,
    table: str,
    id_column: str,
    id_value: int,
    links: Iterable[str] | None,
) -> None:
    for link in sorted(links or []):
        _insert_link(conn, link)
        conn.execute(
            f"insert into {table} ({id_column}, link) values (?, ?)",
            (id_value, link),
        )


def _read_tags(
    conn: sqlite3.Connection,
    table: str,
    id_column: str,
    id_value: int,
) -> frozenset[str]:
    rows = conn.execute(
        f"select tag from {table} where {id_column} = ? order by tag",
        (id_value,),
    ).fetchall()
    return frozenset(row["tag"] for row in rows)


def _read_links(
    conn: sqlite3.Connection,
    table: str,
    id_column: str,
    id_value: int,
) -> frozenset[str]:
    rows = conn.execute(
        f"select link from {table} where {id_column} = ? order by link",
        (id_value,),
    ).fetchall()
    return frozenset(row["link"] for row in rows)


def _encode_custom_value(value: grammar.ValueType) -> dict[str, object]:
    raw = value.value
    if value.dtype is account.TYPE:
        return {"type": "account", "value": raw}
    if isinstance(raw, amount.Amount):
        return {
            "type": "amount",
            "number": str(raw.number),
            "currency": raw.currency,
        }
    if isinstance(raw, dt.date):
        return {"type": "date", "value": raw.isoformat()}
    if isinstance(raw, bool):
        return {"type": "bool", "value": raw}
    if isinstance(raw, Decimal):
        return {"type": "decimal", "value": str(raw)}
    if isinstance(raw, str):
        return {"type": "string", "value": raw}
    raise AssertionError(f"unsupported custom value: {value!r}")


def _decode_custom_value(value: dict[str, object]) -> grammar.ValueType:
    value_type = value["type"]
    if value_type == "account":
        return grammar.ValueType(value["value"], account.TYPE)
    if value_type == "amount":
        return grammar.ValueType(
            _amount(str(value["number"]), str(value["currency"])),
            amount.Amount,
        )
    if value_type == "date":
        return grammar.ValueType(_parse_date(str(value["value"])), dt.date)
    if value_type == "bool":
        return grammar.ValueType(bool(value["value"]), bool)
    if value_type == "decimal":
        return grammar.ValueType(D(str(value["value"])), Decimal)
    if value_type == "string":
        return grammar.ValueType(value["value"], str)
    raise AssertionError(f"unsupported custom value type: {value_type!r}")


def import_entries(conn: sqlite3.Connection, entries: list[data.Directive]) -> None:
    for entry in entries:
        if isinstance(entry, data.Commodity):
            _upsert_commodity(conn, entry.currency, _date(entry.date))
        elif isinstance(entry, data.Open):
            for currency in entry.currencies or []:
                _upsert_commodity(conn, currency)
            parent_name = entry.account.rpartition(":")[0] or None
            parent_id = _optional_account_id(conn, parent_name) if parent_name else None
            booking_method = entry.booking.value if entry.booking is not None else "STRICT"
            cursor = conn.execute(
                """
                insert into accounts (name, type, opened_at, closed_at, booking, parent_id, meta)
                values (?, ?, ?, null, ?, ?, null)
                """,
                (
                    entry.account,
                    entry.account.split(":", 1)[0],
                    _date(entry.date),
                    booking_method,
                    parent_id,
                ),
            )
            account_id = int(cursor.lastrowid)
            for currency in entry.currencies or []:
                conn.execute(
                    "insert into account_currencies (account_id, currency) values (?, ?)",
                    (account_id, currency),
                )
        elif isinstance(entry, data.Close):
            conn.execute(
                "update accounts set closed_at = ? where name = ?",
                (_date(entry.date), entry.account),
            )
        elif isinstance(entry, data.Transaction):
            cursor = conn.execute(
                """
                insert into transactions (date, flag, payee, narration, origin, meta)
                values (?, ?, ?, ?, 'user', null)
                """,
                (_date(entry.date), entry.flag, entry.payee, entry.narration),
            )
            txn_id = int(cursor.lastrowid)
            _insert_tags(conn, "transaction_tags", "txn_id", txn_id, entry.tags)
            _insert_links(conn, "transaction_links", "txn_id", txn_id, entry.links)
            for ordinal, posting in enumerate(entry.postings):
                if posting.units is not None:
                    _upsert_commodity(conn, posting.units.currency)
                if posting.cost is not None:
                    _upsert_commodity(conn, posting.cost.currency)
                if posting.price is not None:
                    _upsert_commodity(conn, posting.price.currency)
                conn.execute(
                    """
                    insert into postings (
                      txn_id, ordinal, account_id, flag,
                      units_number, units_currency,
                      cost_number, cost_currency, cost_date, cost_label,
                      price_number, price_currency, price_is_total, meta
                    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, null)
                    """,
                    (
                        txn_id,
                        ordinal,
                        _account_id(conn, posting.account),
                        posting.flag,
                        _amount_number(posting.units),
                        _amount_currency(posting.units),
                        None if posting.cost is None else str(posting.cost.number),
                        None if posting.cost is None else posting.cost.currency,
                        None if posting.cost is None or posting.cost.date is None else _date(posting.cost.date),
                        None if posting.cost is None else posting.cost.label,
                        _amount_number(posting.price),
                        _amount_currency(posting.price),
                    ),
                )
        elif isinstance(entry, data.Balance):
            _upsert_commodity(conn, entry.amount.currency)
            if entry.diff_amount is not None:
                _upsert_commodity(conn, entry.diff_amount.currency)
            conn.execute(
                """
                insert into balance_asserts (
                  date, account_id, amount_number, amount_currency,
                  tolerance_number, diff_number, diff_currency, meta
                ) values (?, ?, ?, ?, ?, ?, ?, null)
                """,
                (
                    _date(entry.date),
                    _account_id(conn, entry.account),
                    str(entry.amount.number),
                    entry.amount.currency,
                    None if entry.tolerance is None else str(entry.tolerance),
                    _amount_number(entry.diff_amount),
                    _amount_currency(entry.diff_amount),
                ),
            )
        elif isinstance(entry, data.Pad):
            conn.execute(
                """
                insert into pads (date, account_id, source_account_id, meta)
                values (?, ?, ?, null)
                """,
                (
                    _date(entry.date),
                    _account_id(conn, entry.account),
                    _account_id(conn, entry.source_account),
                ),
            )
        elif isinstance(entry, data.Price):
            _upsert_commodity(conn, entry.currency)
            _upsert_commodity(conn, entry.amount.currency)
            conn.execute(
                """
                insert into prices (date, currency, amount_number, amount_currency, meta)
                values (?, ?, ?, ?, null)
                """,
                (
                    _date(entry.date),
                    entry.currency,
                    str(entry.amount.number),
                    entry.amount.currency,
                ),
            )
        elif isinstance(entry, data.Note):
            cursor = conn.execute(
                """
                insert into notes (date, account_id, comment, meta)
                values (?, ?, ?, null)
                """,
                (_date(entry.date), _account_id(conn, entry.account), entry.comment),
            )
            note_id = int(cursor.lastrowid)
            _insert_tags(conn, "note_tags", "note_id", note_id, entry.tags)
            _insert_links(conn, "note_links", "note_id", note_id, entry.links)
        elif isinstance(entry, data.Event):
            conn.execute(
                "insert into events (date, type, description, meta) values (?, ?, ?, null)",
                (_date(entry.date), entry.type, entry.description),
            )
        elif isinstance(entry, data.Query):
            conn.execute(
                """
                insert into queries (date, name, query_string, meta)
                values (?, ?, ?, null)
                """,
                (_date(entry.date), entry.name, entry.query_string),
            )
        elif isinstance(entry, data.Document):
            cursor = conn.execute(
                """
                insert into documents (date, account_id, filename, meta)
                values (?, ?, ?, null)
                """,
                (_date(entry.date), _account_id(conn, entry.account), entry.filename),
            )
            document_id = int(cursor.lastrowid)
            _insert_tags(conn, "document_tags", "document_id", document_id, entry.tags)
            _insert_links(conn, "document_links", "document_id", document_id, entry.links)
        elif isinstance(entry, data.Custom):
            conn.execute(
                """
                insert into customs (date, type, "values", meta)
                values (?, ?, ?, null)
                """,
                (
                    _date(entry.date),
                    entry.type,
                    _json([_encode_custom_value(value) for value in entry.values]),
                ),
            )
        else:
            raise AssertionError(f"unsupported directive: {entry!r}")
    conn.commit()


def export_entries(conn: sqlite3.Connection) -> list[data.Directive]:
    entries: list[data.Directive] = []

    for row in conn.execute(
        "select currency, declared_at from commodities where declared_at is not null"
    ):
        entries.append(data.Commodity(_meta(), _parse_date(row["declared_at"]), row["currency"]))

    for row in conn.execute("select id, name, opened_at, booking from accounts order by id"):
        currencies = [
            currency_row["currency"]
            for currency_row in conn.execute(
                "select currency from account_currencies where account_id = ? order by currency",
                (row["id"],),
            )
        ]
        booking_method = None
        if row["booking"] != "STRICT":
            booking_method = data.Booking[row["booking"]]
        entries.append(
            data.Open(
                _meta(),
                _parse_date(row["opened_at"]),
                row["name"],
                currencies or None,
                booking_method,
            )
        )

    for row in conn.execute(
        "select id, date, flag, payee, narration from transactions order by id"
    ):
        postings = []
        for posting_row in conn.execute(
            """
            select p.*, a.name as account
            from postings p
            join accounts a on a.id = p.account_id
            where p.txn_id = ?
            order by p.ordinal
            """,
            (row["id"],),
        ):
            units = None
            if posting_row["units_number"] is not None:
                units = _amount(posting_row["units_number"], posting_row["units_currency"])
            cost = None
            if posting_row["cost_number"] is not None:
                cost = position.Cost(
                    D(posting_row["cost_number"]),
                    posting_row["cost_currency"],
                    None
                    if posting_row["cost_date"] is None
                    else _parse_date(posting_row["cost_date"]),
                    posting_row["cost_label"],
                )
            price = None
            if posting_row["price_number"] is not None:
                price = _amount(posting_row["price_number"], posting_row["price_currency"])
            postings.append(
                data.Posting(
                    posting_row["account"],
                    units,
                    cost,
                    price,
                    posting_row["flag"],
                    _meta(),
                )
            )
        entries.append(
            data.Transaction(
                _meta(),
                _parse_date(row["date"]),
                row["flag"],
                row["payee"],
                row["narration"],
                _read_tags(conn, "transaction_tags", "txn_id", row["id"]),
                _read_links(conn, "transaction_links", "txn_id", row["id"]),
                postings,
            )
        )

    for row in conn.execute(
        """
        select b.*, a.name as account
        from balance_asserts b
        join accounts a on a.id = b.account_id
        order by b.id
        """
    ):
        diff_amount = None
        if row["diff_number"] is not None:
            diff_amount = _amount(row["diff_number"], row["diff_currency"])
        entries.append(
            data.Balance(
                _meta(),
                _parse_date(row["date"]),
                row["account"],
                _amount(row["amount_number"], row["amount_currency"]),
                None if row["tolerance_number"] is None else D(row["tolerance_number"]),
                diff_amount,
            )
        )

    for row in conn.execute(
        """
        select p.date, a.name as account, s.name as source_account
        from pads p
        join accounts a on a.id = p.account_id
        join accounts s on s.id = p.source_account_id
        order by p.id
        """
    ):
        entries.append(
            data.Pad(_meta(), _parse_date(row["date"]), row["account"], row["source_account"])
        )

    for row in conn.execute(
        "select date, currency, amount_number, amount_currency from prices order by id"
    ):
        entries.append(
            data.Price(
                _meta(),
                _parse_date(row["date"]),
                row["currency"],
                _amount(row["amount_number"], row["amount_currency"]),
            )
        )

    for row in conn.execute(
        """
        select n.*, a.name as account
        from notes n
        join accounts a on a.id = n.account_id
        order by n.id
        """
    ):
        entries.append(
            data.Note(
                _meta(),
                _parse_date(row["date"]),
                row["account"],
                row["comment"],
                _read_tags(conn, "note_tags", "note_id", row["id"]),
                _read_links(conn, "note_links", "note_id", row["id"]),
            )
        )

    for row in conn.execute("select date, type, description from events order by id"):
        entries.append(
            data.Event(
                _meta(),
                _parse_date(row["date"]),
                row["type"],
                row["description"],
            )
        )

    for row in conn.execute("select date, name, query_string from queries order by id"):
        entries.append(
            data.Query(
                _meta(),
                _parse_date(row["date"]),
                row["name"],
                row["query_string"],
            )
        )

    for row in conn.execute(
        """
        select d.*, a.name as account
        from documents d
        join accounts a on a.id = d.account_id
        order by d.id
        """
    ):
        entries.append(
            data.Document(
                _meta(),
                _parse_date(row["date"]),
                row["account"],
                row["filename"],
                _read_tags(conn, "document_tags", "document_id", row["id"]),
                _read_links(conn, "document_links", "document_id", row["id"]),
            )
        )

    for row in conn.execute('select date, type, "values" from customs order by id'):
        entries.append(
            data.Custom(
                _meta(),
                _parse_date(row["date"]),
                row["type"],
                [_decode_custom_value(value) for value in json.loads(row["values"])],
            )
        )

    for row in conn.execute("select name, closed_at from accounts where closed_at is not null"):
        entries.append(data.Close(_meta(), _parse_date(row["closed_at"]), row["name"]))

    return data.sorted(entries)


def roundtrip_entries(entries: list[data.Directive]) -> list[data.Directive]:
    conn = connect_schema()
    try:
        import_entries(conn, entries)
        return export_entries(conn)
    finally:
        conn.close()
