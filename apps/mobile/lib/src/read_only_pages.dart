/*
 * @purpose Secondary read-only Flowm mobile pages.
 * @role    Adds subscriptions, loans, budget, reports, and detail display pages.
 * @deps    demo_data.dart, format.dart, theme.dart, ui_components.dart.
 * @gotcha  These pages are display/query-only; do not add mutation controls.
 */
import 'package:flutter/material.dart';

import 'demo_data.dart';
import 'format.dart';
import 'theme.dart';
import 'ui_components.dart';

void pushReadOnlyPage(BuildContext context, Widget page) {
  Navigator.of(context).push(
    MaterialPageRoute<void>(builder: (_) => page, fullscreenDialog: false),
  );
}

class ReadOnlyDetailPage extends StatelessWidget {
  const ReadOnlyDetailPage({
    super.key,
    required this.title,
    this.subtitle,
    required this.children,
  });

  final String title;
  final String? subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FlowmColors.surface,
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.only(
            top: FlowmSpacing.md,
            bottom: FlowmSizes.detailBottomPadding,
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                FlowmSpacing.xl,
                FlowmSpacing.none,
                FlowmSpacing.pageX,
                FlowmSpacing.xxl,
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.chevron_left_rounded),
                    color: FlowmColors.ink2,
                    style: IconButton.styleFrom(
                      backgroundColor: FlowmColors.surface2,
                      fixedSize: const Size(
                        FlowmSizes.iconButton,
                        FlowmSizes.iconButton,
                      ),
                      minimumSize: const Size(
                        FlowmSizes.iconButton,
                        FlowmSizes.iconButton,
                      ),
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(FlowmRadius.lg),
                      ),
                    ),
                  ),
                  const SizedBox(width: FlowmSpacing.xl),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        if (subtitle != null) ...[
                          const SizedBox(height: FlowmSpacing.xxs),
                          Text(
                            subtitle!,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            ...children,
          ],
        ),
      ),
    );
  }
}

class ReportsPage extends StatelessWidget {
  const ReportsPage({super.key});

  static const _monthly = [
    ('1月', 23200, 19200),
    ('2月', 28400, 21100),
    ('3月', 26800, 23600),
    ('4月', 31000, 21900),
    ('5月', 29500, 24400),
    ('6月', 30228, 19908),
  ];

