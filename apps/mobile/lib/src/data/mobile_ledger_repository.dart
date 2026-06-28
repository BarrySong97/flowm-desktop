/*
 * @purpose Map the read-only Desktop SQLite schema into Flowm mobile UI data.
 * @role    Uses Drift typed table access to build display snapshots for screens.
 * @deps    flowm_database.dart, ledger_seed.dart, demo_data.dart.
 * @gotcha  Keep the asymmetric model: net worth liabilities come from asset snapshots, not loan plans.
 */
import 'dart:math' as math;

import 'package:drift/drift.dart';
import 'package:flutter/material.dart';

import '../demo_data.dart';
import '../theme.dart';
import 'flowm_database.dart';
import 'ledger_seed.dart';

class MobileLedgerRepository {
  MobileLedgerRepository(this.db);

  final FlowmDatabase db;

  static Future<MobileLedgerSnapshot> loadBundledDemoLedger() async {
    final file = await seedBundledDemoLedger();
    final db = FlowmDatabase.openReadOnly(file);
    try {
      return await MobileLedgerRepository(db).loadSnapshot();
    } finally {
      await db.close();
    }
  }

  Future<MobileLedgerSnapshot> loadSnapshot() async {
    final categoryRows =
        await (db.select(db.categories)
              ..where((row) => row.archivedAt.isNull())
              ..orderBy([
                (row) => OrderingTerm.asc(row.displayOrder),
                (row) => OrderingTerm.asc(row.name),
              ]))
            .get();
    final categoryMeta = _categoryMeta(categoryRows);

    final rates = await _rates();
    final displayCurrency = rates.displayCurrency;

    final events =
        await (db.select(db.cashflowEvents)
              ..where((row) => row.status.equals('active'))
              ..orderBy([
                (row) => OrderingTerm.desc(row.eventDate),
                (row) => OrderingTerm.desc(row.occurredAt),
              ]))
            .get();
    final anchorDate = events.isEmpty
        ? DateTime.now()
        : _dateOnly(DateTime.parse(events.first.eventDate));
    final monthStart = DateTime(anchorDate.year, anchorDate.month);
    final nextMonth = DateTime(anchorDate.year, anchorDate.month + 1);
    final monthEvents = events
        .where((event) {
          final date = _parseDate(event.eventDate);
          return !date.isBefore(monthStart) && date.isBefore(nextMonth);
        })
        .where((event) => event.includeInAnalytics)
        .toList();

    final monthIn = _sumEvents(
      monthEvents.where((event) => event.direction == 'in'),
      rates.convert,
    );
    final categorySpend = _categorySpend(monthEvents, rates.convert);
    final transactions = await _transactions(
      events,
      categoryMeta,
      rates.convert,
    );

    final assetRows =
        await (db.select(db.assetItems)
              ..where((row) => row.archivedAt.isNull())
              ..orderBy([
                (row) => OrderingTerm.asc(row.displayOrder),
                (row) => OrderingTerm.asc(row.name),
              ]))
            .get();
    final snapshotRows = await (db.select(
      db.assetSnapshots,
    )..orderBy([(row) => OrderingTerm.asc(row.snapshotAt)])).get();
    final assetSnapshot = _assetSnapshot(
      assetRows,
      snapshotRows,
      rates.convert,
    );

    final subscriptions = await _subscriptions(rates.convert);
    final loans = await _loans(rates.convert, anchorDate);
    final budgets = await _budgets(
      anchorDate: anchorDate,
      categoryMeta: categoryMeta,
      events: events,
      convert: rates.convert,
    );
    final upcoming = await _upcoming(rates.convert, anchorDate);
    final tags = await _tags(events.map((event) => event.id).toSet());
    final dailySpend = _dailySpend(events, rates.convert, anchorDate);
    final calendarDays = _calendarDays(monthEvents, rates.convert, anchorDate);

    return MobileLedgerSnapshot(
      accounts: assetSnapshot.assets,
      liabilityAccounts: assetSnapshot.liabilities,
      liabilities: loans,
      subscriptions: subscriptions,
      transactions: transactions,
      categoryMeta: categoryMeta,
      categorySpend: categorySpend,
      budgets: budgets,
      upcoming: upcoming,
      tags: tags,
      netTrend: assetSnapshot.netTrend,
      dailySpend: dailySpend,
      calendarDays: calendarDays,
      monthIn: monthIn,
      dashboardSubtitle: _dashboardSubtitle(anchorDate),
      calendarMonthLabel: '${anchorDate.year} 年 ${anchorDate.month} 月',
      cashflowSubtitle:
          '${anchorDate.month} 月 · ${monthEvents.length} 笔 · $displayCurrency · 只读',
      lastSyncLabel: '${_monthDay(anchorDate)} · Desktop SQLite',
    );
  }

