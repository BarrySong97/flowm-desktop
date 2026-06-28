/*
 * @purpose Read-only Flowm mobile screens based on the Desktop-derived reference UI.
 * @role    Defines Dashboard, spending, budget, fixed-cost, and asset screens.
 * @deps    demo_data.dart, format.dart, theme.dart, ui_components.dart.
 * @gotcha  Do not add edit, create, import, delete, export, or reset affordances here.
 */
import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'demo_data.dart';
import 'format.dart';
import 'read_only_pages.dart';
import 'theme.dart';
import 'ui_components.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final netGain = (DemoData.netTrend.last - DemoData.netTrend.first) * 10000;
    final budgetRemain = DemoData.budgetTotal - DemoData.budgetSpent;
    final budgetUsed = DemoData.budgetTotal <= 0
        ? 0
        : DemoData.budgetSpent / DemoData.budgetTotal;

    return FlowmPage(
      children: [
        PageHeader(
          title: '看板',
          subtitle: DemoData.dashboardSubtitle,
          trailing: const SyncBadge(),
        ),
        SummaryHeroSection(
          kicker: '净资产',
          amount: DemoData.netWorth,
          amountSize: 42,
          padding: FlowmSpacing.heroPaddingLarge,
          detail: Row(
            children: [
              Sparkline(data: DemoData.netTrend),
              const SizedBox(width: FlowmSpacing.md),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    children: [
                      const TextSpan(text: '近 12 月 '),
                      TextSpan(
                        text: '+${money(netGain)}',
                        style: monoStyle(
                          size: 11.5,
                          weight: FontWeight.w600,
                          color: FlowmColors.accent,
                        ),
                      ),
                    ],
                  ),
                  style: FlowmTextStyles.bodyMeta,
                ),
              ),
            ],
          ),
          stats: [
            MetricStat.money(label: '流动资产', value: DemoData.liquidAssets),
            MetricStat.money(label: '总资产', value: DemoData.totalAssets),
            MetricStat.money(label: '欠款', value: DemoData.totalLiabilities),
          ],
        ),
        DividedSection(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 18),
            child: Column(
              children: [
                Row(
                  children: [
                    const Text(
                      '本月动向',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      '过去 30 天 · 每日支出',
                      style: TextStyle(color: FlowmColors.ink3, fontSize: 11),
                    ),
                    const Spacer(),
                    Text(
                      '-${money(DemoData.monthOut)}',
                      style: monoStyle(size: 12.5, weight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                DayBarsChart(data: DemoData.dailySpend),
                const SizedBox(height: 7),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '30 天前',
                      style: TextStyle(color: FlowmColors.ink3, fontSize: 10),
                    ),
                    Text(
                      '今天',
                      style: TextStyle(color: FlowmColors.ink3, fontSize: 10),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        SectionBlock(
          title: '本月',
          more: '日历摘要',
          child: Row(
            children: [
              CashStat(
                label: '收入',
                value: '+${money(DemoData.monthIn)}',
                color: FlowmColors.accent,
              ),
              CashStat(
                label: '支出',
                value: '-${money(DemoData.monthOut)}',
                color: FlowmColors.ink,
                border: true,
              ),
              CashStat(
                label: '结余',
                value: signedMoney(DemoData.monthNet),
                color: FlowmColors.accent,
                border: true,
              ),
            ],
          ),
        ),
        SectionBlock(
          title: '本月预算',
          more: '只读',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    money(budgetRemain),
                    style: monoStyle(size: 30, weight: FontWeight.w600),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    '还能花',
                    style: TextStyle(color: FlowmColors.ink3, fontSize: 12),
                  ),
                  const Spacer(),
                  Text(
                    '已用 ${(budgetUsed * 100).round()}%',
                    style: const TextStyle(
                      color: FlowmColors.ink3,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ProgressBar(
                percent: budgetUsed.toDouble(),
                color: budgetRemain < 0 ? FlowmColors.red : FlowmColors.accent,
              ),
            ],
          ),
        ),
        SectionBlock(
          title: '即将扣费',
          more: '未来 30 天',
          last: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    money(DemoData.upcomingTotal),
                    style: monoStyle(size: 22, weight: FontWeight.w600),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${DemoData.upcoming.length} 笔',
                    style: const TextStyle(
                      color: FlowmColors.ink3,
                      fontSize: 11.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              for (var i = 0; i < DemoData.upcoming.take(3).length; i++)
                _UpcomingRow(item: DemoData.upcoming[i], first: i == 0),
            ],
          ),
        ),
      ],
    );
  }
}