  @override
  Widget build(BuildContext context) {
    final spendRows =
        DemoData.categorySpend
            .map((item) => (category: item.category, amount: item.amount))
            .toList()
          ..sort((a, b) => b.amount.compareTo(a.amount));
    final best = _monthly.reduce(
      (a, b) => (a.$2 - a.$3) > (b.$2 - b.$3) ? a : b,
    );
    final pressure = _monthly.reduce(
      (a, b) => (a.$2 - a.$3) < (b.$2 - b.$3) ? a : b,
    );
    final netTotal = _monthly.fold<num>(0, (sum, row) => sum + row.$2 - row.$3);

    return ReadOnlyDetailPage(
      title: '报表',
      subtitle: '现金流分析 · 只读',
      children: [
        SummaryHeroSection(
          kicker: '本月结余',
          amount: DemoData.monthNet,
          amountSize: 38,
          amountColor: FlowmColors.accent,
          padding: FlowmSpacing.heroPaddingLarge,
          stats: [
            MetricStat.money(label: '收入合计', value: DemoData.monthIn),
            MetricStat.money(label: '支出合计', value: DemoData.monthOut),
            MetricStat.money(label: '月均结余', value: netTotal / _monthly.length),
          ],
        ),
        SectionBlock(
          title: '净结余趋势',
          more: '近 6 月',
          child: _MonthlyBars(rows: _monthly),
        ),
        SectionBlock(
          title: '本月支出分类',
          more: '按类别',
          child: CategoryBars(
            rows: spendRows,
            labelFor: DemoData.categoryName,
            colorFor: DemoData.categoryColor,
          ),
        ),
        SectionBlock(
          title: '结论',
          more: '展示用',
          last: true,
          child: Row(
            children: [
              Expanded(
                child: _ReportFact(
                  label: '最好月份',
                  value: '${best.$1} ${signedMoney(best.$2 - best.$3)}',
                  color: FlowmColors.accent,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _ReportFact(
                  label: '压力月份',
                  value:
                      '${pressure.$1} ${signedMoney(pressure.$2 - pressure.$3)}',
                  color: FlowmColors.red,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class SubscriptionsPage extends StatelessWidget {
  const SubscriptionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final yearly = DemoData.subscriptions.fold<num>(
      0,
      (sum, item) => sum + (item.cycle == '年' ? item.amount : item.amount * 12),
    );

    return ReadOnlyDetailPage(
      title: '订阅',
      subtitle: '周期扣费 · 只读',
      children: [
        SummaryHeroSection(
          kicker: '每月订阅合计',
          amount: DemoData.subscriptionMonthly,
          stats: [
            MetricStat.money(label: '每年', value: yearly),
            MetricStat.money(
              label: '本月扣费',
              value: DemoData.subscriptions.fold<num>(
                0,
                (sum, item) => sum + item.amount,
              ),
            ),
            MetricStat(
              label: '项目数',
              valueText: '${DemoData.subscriptions.length}',
            ),
          ],
        ),
        SectionBlock(
          title: '本月日历',
          more: '有扣费日期',
          child: _SubscriptionCalendar(items: DemoData.subscriptions),
        ),
        DividedSection(
          last: true,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
            child: Column(
              children: [
                for (var i = 0; i < DemoData.subscriptions.length; i++)
                  _SubscriptionRow(
                    item: DemoData.subscriptions[i],
                    first: i == 0,
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class LoansPage extends StatelessWidget {
  const LoansPage({super.key});

  @override
  Widget build(BuildContext context) {
    final monthly = DemoData.liabilities.fold<num>(
      0,
      (sum, item) => sum + item.monthly,
    );
    return ReadOnlyDetailPage(
      title: '贷款',
      subtitle: '未来义务 · 只读',
      children: [
        SummaryHeroSection(
          kicker: '欠款总额',
          amount: DemoData.loanPrincipalTotal,
          amountColor: FlowmColors.red,
          stats: [
            MetricStat.money(label: '每月还款', value: monthly),
            MetricStat(
              label: '贷款数',
              valueText: '${DemoData.liabilities.length}',
            ),
            const MetricStat(label: '固定支出占比', valueText: '38%'),
          ],
        ),
        DividedSection(
          last: true,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Column(
              children: [
                for (var i = 0; i < DemoData.liabilities.length; i++)
                  _LoanRow(item: DemoData.liabilities[i], first: i == 0),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class BudgetPageMobile extends StatelessWidget {
  const BudgetPageMobile({super.key});

  @override
  Widget build(BuildContext context) {
    final remain = DemoData.budgetTotal - DemoData.budgetSpent;
    final rows = [...DemoData.budgets]
      ..sort((a, b) => (b.spent / b.limit).compareTo(a.spent / a.limit));

    return ReadOnlyDetailPage(
      title: '预算',
      subtitle: '本月可控支出 · 只读',
      children: [
        SummaryHeroSection(
          kicker: '本月还能花',
          amount: remain.abs(),
          amountSize: 38,
          amountColor: remain < 0 ? FlowmColors.red : FlowmColors.ink,
          detailGap: FlowmSpacing.lg,
          detail: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '已用 ${money(DemoData.budgetSpent)} / ${fmt(DemoData.budgetTotal)} · ${(DemoData.budgetSpent / DemoData.budgetTotal * 100).round()}%',
                style: FlowmTextStyles.bodyMeta,
              ),
              const SizedBox(height: FlowmSpacing.xl),
              ProgressBar(
                percent: (DemoData.budgetSpent / DemoData.budgetTotal)
                    .toDouble(),
                color: DemoData.budgetSpent > DemoData.budgetTotal
                    ? FlowmColors.red
                    : FlowmColors.accent,
              ),
            ],
          ),
        ),
        DividedSection(
          last: true,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Column(
              children: [
                for (var i = 0; i < rows.length; i++)
                  _BudgetRow(item: rows[i], first: i == 0),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class AssetDetailPage extends StatelessWidget {
  const AssetDetailPage({super.key, required this.account});

  final Account account;

  @override
  Widget build(BuildContext context) {
    final current = account.trend.last * 1000;
    final previous = account.trend.length > 1
        ? account.trend[account.trend.length - 2] * 1000
        : current;
    final delta = current - previous;
    return ReadOnlyDetailPage(
      title: account.name,
      subtitle: '${account.group} · ${account.note}',
      children: [
        SummaryHeroSection(
          kicker: '当前余额',
          amount: account.balance,
          detail: Row(
            children: [
              const Sparkline(data: [78, 80, 82, 83, 85, 86, 88]),
              const SizedBox(width: FlowmSpacing.xl),
              Expanded(
                child: Text(
                  '较上次 ${delta >= 0 ? '+' : '-'}${money(delta.abs())}',
                  style: monoStyle(
                    size: 12,
                    color: delta >= 0 ? FlowmColors.accent : FlowmColors.red,
                  ),
                ),
              ),
            ],
          ),
        ),
        InfoSection(
          rows: [
            ('账户类型', account.kind),
            ('所属分组', account.group),
            ('币种', 'CNY · ¥'),
            ('更新方式', 'Desktop 同步'),
          ],
          labelWidth: 86,
          valueMonospace: false,
          last: true,
        ),
      ],
    );
  }
}

class TransactionDetailPage extends StatelessWidget {
  const TransactionDetailPage({super.key, required this.item});

  final TransactionItem item;

  @override
  Widget build(BuildContext context) {
    final positive = item.amount > 0;
    return ReadOnlyDetailPage(
      title: item.name,
      subtitle: '${item.date} · ${DemoData.categoryName(item.category)}',
      children: [
        DividedSection(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    ColorDot(
                      color: DemoData.categoryColor(item.category),
                      size: 9,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      DemoData.categoryName(item.category),
                      style: const TextStyle(
                        color: FlowmColors.ink3,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${positive ? '+' : '-'}${money(item.amount.abs(), decimals: 2)}',
                  style: monoStyle(
                    size: 34,
                    weight: FontWeight.w700,
                    color: positive ? FlowmColors.accent : FlowmColors.red,
                  ),
                ),
              ],
            ),
          ),
        ),
        InfoSection(
          rows: [
            ('账户 / 卡', item.source),
            ('类别', DemoData.categoryName(item.category)),
            ('原始描述', '${item.name} · placeholder'),
            (
              '交易号',
              'SYNC-${item.date.replaceAll('-', '')}-000${item.name.length}',
            ),
            ('标签', item.tags.isEmpty ? '无' : item.tags.join('、')),
          ],
          labelWidth: 86,
          valueMonospace: false,
        ),
        SectionBlock(
          title: '同商户最近',
          more: '只读',
          last: true,
          child: Column(
            children: [
              for (final tx
                  in DemoData.transactions
                      .where((tx) => tx.category == item.category)
                      .take(3))
                _CompactTxRow(item: tx),
            ],
          ),
        ),
      ],
    );
  }
}

class LoanDetailPageMobile extends StatelessWidget {
  const LoanDetailPageMobile({super.key, required this.item});

  final Liability item;

  @override
  Widget build(BuildContext context) {
    final paid = item.total - item.remaining;
    final progress = paid / item.total;
    return ReadOnlyDetailPage(
      title: item.name,
      subtitle: '${item.bank} · 年利率 ${item.rate}%',
      children: [
        SummaryHeroSection(
          kicker: '剩余本金',
          amount: item.remaining,
          amountColor: FlowmColors.red,
          detail: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProgressBar(percent: progress.toDouble()),
              const SizedBox(height: FlowmSpacing.md),
              Text(
                '已还 ${(progress * 100).round()}% · 剩 ${item.termLeft} 期',
                style: FlowmTextStyles.bodyMeta,
              ),
            ],
          ),
        ),
        InfoSection(
          rows: [
            ('月供', money(item.monthly)),
            ('贷款总额', money(item.total)),
            ('已还本金', money(paid)),
            ('下次还款', '06-25 · ${money(item.monthly)}'),
            ('数据来源', 'Desktop 贷款计划'),
          ],
          labelWidth: 86,
          valueMonospace: false,
          last: true,
        ),
      ],
    );
  }
}

class SubscriptionDetailPageMobile extends StatelessWidget {
  const SubscriptionDetailPageMobile({super.key, required this.item});

  final SubscriptionItem item;

  @override
  Widget build(BuildContext context) {
    return ReadOnlyDetailPage(
      title: item.name,
      subtitle: '${item.cycle}付 · ${DemoData.categoryName(item.category)}',
      children: [
        SummaryHeroSection(
          kicker: '扣费金额',
          amount: item.amount,
          detailGap: FlowmSpacing.lg,
          detail: Text(
            '下次扣费 ${item.next} · 自动续费',
            style: FlowmTextStyles.bodyMeta,
          ),
        ),
        InfoSection(
          rows: [
            ('周期', '${item.cycle}付'),
            ('分类', DemoData.categoryName(item.category)),
            ('币种', 'CNY · ¥'),
            ('近期扣费', '06-11、06-14、06-19'),
            ('数据来源', 'Desktop 订阅计划'),
          ],
          labelWidth: 86,
          valueMonospace: false,
          last: true,
        ),
      ],
    );
  }
}

class BudgetDetailPageMobile extends StatelessWidget {
  const BudgetDetailPageMobile({super.key, required this.item});

  final BudgetItem item;

  @override
  Widget build(BuildContext context) {
    final remaining = item.limit - item.spent;
    final pct = item.spent / item.limit;
    final color = DemoData.categoryColor(item.category);
    return ReadOnlyDetailPage(
      title: '${DemoData.categoryName(item.category)}预算',
      subtitle: '本月 · 只读',
      children: [
        SummaryHeroSection(
          kicker: '已用',
          amount: item.spent,
          amountColor: item.spent > item.limit
              ? FlowmColors.red
              : FlowmColors.ink,
          detail: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProgressBar(
                percent: pct.toDouble(),
                color: item.spent > item.limit ? FlowmColors.red : color,
              ),
              const SizedBox(height: FlowmSpacing.md),
              Text(
                '额度 ${money(item.limit)} · ${remaining >= 0 ? '剩余 ${money(remaining)}' : '超出 ${money(remaining.abs())}'}',
                style: FlowmTextStyles.bodyMeta,
              ),
            ],
          ),
        ),
        SectionBlock(
          title: '近 6 个月',
          more: '预算线对比',
          last: true,
          child: _MiniBudgetHistory(color: color, limit: item.limit),
        ),
      ],
    );
  }
}

class _SubscriptionRow extends StatelessWidget {
  const _SubscriptionRow({required this.item, required this.first});

  final SubscriptionItem item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    return FlowmListRow(
      first: first,
      onTap: () =>
          pushReadOnlyPage(context, SubscriptionDetailPageMobile(item: item)),
      leading: FlowmPill('${item.cycle}付'),
      title: item.name,
      subtitle: '下次 ${item.next} · 自动续费',
      value: money(item.amount),
    );
  }
}

class _LoanRow extends StatelessWidget {
  const _LoanRow({required this.item, required this.first});

  final Liability item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    final paid = item.total - item.remaining;
    final progress = paid / item.total;
    return FlowmListRow(
      first: first,
      onTap: () => pushReadOnlyPage(context, LoanDetailPageMobile(item: item)),
      title: item.name,
      titleMeta: item.bank,
      titleStyle: FlowmTextStyles.rowTitleStrong,
      value: money(item.remaining),
      valueStyle: monoStyle(
        size: 14,
        weight: FontWeight.w600,
        color: FlowmColors.red,
      ),
      bottom: Column(
        children: [
          ProgressBar(
            percent: progress.toDouble(),
            height: FlowmSizes.progressDense,
          ),
          const SizedBox(height: FlowmSpacing.md),
          Row(
            children: [
              Text(
                '月供 ${money(item.monthly)}',
                style: const TextStyle(color: FlowmColors.ink3, fontSize: 11),
              ),
              const Spacer(),
              Text(
                '剩 ${item.termLeft} 期 · 已还 ${(progress * 100).round()}%',
                style: const TextStyle(color: FlowmColors.ink3, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BudgetRow extends StatelessWidget {
  const _BudgetRow({required this.item, required this.first});

  final BudgetItem item;
  final bool first;

  @override
  Widget build(BuildContext context) {
    final over = item.spent > item.limit;
    final pct = item.spent / item.limit;
    final color = DemoData.categoryColor(item.category);
    return FlowmListRow(
      first: first,
      onTap: () =>
          pushReadOnlyPage(context, BudgetDetailPageMobile(item: item)),
      leading: ColorDot(color: color, size: FlowmSizes.colorDot),
      title: DemoData.categoryName(item.category),
      titleStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
      value: '${money(item.spent)} / ${fmt(item.limit)}',
      valueStyle: monoStyle(
        size: 12.5,
        color: over ? FlowmColors.red : FlowmColors.ink,
      ),
      bottom: ProgressBar(
        percent: pct.toDouble(),
        color: over ? FlowmColors.red : color,
        height: FlowmSizes.progressDense,
      ),
    );
  }
}

class _SubscriptionCalendar extends StatelessWidget {
  const _SubscriptionCalendar({required this.items});

  final List<SubscriptionItem> items;

  @override
  Widget build(BuildContext context) {
    final byDay = {
      for (final item in items) int.parse(item.next.substring(3, 5)): item,
    };
    final days = List<int>.generate(30, (index) => index + 1);
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        mainAxisSpacing: 7,
        crossAxisSpacing: 7,
        childAspectRatio: 0.92,
      ),
      itemCount: days.length,
      itemBuilder: (context, index) {
        final day = days[index];
        final sub = byDay[day];
        return Container(
          decoration: BoxDecoration(
            color: sub == null ? FlowmColors.surface2 : FlowmColors.accentSoft,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: sub == null ? FlowmColors.hair2 : FlowmColors.accentLine,
            ),
          ),
          padding: const EdgeInsets.all(5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$day',
                style: monoStyle(size: 10.5, color: FlowmColors.ink3),
              ),
              if (sub != null) ...[
                const Spacer(),
                Text(
                  money(sub.amount),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: monoStyle(size: 9.5, color: FlowmColors.ink),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _MonthlyBars extends StatelessWidget {
  const _MonthlyBars({required this.rows});

  final List<(String, num, num)> rows;

  @override
  Widget build(BuildContext context) {
    return VerticalBarsChart(
      height: FlowmSizes.monthBarsHeight,
      labelGap: FlowmSpacing.md - 1,
      rows: [
        for (final row in rows)
          VerticalBarItem(
            label: row.$1,
            value: (row.$2 - row.$3).abs(),
            color: row.$2 >= row.$3 ? FlowmColors.accent : FlowmColors.red,
          ),
      ],
    );
  }
}

class _MiniBudgetHistory extends StatelessWidget {
  const _MiniBudgetHistory({required this.color, required this.limit});

  final Color color;
  final num limit;

  static const _values = [2600, 3180, 2890, 3760, 4200, 3284];

  @override
  Widget build(BuildContext context) {
    return VerticalBarsChart(
      height: FlowmSizes.budgetBarsHeight,
      horizontalPadding: FlowmSpacing.xs + 1,
      labelStyle: const TextStyle(color: FlowmColors.ink3, fontSize: 10),
      rows: [
        for (var i = 0; i < _values.length; i++)
          VerticalBarItem(
            label: '${i + 1}月',
            value: _values[i],
            color: _values[i] > limit
                ? FlowmColors.red
                : (i == _values.length - 1 ? color : FlowmColors.surface3),
          ),
      ],
    );
  }
}

class _CompactTxRow extends StatelessWidget {
  const _CompactTxRow({required this.item});

  final TransactionItem item;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          SizedBox(
            width: 40,
            child: Text(
              item.date,
              style: const TextStyle(color: FlowmColors.ink3, fontSize: 11),
            ),
          ),
          Expanded(
            child: Text(
              item.name,
              style: const TextStyle(color: FlowmColors.ink2, fontSize: 12),
            ),
          ),
          Text(
            '${item.amount > 0 ? '+' : '-'}${fmt(item.amount.abs(), decimals: 1)}',
            style: monoStyle(
              size: 12,
              color: item.amount > 0 ? FlowmColors.accent : FlowmColors.red,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportFact extends StatelessWidget {
  const _ReportFact({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: FlowmColors.surface2,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(color: FlowmColors.ink3, fontSize: 10.5),
            ),
            const SizedBox(height: 5),
            Text(
              value,
              style: monoStyle(size: 13, weight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
