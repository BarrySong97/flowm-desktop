/*
 * @purpose Read-only Drift mirror of the Flowm Desktop SQLite schema.
 * @role    Defines typed table access for mobile display/query mapping.
 * @deps    drift, drift/native, sqlite3, path_provider.
 * @gotcha  This database opens copied Desktop SQLite files read-only; do not add mobile writes or migrations here.
 */
import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:sqlite3/sqlite3.dart' as sqlite;

part 'flowm_database.g.dart';

@DataClassName('CategoryRow')
class Categories extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get parentId => text().nullable().named('parent_id')();
  TextColumn get categoryKind => text().named('category_kind')();
  TextColumn get color => text().nullable()();
  TextColumn get icon => text().nullable()();
  IntColumn get displayOrder => integer().named('display_order')();
  TextColumn get archivedAt => text().nullable().named('archived_at')();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('TagRow')
class Tags extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get color => text().nullable()();
  TextColumn get archivedAt => text().nullable().named('archived_at')();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('CashflowEventRow')
class CashflowEvents extends Table {
  TextColumn get id => text()();
  TextColumn get eventDate => text().named('event_date')();
  TextColumn get occurredAt => text().nullable().named('occurred_at')();
  TextColumn get title => text().nullable()();
  TextColumn get counterparty => text().nullable()();
  TextColumn get description => text().nullable()();
  TextColumn get amount => text()();
  TextColumn get currency => text()();
  TextColumn get direction => text()();
  TextColumn get flowKind => text().named('flow_kind')();
  TextColumn get categoryId => text().nullable().named('category_id')();
  TextColumn get sourceKind => text().named('source_kind')();
  TextColumn get sourceName => text().nullable().named('source_name')();
  TextColumn get paymentMethod => text().nullable().named('payment_method')();
  TextColumn get accountHint => text().nullable().named('account_hint')();
  BoolColumn get includeInAnalytics =>
      boolean().named('include_in_analytics')();
  TextColumn get status => text()();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('CashflowEventTagRow')
class CashflowEventTags extends Table {
  TextColumn get cashflowEventId => text().named('cashflow_event_id')();
  TextColumn get tagId => text().named('tag_id')();