class AssetsScreen extends StatelessWidget {
  const AssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const preferredGroups = ['现金', '投资', '不动产', '实物', '其他'];
    final availableGroups = {
      for (final account in DemoData.accounts) account.group,
    };
    final groups = [
      for (final group in preferredGroups)
        if (availableGroups.contains(group)) group,
      for (final group in availableGroups)
        if (!preferredGroups.contains(group)) group,
    ];

    return FlowmPage(
      children: [
        const PageHeader(title: '资产', subtitle: '现在大概有多少'),
        SummaryHeroSection(
          kicker: '净资产',
          amount: DemoData.netWorth,
          amountSize: 38,
          stats: [
            MetricStat.money(label: '总资产', value: DemoData.totalAssets),
            MetricStat.money(label: '欠款', value: DemoData.totalLiabilities),
            MetricStat.money(label: '流动', value: DemoData.liquidAssets),
          ],
        ),
        for (var groupIndex = 0; groupIndex < groups.length; groupIndex++)
          _AccountGroup(
            title: groups[groupIndex],
            accounts: DemoData.accounts
                .where((account) => account.group == groups[groupIndex])
                .toList(),
            last: groupIndex == groups.length - 1,
          ),
        SectionBlock(
          title: '负债快照',
          more: '仅展示',
          last: true,
          child: Column(
            children: [
              for (var i = 0; i < DemoData.liabilityAccounts.length; i++)
                _AccountRow(
                  account: DemoData.liabilityAccounts[i],
                  first: i == 0,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late CalendarDaySummary _selectedDay = _initialSelectedDay();

  CalendarDaySummary _initialSelectedDay() {
    final activeDays =
        DemoData.calendarDays.where((day) => day.hasActivity).toList()
          ..sort((a, b) => b.date.compareTo(a.date));
    if (activeDays.isNotEmpty) return activeDays.first;
    return DemoData.calendarDays.isNotEmpty
        ? DemoData.calendarDays.first
        : const CalendarDaySummary(
            year: 2026,
            month: 6,
            day: 1,
            spend: 0,
            income: 0,
          );
  }

  @override
  Widget build(BuildContext context) {
    final days = DemoData.calendarDays;
    final maxSpend = days.fold<num>(1, (max, day) => math.max(max, day.spend));
    final spendDays = days.where((day) => day.spend > 0).length;
    final dailyAverage = days.isEmpty ? 0 : DemoData.monthOut / days.length;
    final peakDay = days.fold<CalendarDaySummary?>(
      null,
      (peak, day) => peak == null || day.spend > peak.spend ? day : peak,
    );

    return FlowmPage(
      children: [
        PageHeader(
          title: '花费',
          subtitle: '${DemoData.calendarMonthLabel} · 每日花费',
        ),
        DividedSection(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
            child: Row(
              children: [
                CashStat(
                  label: '本月支出',
                  value: '-${money(DemoData.monthOut)}',
                  color: FlowmColors.ink,
                ),
                CashStat(
                  label: '日均',
                  value: money(dailyAverage),
                  color: FlowmColors.ink,
                  border: true,
                ),
                CashStat(
                  label: '有支出',
                  value: '$spendDays 天',
                  color: FlowmColors.accent,
                  border: true,
                ),
              ],
            ),
          ),
        ),
        SectionBlock(
          title: '每日花费',
          more: peakDay == null
              ? null
              : '最高 ${peakDay.month}/${peakDay.day} · ${money(peakDay.spend)}',
          child: _MonthSpendCalendar(
            days: days,
            selected: _selectedDay,
            maxSpend: maxSpend,
            onSelect: (day) => setState(() => _selectedDay = day),
          ),
        ),
        SectionBlock(
          title: '${_selectedDay.month}月${_selectedDay.day}日',
          more: _selectedDay.hasActivity ? '当天摘要' : '无记录',
          last: true,
          child: _DaySummary(day: _selectedDay),
        ),
      ],
    );
  }
}

class BudgetScreen extends StatelessWidget {
  const BudgetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final remain = DemoData.budgetTotal - DemoData.budgetSpent;
    final used = DemoData.budgetTotal <= 0
        ? 0
        : DemoData.budgetSpent / DemoData.budgetTotal;
    final rows = [...DemoData.budgets]
      ..sort((a, b) {
        final bRatio = b.limit <= 0 ? 0 : b.spent / b.limit;
        final aRatio = a.limit <= 0 ? 0 : a.spent / a.limit;
        return bRatio.compareTo(aRatio);
      });

    return FlowmPage(
      children: [
        const PageHeader(title: '预算', subtitle: '有没有超支 · 只读'),
        SummaryHeroSection(
          kicker: remain < 0 ? '本月超支' : '本月还能花',
          amount: remain.abs(),
          amountSize: 38,
          amountColor: remain < 0 ? FlowmColors.red : FlowmColors.ink,
          detailGap: FlowmSpacing.lg,
          detail: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '已用 ${money(DemoData.budgetSpent)} / ${fmt(DemoData.budgetTotal)} · ${(used * 100).round()}%',
                style: FlowmTextStyles.bodyMeta,
              ),
              const SizedBox(height: FlowmSpacing.xl),
              ProgressBar(
                percent: used.toDouble(),
                color: remain < 0 ? FlowmColors.red : FlowmColors.accent,
              ),
            ],
          ),
          stats: [
            MetricStat.money(label: '总预算', value: DemoData.budgetTotal),
            MetricStat.money(label: '已花', value: DemoData.budgetSpent),
            MetricStat(label: '分类', valueText: '${DemoData.budgets.length}'),
          ],
        ),
        DividedSection(
          last: true,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Column(
              children: [
                for (var i = 0; i < rows.length; i++)
                  _BudgetTabRow(item: rows[i], first: i == 0),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class FixedScreen extends StatelessWidget {
  const FixedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final loanMonthly = DemoData.liabilities.fold<num>(
      0,
      (sum, item) => sum + item.monthly,
    );
    final monthly = DemoData.subscriptionMonthly + loanMonthly;
    final yearly = monthly * 12;

    return FlowmPage(
      children: [
        const PageHeader(title: '固定', subtitle: '订阅和贷款 · 只读'),
        SummaryHeroSection(
          kicker: '每月固定支出',
          amount: monthly,
          amountSize: 38,
          stats: [
            MetricStat.money(
              label: '订阅/月',
              value: DemoData.subscriptionMonthly,
            ),
            MetricStat.money(label: '贷款/月', value: loanMonthly),
            MetricStat.money(label: '折年', value: yearly),
          ],
        ),
        SectionBlock(
          title: '接下来要付',
          more: '未来 30 天',
          child: Column(
            children: [
              for (var i = 0; i < DemoData.upcoming.length; i++)
                _UpcomingRow(item: DemoData.upcoming[i], first: i == 0),
            ],
          ),
        ),
        SectionBlock(
          title: '订阅',
          more: '${DemoData.subscriptions.length} 项',
          child: Column(
            children: [
              for (var i = 0; i < DemoData.subscriptions.length; i++)
                _FixedSubscriptionRow(
                  item: DemoData.subscriptions[i],
                  first: i == 0,
                ),
            ],
          ),
        ),
        SectionBlock(
          title: '贷款',
          more: '${DemoData.liabilities.length} 项',
          last: true,
          child: Column(
            children: [
              for (var i = 0; i < DemoData.liabilities.length; i++)
                _FixedLoanRow(item: DemoData.liabilities[i], first: i == 0),
            ],
          ),
        ),
      ],
    );
  }
}

class _BudgetTabRow extends StatelessWidget {
  const _BudgetTabRow({required this.item, required this.first});

  final BudgetItem item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    final used = item.limit <= 0 ? 0 : item.spent / item.limit;
    final remain = item.limit - item.spent;
    final over = remain < 0;

    return FlowmListRow(
      title: DemoData.categoryName(item.category),
      subtitle: over ? '超支 ${money(remain.abs())}' : '剩余 ${money(remain)}',
      value: '${(used * 100).round()}%',
      first: first,
      leading: ColorDot(color: DemoData.categoryColor(item.category)),
      bottom: ProgressBar(
        percent: used.toDouble(),
        color: over ? FlowmColors.red : DemoData.categoryColor(item.category),
      ),
      onTap: () =>
          pushReadOnlyPage(context, BudgetDetailPageMobile(item: item)),
    );
  }
}

class _FixedSubscriptionRow extends StatelessWidget {
  const _FixedSubscriptionRow({required this.item, required this.first});

  final SubscriptionItem item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    return FlowmListRow(
      title: item.name,
      subtitle: '${DemoData.categoryName(item.category)} · 下次 ${item.next}',
      titleMeta: item.cycle,
      value: money(item.amount),
      first: first,
      leading: ColorDot(color: DemoData.categoryColor(item.category)),
      onTap: () =>
          pushReadOnlyPage(context, SubscriptionDetailPageMobile(item: item)),
    );
  }
}

class _FixedLoanRow extends StatelessWidget {
  const _FixedLoanRow({required this.item, required this.first});

  final Liability item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    final paid = item.total <= 0 ? 0 : 1 - item.remaining / item.total;

    return FlowmListRow(
      title: item.name,
      subtitle: '${item.bank} · 剩 ${item.termLeft} 期',
      value: money(item.monthly),
      first: first,
      leading: const ColorDot(color: FlowmColors.amber),
      bottom: ProgressBar(percent: paid.toDouble(), color: FlowmColors.amber),
      onTap: () => pushReadOnlyPage(context, LoanDetailPageMobile(item: item)),
    );
  }
}

class _MonthSpendCalendar extends StatelessWidget {
  const _MonthSpendCalendar({
    required this.days,
    required this.selected,
    required this.maxSpend,
    required this.onSelect,
  });

  final List<CalendarDaySummary> days;
  final CalendarDaySummary selected;
  final num maxSpend;
  final ValueChanged<CalendarDaySummary> onSelect;

  @override
  Widget build(BuildContext context) {
    if (days.isEmpty) {
      return const Text('暂无日历数据', style: FlowmTextStyles.bodyMeta);
    }

    final firstDay = days.first.date;
    final leadingBlanks = firstDay.weekday - 1;
    final cells = <Widget>[
      for (final label in const ['一', '二', '三', '四', '五', '六', '日'])
        Center(
          child: Text(
            label,
            style: const TextStyle(color: FlowmColors.ink4, fontSize: 10),
          ),
        ),
      for (var i = 0; i < leadingBlanks; i++) const SizedBox.shrink(),
      for (final day in days)
        _CalendarDayCell(
          day: day,
          selected:
              day.year == selected.year &&
              day.month == selected.month &&
              day.day == selected.day,
          maxSpend: maxSpend,
          onTap: () => onSelect(day),
        ),
    ];

    return GridView.count(
      crossAxisCount: 7,
      mainAxisSpacing: 7,
      crossAxisSpacing: 7,
      childAspectRatio: 0.82,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: cells,
    );
  }
}

class _CalendarDayCell extends StatelessWidget {
  const _CalendarDayCell({
    required this.day,
    required this.selected,
    required this.maxSpend,
    required this.onTap,
  });

  final CalendarDaySummary day;
  final bool selected;
  final num maxSpend;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final intensity = day.spend <= 0
        ? 0.0
        : (day.spend / maxSpend).clamp(0, 1).toDouble();
    final background = day.spend <= 0
        ? FlowmColors.surface2
        : Color.lerp(FlowmColors.accentSoft, FlowmColors.accent, intensity)!;
    final foreground = intensity > 0.62 ? Colors.white : FlowmColors.ink;
    final amountColor = day.spend <= 0
        ? FlowmColors.ink4
        : (intensity > 0.62 ? Colors.white : FlowmColors.ink2);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(FlowmRadius.sm),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        padding: const EdgeInsets.fromLTRB(6, 7, 6, 6),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(FlowmRadius.sm),
          border: Border.all(
            color: selected ? FlowmColors.ink : Colors.transparent,
            width: selected ? 1.2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${day.day}',
              style: TextStyle(
                color: foreground,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            Text(
              day.spend <= 0 ? '-' : fmt(day.spend),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: monoStyle(
                size: 9.5,
                weight: day.spend > 0 ? FontWeight.w600 : FontWeight.w400,
                color: amountColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DaySummary extends StatelessWidget {
  const _DaySummary({required this.day});

  final CalendarDaySummary day;

  @override
  Widget build(BuildContext context) {
    final topCategories = day.categorySpend.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CashStat(
              label: '支出',
              value: '-${money(day.spend)}',
              color: FlowmColors.ink,
            ),
            CashStat(
              label: '收入',
              value: '+${money(day.income)}',
              color: FlowmColors.accent,
              border: true,
            ),
            CashStat(
              label: '结余',
              value: signedMoney(day.net),
              color: day.net >= 0 ? FlowmColors.accent : FlowmColors.red,
              border: true,
            ),
          ],
        ),
        const SizedBox(height: FlowmSpacing.xxl),
        if (topCategories.isEmpty)
          const Text('这天没有支出记录', style: FlowmTextStyles.bodyMeta)
        else
          CategoryBars(
            rows: [
              for (final entry in topCategories.take(4))
                (category: entry.key, amount: entry.value),
            ],
            labelFor: DemoData.categoryName,
            colorFor: DemoData.categoryColor,
          ),
      ],
    );
  }
}

class _UpcomingRow extends StatelessWidget {
  const _UpcomingRow({required this.item, required this.first});

  final UpcomingItem item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 9),
      decoration: BoxDecoration(
        border: Border(
          top: first
              ? BorderSide.none
              : const BorderSide(color: FlowmColors.hair3),
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 42,
            child: Text(
              item.date,
              style: monoStyle(size: 11.5, color: FlowmColors.ink3),
            ),
          ),
          ColorDot(
            color: item.kind == '贷款'
                ? FlowmColors.amber
                : FlowmColors.subscription,
            size: 7,
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Text(
              item.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: FlowmColors.ink, fontSize: 13),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            item.kind,
            style: const TextStyle(color: FlowmColors.ink3, fontSize: 10.5),
          ),
          const SizedBox(width: 8),
          Text(money(item.amount), style: monoStyle(size: 13)),
        ],
      ),
    );
  }
}

class _AccountGroup extends StatelessWidget {
  const _AccountGroup({
    required this.title,
    required this.accounts,
    required this.last,
  });

  final String title;
  final List<Account> accounts;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final sum = accounts.fold<num>(
      0,
      (total, account) => total + account.balance,
    );
    return DividedSection(
      last: last,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
        child: Column(
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                Text(
                  money(sum),
                  style: monoStyle(size: 12, color: FlowmColors.ink3),
                ),
              ],
            ),
            const SizedBox(height: 10),
            for (var i = 0; i < accounts.length; i++)
              _AccountRow(account: accounts[i], first: i == 0),
          ],
        ),
      ),
    );
  }
}

class _AccountRow extends StatelessWidget {
  const _AccountRow({required this.account, required this.first});

  final Account account;
  final bool first;

  @override
  Widget build(BuildContext context) {
    return FlowmListRow(
      title: account.name,
      subtitle: account.note,
      value: money(account.balance),
      first: first,
      padding: const EdgeInsets.symmetric(vertical: 11),
      onTap: () => pushReadOnlyPage(context, AssetDetailPage(account: account)),
    );
  }
}