  Future<_Rates> _rates() async {
    final setting = await (db.select(
      db.currencySettings,
    )..limit(1)).getSingleOrNull();
    final displayCurrency = setting?.displayCurrency ?? 'CNY';
    final rows =
        await (db.select(db.exchangeRates)
              ..where((row) => row.toCurrency.equals(displayCurrency))
              ..orderBy([(row) => OrderingTerm.desc(row.rateDate)]))
            .get();
    final rates = <String, num>{displayCurrency: 1};
    for (final row in rows) {
      rates.putIfAbsent(row.fromCurrency, () => _num(row.rate, fallback: 1));
    }
    return _Rates(displayCurrency: displayCurrency, rates: rates);
  }

  Future<List<TransactionItem>> _transactions(
    List<CashflowEventRow> events,
    Map<String, CategoryMeta> categoryMeta,
    num Function(num amount, String currency) convert,
  ) async {
    final eventIds = events.map((event) => event.id).toSet();
    final tagRows = await (db.select(db.cashflowEventTags)).get();
    final tags = await (db.select(
      db.tags,
    )..where((row) => row.archivedAt.isNull())).get();
    final tagNames = {for (final tag in tags) tag.id: tag.name};
    final tagsByEvent = <String, List<String>>{};
    for (final link in tagRows) {
      if (!eventIds.contains(link.cashflowEventId)) continue;
      final name = tagNames[link.tagId];
      if (name == null) continue;
      tagsByEvent.putIfAbsent(link.cashflowEventId, () => []).add(name);
    }

    return events.take(30).map((event) {
      final signed = _signedEventAmount(event, convert);
      return TransactionItem(
        date: _monthDay(_parseDate(event.eventDate)),
        name: event.title ?? event.counterparty ?? event.description ?? '未命名流水',
        category: event.categoryId ?? 'other',
        source:
            event.accountHint ??
            event.paymentMethod ??
            event.sourceName ??
            'Desktop',
        amount: signed,
        tags: tagsByEvent[event.id] ?? const [],
      );
    }).toList();
  }

  _AssetSnapshot _assetSnapshot(
    List<AssetItemRow> items,
    List<AssetSnapshotRow> snapshots,
    num Function(num amount, String currency) convert,
  ) {
    final byItem = <String, List<AssetSnapshotRow>>{};
    for (final snapshot in snapshots) {
      byItem.putIfAbsent(snapshot.assetItemId, () => []).add(snapshot);
    }

    final assets = <Account>[];
    final liabilities = <Account>[];

    for (final item in items) {
      final itemSnapshots = byItem[item.id] ?? const <AssetSnapshotRow>[];
      if (itemSnapshots.isEmpty) continue;
      final sorted = [...itemSnapshots]
        ..sort((a, b) => a.snapshotAt.compareTo(b.snapshotAt));
      final latest = sorted.last;
      final balance = convert(_num(latest.valueAmount), latest.valueCurrency);
      final trend = sorted.map((snapshot) {
        return convert(_num(snapshot.valueAmount), snapshot.valueCurrency) /
            1000;
      }).toList();
      final account = Account(
        id: item.id,
        name: item.name,
        group: _assetGroup(item.assetType),
        balance: balance,
        kind: item.assetType == 'liability'
            ? 'liability'
            : (_isLiquidAsset(item.assetType) ? 'liquid' : 'illiquid'),
        note: item.institution ?? item.note ?? item.defaultCurrency,
        trend: trend,
      );

      if (item.assetType == 'liability') {
        liabilities.add(account);
      } else {
        assets.add(account);
      }
    }

    final netByMonth = <String, num>{};
    final itemType = {for (final item in items) item.id: item.assetType};
    for (final snapshot in snapshots) {
      final month = snapshot.snapshotAt.substring(0, 7);
      final signed = itemType[snapshot.assetItemId] == 'liability' ? -1 : 1;
      netByMonth.update(
        month,
        (sum) =>
            sum +
            signed *
                convert(_num(snapshot.valueAmount), snapshot.valueCurrency),
        ifAbsent: () =>
            signed *
            convert(_num(snapshot.valueAmount), snapshot.valueCurrency),
      );
    }
    final trend = netByMonth.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    final netTrend = trend.isEmpty
        ? DemoData.netTrend
        : trend.map((entry) => entry.value / 10000).toList();

    return _AssetSnapshot(
      assets: assets,
      liabilities: liabilities,
      netTrend: netTrend,
    );
  }