  @override
  Set<Column<Object>> get primaryKey => {cashflowEventId, tagId};
}

@DataClassName('AssetItemRow')
class AssetItems extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get assetType => text().named('asset_type')();
  TextColumn get institution => text().nullable()();
  TextColumn get defaultCurrency => text().named('default_currency')();
  TextColumn get valuationMethod => text().named('valuation_method')();
  TextColumn get archivedAt => text().nullable().named('archived_at')();
  IntColumn get displayOrder => integer().named('display_order')();
  TextColumn get note => text().nullable()();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('AssetSnapshotRow')
class AssetSnapshots extends Table {
  TextColumn get id => text()();
  TextColumn get assetItemId => text().named('asset_item_id')();
  TextColumn get snapshotAt => text().named('snapshot_at')();
  TextColumn get valueAmount => text().named('value_amount')();
  TextColumn get valueCurrency => text().named('value_currency')();
  TextColumn get note => text().nullable()();
  TextColumn get createdAt => text().named('created_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('SubscriptionRow')
class Subscriptions extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get merchant => text().nullable()();
  TextColumn get amount => text()();
  TextColumn get currency => text()();
  TextColumn get billingCycle => text().named('billing_cycle')();
  IntColumn get intervalCount => integer().named('interval_count')();
  TextColumn get nextChargeDate => text().named('next_charge_date')();
  BoolColumn get autoRenew => boolean().named('auto_renew')();
  TextColumn get categoryId => text().nullable().named('category_id')();
  TextColumn get status => text()();
  TextColumn get note => text().nullable()();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('SubscriptionOccurrenceRow')
class SubscriptionOccurrences extends Table {
  TextColumn get id => text()();
  TextColumn get subscriptionId => text().named('subscription_id')();
  TextColumn get dueDate => text().named('due_date')();
  TextColumn get amount => text()();
  TextColumn get currency => text()();
  TextColumn get status => text()();
  TextColumn get createdAt => text().named('created_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('LoanRow')
class Loans extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get lender => text().nullable()();
  TextColumn get currency => text()();
  TextColumn get principalAmount =>
      text().nullable().named('principal_amount')();
  TextColumn get currentPrincipalEstimate =>
      text().nullable().named('current_principal_estimate')();
  IntColumn get annualRateBps =>
      integer().nullable().named('annual_rate_bps')();
  TextColumn get repaymentMethod =>
      text().nullable().named('repayment_method')();
  TextColumn get paymentAmount => text().named('payment_amount')();
  IntColumn get paymentDay => integer().nullable().named('payment_day')();
  TextColumn get startDate => text().named('start_date')();
  IntColumn get termMonths => integer().nullable().named('term_months')();
  TextColumn get status => text()();
  TextColumn get note => text().nullable()();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('LoanPaymentOccurrenceRow')
class LoanPaymentOccurrences extends Table {
  TextColumn get id => text()();
  TextColumn get loanId => text().named('loan_id')();
  TextColumn get dueDate => text().named('due_date')();
  TextColumn get paymentAmount => text().named('payment_amount')();
  TextColumn get remainingPrincipalEstimate =>
      text().nullable().named('remaining_principal_estimate')();
  TextColumn get status => text()();
  TextColumn get createdAt => text().named('created_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('BudgetSetRow')
class BudgetSets extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get status => text()();
  TextColumn get createdAt => text().named('created_at')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('BudgetPeriodRow')
class BudgetPeriods extends Table {
  TextColumn get id => text()();
  TextColumn get budgetSetId => text().named('budget_set_id')();
  TextColumn get periodKind => text().named('period_kind')();
  TextColumn get periodStart => text().named('period_start')();
  TextColumn get periodEnd => text().named('period_end')();
  TextColumn get currency => text()();
  TextColumn get status => text()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('BudgetItemRow')
class BudgetItems extends Table {
  TextColumn get id => text()();
  TextColumn get budgetPeriodId => text().named('budget_period_id')();
  TextColumn get name => text()();
  TextColumn get itemKind => text().named('item_kind')();
  TextColumn get plannedAmount => text().named('planned_amount')();
  TextColumn get currency => text()();
  TextColumn get categoryId => text().nullable().named('category_id')();
  TextColumn get status => text()();
  TextColumn get note => text().nullable()();
  TextColumn get color => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('CurrencySettingRow')
class CurrencySettings extends Table {
  TextColumn get id => text()();
  TextColumn get displayCurrency => text().named('display_currency')();
  TextColumn get updatedAt => text().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DataClassName('ExchangeRateRow')
class ExchangeRates extends Table {
  TextColumn get id => text()();
  TextColumn get fromCurrency => text().named('from_currency')();
  TextColumn get toCurrency => text().named('to_currency')();
  TextColumn get rateDate => text().named('rate_date')();
  TextColumn get rate => text()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DriftDatabase(
  tables: [
    Categories,
    Tags,
    CashflowEvents,
    CashflowEventTags,
    AssetItems,
    AssetSnapshots,
    Subscriptions,
    SubscriptionOccurrences,
    Loans,
    LoanPaymentOccurrences,
    BudgetSets,
    BudgetPeriods,
    BudgetItems,
    CurrencySettings,
    ExchangeRates,
  ],
)
class FlowmDatabase extends _$FlowmDatabase {
  FlowmDatabase(super.executor);

  factory FlowmDatabase.openReadOnly(File file) {
    final raw = sqlite.sqlite3.open(file.path, mode: sqlite.OpenMode.readOnly);
    return FlowmDatabase(
      NativeDatabase.opened(
        raw,
        enableMigrations: false,
        closeUnderlyingOnClose: true,
      ),
    );
  }

  @override
  int get schemaVersion => 1;
}
