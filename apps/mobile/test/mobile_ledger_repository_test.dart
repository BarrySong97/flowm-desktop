/*
 * @purpose Verify the mobile Drift mapper against the bundled Desktop SQLite ledger.
 * @role    Exercises read-only ORM table access and snapshot aggregation.
 * @deps    flowm_database.dart, mobile_ledger_repository.dart, flutter_test.
 * @gotcha  The test opens the fixture read-only and must not mutate it.
 */
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:flowm_mobile/src/data/flowm_database.dart';
import 'package:flowm_mobile/src/data/mobile_ledger_repository.dart';

void main() {
  test('maps bundled Desktop SQLite into a mobile read snapshot', () async {
    final db = FlowmDatabase.openReadOnly(File('assets/flowm-demo.sqlite3'));
    addTearDown(db.close);

    final snapshot = await MobileLedgerRepository(db).loadSnapshot();

    expect(snapshot.accounts, isNotEmpty);
    expect(snapshot.liabilityAccounts, isNotEmpty);
    expect(snapshot.transactions, isNotEmpty);
    expect(snapshot.subscriptions, isNotEmpty);
    expect(snapshot.liabilities, isNotEmpty);
    expect(snapshot.budgets, isNotEmpty);
    expect(snapshot.calendarDays, isNotEmpty);
    expect(snapshot.calendarDays.any((day) => day.spend > 0), isTrue);
    expect(snapshot.monthIn, greaterThan(0));
    expect(snapshot.categoryMeta.length, greaterThan(5));
  });
}