  Future<List<SubscriptionItem>> _subscriptions(
    num Function(num amount, String currency) convert,
  ) async {
    final rows =
        await (db.select(db.subscriptions)
              ..where((row) => row.status.equals('active'))
              ..orderBy([(row) => OrderingTerm.asc(row.nextChargeDate)]))
            .get();
    return rows.map((row) {
      return SubscriptionItem(
        name: row.name,
        category: row.categoryId ?? 'other',
        cycle: _cycleLabel(row.billingCycle),
        amount: convert(_num(row.amount), row.currency),
        next: _monthDay(_parseDate(row.nextChargeDate)),
      );
    }).toList();
  }

  Future<List<Liability>> _loans(
    num Function(num amount, String currency) convert,
    DateTime anchorDate,
  ) async {
    final rows =
        await (db.select(db.loans)
              ..where((row) => row.status.equals('active'))
              ..orderBy([(row) => OrderingTerm.asc(row.startDate)]))
            .get();
    final occurrences = await (db.select(db.loanPaymentOccurrences)).get();
    final byLoan = <String, List<LoanPaymentOccurrenceRow>>{};
    for (final occurrence in occurrences) {
      byLoan.putIfAbsent(occurrence.loanId, () => []).add(occurrence);
    }

    return rows.map((row) {
      final futureCount = (byLoan[row.id] ?? const <LoanPaymentOccurrenceRow>[])
          .where(
            (occurrence) =>
                !_parseDate(occurrence.dueDate).isBefore(anchorDate),
          )
          .length;
      return Liability(
        name: row.name,
        bank: row.lender ?? 'Desktop',
        remaining: convert(
          _num(row.currentPrincipalEstimate ?? row.principalAmount),
          row.currency,
        ),
        total: convert(_num(row.principalAmount), row.currency),
        monthly: convert(_num(row.paymentAmount), row.currency),
        rate: (row.annualRateBps ?? 0) / 100,
        termLeft: futureCount == 0 ? (row.termMonths ?? 0) : futureCount,
      );
    }).toList();
  }

  Future<List<BudgetItem>> _budgets({
    required DateTime anchorDate,
    required Map<String, CategoryMeta> categoryMeta,
    required List<CashflowEventRow> events,
    required num Function(num amount, String currency) convert,
  }) async {
    final periods =
        await (db.select(db.budgetPeriods)
              ..where((row) => row.status.equals('active'))
              ..orderBy([(row) => OrderingTerm.desc(row.periodStart)]))
            .get();
    if (periods.isEmpty) return DemoData.budgets;

    final period = periods.firstWhere((row) {
      final start = _parseDate(row.periodStart);
      final end = _parseDate(row.periodEnd);
      return !anchorDate.isBefore(start) && !anchorDate.isAfter(end);
    }, orElse: () => periods.first);
    final items =
        await (db.select(db.budgetItems)..where(
              (row) =>
                  row.budgetPeriodId.equals(period.id) &
                  row.status.equals('active'),
            ))
            .get();

    final start = _parseDate(period.periodStart);
    final end = _parseDate(period.periodEnd).add(const Duration(days: 1));
    final outEvents = events.where((event) {
      final date = _parseDate(event.eventDate);
      return event.direction == 'out' &&
          event.includeInAnalytics &&
          !date.isBefore(start) &&
          date.isBefore(end);
    });
    final spendByCategory = <String, num>{};
    num totalSpend = 0;
    for (final event in outEvents) {
      final value = convert(_num(event.amount), event.currency);
      totalSpend += value;
      final key = event.categoryId ?? 'other';
      spendByCategory.update(key, (sum) => sum + value, ifAbsent: () => value);
    }

    final result = <BudgetItem>[];
    for (final item in items) {
      final key = item.categoryId ?? 'budget:${item.id}';
      if (item.categoryId == null) {
        categoryMeta[key] = CategoryMeta(
          name: item.name,
          color: _colorFromHex(item.color) ?? FlowmColors.other,
        );
      }
      result.add(
        BudgetItem(
          category: key,
          limit: convert(_num(item.plannedAmount), item.currency),
          spent: item.categoryId == null
              ? totalSpend
              : (spendByCategory[item.categoryId] ?? 0),
        ),
      );
    }

    result.sort(
      (a, b) => (b.spent / math.max(b.limit, 1)).compareTo(
        a.spent / math.max(a.limit, 1),
      ),
    );
    return result;
  }

