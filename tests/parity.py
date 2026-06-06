import subprocess
from pathlib import Path

import pytest
from beancount import loader
from beancount.ops import validation
from beancount.parser import cmptest

from beancount_sqlite_harness import parse_entries, roundtrip_entries


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parent
ORIGINAL = ROOT / "packages/db/tests/fixtures/basic.beancount"
DUMPED = REPO_ROOT / ".context/parity/basic.dump.beancount"
PARITY_DIR = REPO_ROOT / ".context/parity"

ALL_DIRECTIVES = """
2014-01-01 commodity USD
2014-01-01 commodity CAD
2014-01-01 open Assets:Cash USD
2014-01-01 open Equity:Opening-Balances USD
2014-01-01 open Expenses:Food USD

2014-01-02 pad Assets:Cash Equity:Opening-Balances
2014-01-03 balance Assets:Cash 0 USD
2014-01-04 price USD 1.10 CAD
2014-01-05 note Assets:Cash "Imported note" #ops ^statement
2014-01-06 document Assets:Cash "/tmp/statement.pdf" #ops ^statement
2014-01-07 event "location" "New Metropolis"
2014-01-08 query "cash" "SELECT sum(position) WHERE currency = 'USD'"
2014-01-09 custom "budget" Assets:Cash "weekly" 200.00 10.00 USD 2016-02-28 TRUE

2014-01-10 * "Payee" "Tagged transaction" #ops ^statement
  Assets:Cash   -10.00 USD
  Expenses:Food  10.00 USD

2014-01-11 close Expenses:Food
"""


class BeancountParityTest(cmptest.TestCase):
    pass


def test_basic_dumper_matches_beancount_parser():
    subprocess.run(
        ["pnpm", "--filter", "@flowm/db", "dump:fixture", str(DUMPED)],
        cwd=ROOT,
        check=True,
    )

    case = BeancountParityTest(methodName="runTest")
    case.assertEqualEntries(ORIGINAL.read_text(), DUMPED.read_text())


def test_sqlite_schema_roundtrips_all_supported_directives():
    entries = parse_entries(ALL_DIRECTIVES)
    actual = roundtrip_entries(entries)

    case = BeancountParityTest(methodName="runTest")
    case.assertEqualEntries(entries, actual)


@pytest.mark.parametrize(
    ("seed", "date_begin", "date_end"),
    [
        (1, "2020-01-01", "2020-03-01"),
        (2, "2020-01-01", "2020-06-01"),
        (7, "2021-01-01", "2021-04-01"),
    ],
)
def test_sqlite_schema_roundtrips_generated_beancount_examples(
    seed: int,
    date_begin: str,
    date_end: str,
):
    PARITY_DIR.mkdir(parents=True, exist_ok=True)
    example_file = PARITY_DIR / f"generated-example-{seed}.beancount"
    subprocess.run(
        [
            str(REPO_ROOT / ".context/.bean-venv/bin/bean-example"),
            "--date-begin",
            date_begin,
            "--date-end",
            date_end,
            "--seed",
            str(seed),
            "-o",
            str(example_file),
        ],
        check=True,
    )

    _, errors, _ = loader.load_file(
        str(example_file),
        extra_validations=validation.HARDCORE_VALIDATIONS,
    )
    assert not errors

    entries = parse_entries(example_file.read_text())
    actual = roundtrip_entries(entries)

    case = BeancountParityTest(methodName="runTest")
    case.assertEqualEntries(entries, actual)