  Future<List<UpcomingItem>> _upcoming(
    num Function(num amount, String currency) convert,
    DateTime anchorDate,
  ) async {
    final subRows = await (db.select(
      db.subscriptions,
    )..where((row) => row.status.equals('active'))).get();
    final subNames = {for (final row in subRows) row.id: row.name};
    final subOccurrences = await (db.select(
      db.subscriptionOccurrences,
    )..where((row) => row.status.equals('forecast'))).get();

    final loanRows = await (db.select(
      db.loans,
    )..where((row) => row.status.equals('active'))).get();
    final loanNames = {for (final row in loanRows) row.id: row.name};
    final loanCurrencies = {for (final row in loanRows) row.id: row.currency};
    final loanOccurrences = await (db.select(
      db.loanPaymentOccurrences,
    )..where((row) => row.status.equals('forecast'))).get();

    final through = anchorDate.add(const Duration(days: 30));
    final items = <_UpcomingCandidate>[];
    for (final occurrence in subOccurrences) {
      final due = _parseDate(occurrence.dueDate);
      if (due.isBefore(anchorDate) || due.isAfter(through)) continue;
      items.add(
        _UpcomingCandidate(
          due: due,
          item: UpcomingItem(
            date: _monthDay(due),
            name: subNames[occurrence.subscriptionId] ?? '订阅扣费',
            amount: convert(_num(occurrence.amount), occurrence.currency),
            kind: '订阅',
          ),
        ),
      );
    }
    for (final occurrence in loanOccurrences) {
      final due = _parseDate(occurrence.dueDate);
      if (due.isBefore(anchorDate) || due.isAfter(through)) continue;
      items.add(
        _UpcomingCandidate(
          due: due,
          item: UpcomingItem(
            date: _monthDay(due),
            name: '${loanNames[occurrence.loanId] ?? '贷款'} 月供',
            amount: convert(
              _num(occurrence.paymentAmount),
              loanCurrencies[occurrence.loanId] ?? 'CNY',
            ),
            kind: '贷款',
          ),
        ),
      );
    }
    items.sort((a, b) => a.due.compareTo(b.due));
    return items.take(8).map((candidate) => candidate.item).toList();
  }

  Future<List<TagItem>> _tags(Set<String> activeEventIds) async {
    final tagRows = await (db.select(
      db.tags,
    )..where((row) => row.archivedAt.isNull())).get();
    final links = await (db.select(db.cashflowEventTags)).get();
    final counts = <String, int>{};
    for (final link in links) {
      if (!activeEventIds.contains(link.cashflowEventId)) continue;
      counts.update(link.tagId, (count) => count + 1, ifAbsent: () => 1);
    }
    final items = [
      for (final tag in tagRows)
        if ((counts[tag.id] ?? 0) > 0)
          TagItem(name: tag.name, count: counts[tag.id] ?? 0),
    ]..sort((a, b) => b.count.compareTo(a.count));
    return items.take(8).toList();
  }
}

Map<String, CategoryMeta> _categoryMeta(List<CategoryRow> rows) {
  final result = <String, CategoryMeta>{
    'other': const CategoryMeta(name: '其他', color: FlowmColors.other),
  };
  for (final row in rows) {
    result[row.id] = CategoryMeta(
      name: row.name,
      color: _colorFromHex(row.color) ?? FlowmColors.other,
    );
  }
  return result;
}

List<CategorySpend> _categorySpend(
  List<CashflowEventRow> monthEvents,
  num Function(num amount, String currency) convert,
) {
  final byCategory = <String, num>{};
  for (final event in monthEvents) {
    if (event.direction != 'out') continue;
    final key = event.categoryId ?? 'other';
    byCategory.update(
      key,
      (sum) => sum + convert(_num(event.amount), event.currency),
      ifAbsent: () => convert(_num(event.amount), event.currency),
    );
  }
  final rows =
      byCategory.entries
          .map(
            (entry) => CategorySpend(category: entry.key, amount: entry.value),
          )
          .toList()
        ..sort((a, b) => b.amount.compareTo(a.amount));
  return rows;
}

List<num> _dailySpend(
  List<CashflowEventRow> events,
  num Function(num amount, String currency) convert,
  DateTime anchorDate,
) {
  final start = anchorDate.subtract(const Duration(days: 29));
  final byDay = <String, num>{};
  for (final event in events) {
    final date = _parseDate(event.eventDate);
    if (date.isBefore(start) || date.isAfter(anchorDate)) continue;
    if (event.direction != 'out' || !event.includeInAnalytics) continue;
    final key = _dateKey(date);
    byDay.update(
      key,
      (sum) => sum + convert(_num(event.amount), event.currency),
      ifAbsent: () => convert(_num(event.amount), event.currency),
    );
  }
  return [
    for (var i = 0; i < 30; i++)
      byDay[_dateKey(start.add(Duration(days: i)))] ?? 0,
  ];
}

List<CalendarDaySummary> _calendarDays(
  List<CashflowEventRow> monthEvents,
  num Function(num amount, String currency) convert,
  DateTime anchorDate,
) {
  final daysInMonth = DateTime(anchorDate.year, anchorDate.month + 1, 0).day;
  final spendByDay = <int, num>{};
  final incomeByDay = <int, num>{};
  final categoryByDay = <int, Map<String, num>>{};

  for (final event in monthEvents) {
    if (!event.includeInAnalytics) continue;
    final date = _parseDate(event.eventDate);
    final amount = convert(_num(event.amount), event.currency);
    if (event.direction == 'out') {
      spendByDay.update(
        date.day,
        (sum) => sum + amount,
        ifAbsent: () => amount,
      );
      final category = event.categoryId ?? 'other';
      categoryByDay
          .putIfAbsent(date.day, () => {})
          .update(category, (sum) => sum + amount, ifAbsent: () => amount);
    } else if (event.direction == 'in') {
      incomeByDay.update(
        date.day,
        (sum) => sum + amount,
        ifAbsent: () => amount,
      );
    }
  }

  return [
    for (var day = 1; day <= daysInMonth; day++)
      CalendarDaySummary(
        year: anchorDate.year,
        month: anchorDate.month,
        day: day,
        spend: spendByDay[day] ?? 0,
        income: incomeByDay[day] ?? 0,
        categorySpend: categoryByDay[day] ?? const {},
      ),
  ];
}

num _sumEvents(
  Iterable<CashflowEventRow> events,
  num Function(num amount, String currency) convert,
) {
  return events.fold<num>(
    0,
    (sum, event) => sum + convert(_num(event.amount), event.currency),
  );
}

num _signedEventAmount(
  CashflowEventRow event,
  num Function(num amount, String currency) convert,
) {
  final value = convert(_num(event.amount), event.currency);
  if (event.direction == 'in') return value;
  if (event.direction == 'out') return -value;
  return 0;
}

String _assetGroup(String type) {
  return switch (type) {
    'cash' || 'bank' || 'wallet' => '现金',
    'brokerage' || 'fund' || 'stock' || 'crypto' => '投资',
    'real_estate' => '不动产',
    'vehicle' || 'fixed_asset' => '实物',
    'liability' => '负债',
    _ => '其他',
  };
}

bool _isLiquidAsset(String type) {
  return const {
    'cash',
    'bank',
    'wallet',
    'brokerage',
    'fund',
    'stock',
    'crypto',
  }.contains(type);
}

String _cycleLabel(String cycle) {
  return switch (cycle) {
    'weekly' => '周',
    'monthly' => '月',
    'yearly' => '年',
    _ => '期',
  };
}

num _num(String? value, {num fallback = 0}) {
  if (value == null) return fallback;
  return num.tryParse(value) ?? fallback;
}

Color? _colorFromHex(String? value) {
  if (value == null || value.isEmpty) return null;
  final normalized = value.startsWith('#') ? value.substring(1) : value;
  final parsed = int.tryParse(normalized, radix: 16);
  if (parsed == null) return null;
  return Color(0xFF000000 | parsed);
}

DateTime _parseDate(String value) {
  return _dateOnly(DateTime.parse(value));
}

DateTime _dateOnly(DateTime value) {
  return DateTime(value.year, value.month, value.day);
}

String _dateKey(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  return '${value.year}-$month-$day';
}

String _monthDay(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  return '$month-$day';
}

String _dashboardSubtitle(DateTime date) {
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return '${date.month}月${date.day}日 · ${weekdays[date.weekday - 1]}';
}

class _Rates {
  const _Rates({required this.displayCurrency, required this.rates});

  final String displayCurrency;
  final Map<String, num> rates;

  num convert(num amount, String currency) {
    return amount * (rates[currency] ?? 1);
  }
}

class _AssetSnapshot {
  const _AssetSnapshot({
    required this.assets,
    required this.liabilities,
    required this.netTrend,
  });

  final List<Account> assets;
  final List<Account> liabilities;
  final List<num> netTrend;
}

class _UpcomingCandidate {
  const _UpcomingCandidate({required this.due, required this.item});

  final DateTime due;
  final UpcomingItem item;
}
