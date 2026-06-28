/*
 * @purpose Shared widgets and chart components for the Flowm mobile UI.
 * @role    Provides Desktop-derived mobile layout primitives in Flutter.
 * @deps    fl_chart, format.dart, theme.dart, Flutter Material.
 * @gotcha  Components are display-only; do not attach mutation callbacks here.
 */
import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import 'format.dart';
import 'theme.dart';

const _chartTooltipPadding = EdgeInsets.symmetric(horizontal: 8, vertical: 5);
final _chartTooltipRadius = BorderRadius.circular(FlowmRadius.sm);
const _chartTooltipTextStyle = TextStyle(
  color: FlowmColors.surface,
  fontSize: 10.5,
  fontWeight: FontWeight.w600,
  height: 1.15,
);

class FlowmPage extends StatelessWidget {
  const FlowmPage({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: FlowmColors.surface,
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.only(
            top: FlowmSpacing.md,
            bottom: FlowmSizes.mobileBottomPadding,
          ),
          children: children,
        ),
      ),
    );
  }
}

class PageHeader extends StatelessWidget {
  const PageHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: FlowmSpacing.pageHeaderPadding,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                if (subtitle != null) ...[
                  const SizedBox(height: FlowmSpacing.xxs),
                  Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
                ],
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

class SyncBadge extends StatelessWidget {
  const SyncBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: FlowmColors.surface2,
        borderRadius: BorderRadius.circular(FlowmRadius.lg),
      ),
      child: const Padding(
        padding: EdgeInsets.symmetric(
          horizontal: FlowmSpacing.lg,
          vertical: FlowmSpacing.md,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.sync_rounded, size: 15, color: FlowmColors.ink3),
            SizedBox(width: FlowmSpacing.xs + 1),
            Text(
              '只读同步',
              style: TextStyle(
                color: FlowmColors.ink3,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SectionBlock extends StatelessWidget {
  const SectionBlock({
    super.key,
    required this.title,
    this.more,
    this.last = false,
    required this.child,
  });

  final String title;
  final String? more;
  final bool last;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(
          bottom: last
              ? BorderSide.none
              : const BorderSide(
                  color: FlowmColors.surface2,
                  width: FlowmSizes.sectionDivider,
                ),
        ),
      ),
      child: Padding(
        padding: FlowmSpacing.sectionPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(title, style: FlowmTextStyles.sectionTitle),
                if (more != null) ...[
                  const SizedBox(width: FlowmSpacing.md),
                  Expanded(
                    child: Text(
                      more!,
                      textAlign: TextAlign.right,
                      style: FlowmTextStyles.sectionMeta,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: FlowmSpacing.xxl),
            child,
          ],
        ),
      ),
    );
  }
}

class DividedSection extends StatelessWidget {
  const DividedSection({super.key, required this.child, this.last = false});

  final Widget child;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(
          bottom: last
              ? BorderSide.none
              : const BorderSide(
                  color: FlowmColors.surface2,
                  width: FlowmSizes.sectionDivider,
                ),
        ),
      ),
      child: child,
    );
  }
}

class Kicker extends StatelessWidget {
  const Kicker(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text.toUpperCase(), style: FlowmTextStyles.kicker);
  }
}

class SummaryHeroSection extends StatelessWidget {
  const SummaryHeroSection({
    super.key,
    required this.kicker,
    required this.amount,
    this.amountSize = 36,
    this.amountColor = FlowmColors.ink,
    this.detail,
    this.detailGap = FlowmSpacing.xl,
    this.stats = const [],
    this.padding = FlowmSpacing.heroPadding,
    this.last = false,
  });

  final String kicker;
  final num amount;
  final double amountSize;
  final Color amountColor;
  final Widget? detail;
  final double detailGap;
  final List<Widget> stats;
  final EdgeInsetsGeometry padding;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return DividedSection(
      last: last,
      child: Padding(
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Kicker(kicker),
            const SizedBox(height: FlowmSpacing.sm),
            BigMoney(amount, size: amountSize, color: amountColor),
            if (detail != null) ...[SizedBox(height: detailGap), detail!],
            if (stats.isNotEmpty) ...[
              const SizedBox(height: FlowmSpacing.xxl),
              Row(children: stats),
            ],
          ],
        ),
      ),
    );
  }
}

class BigMoney extends StatelessWidget {
  const BigMoney(
    this.value, {
    super.key,
    this.size = 42,
    this.color = FlowmColors.ink,
  });

  final num value;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: '¥',
            style: monoStyle(
              size: size * 0.45,
              weight: FontWeight.w500,
              color: FlowmColors.ink3,
            ),
          ),
          TextSpan(
            text: fmt(value),
            style: monoStyle(size: size, weight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}

class MetricStat extends StatelessWidget {
  const MetricStat({super.key, required this.label, required this.valueText});

  final String label;
  final String valueText;

  factory MetricStat.money({required String label, required num value}) {
    return MetricStat(label: label, valueText: money(value));
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: FlowmSpacing.xs - 1),
          Text(valueText, style: monoStyle(size: 13, weight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class CashStat extends StatelessWidget {
  const CashStat({
    super.key,
    required this.label,
    required this.value,
    required this.color,
    this.border = false,
  });

  final String label;
  final String value;
  final Color color;
  final bool border;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.only(left: border ? 16 : 0),
        decoration: BoxDecoration(
          border: border
              ? const Border(left: BorderSide(color: FlowmColors.hair2))
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(color: FlowmColors.ink3, fontSize: 11),
            ),
            const SizedBox(height: FlowmSpacing.xs),
            Text(
              value,
              style: monoStyle(size: 16, weight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

class ProgressBar extends StatelessWidget {
  const ProgressBar({
    super.key,
    required this.percent,
    this.color = FlowmColors.accent,
    this.background = FlowmColors.hair2,
    this.height = FlowmSizes.progress,
  });

  final double percent;
  final Color color;
  final Color background;
  final double height;

  @override
  Widget build(BuildContext context) {
    final clamped = percent.clamp(0, 1).toDouble();
    return LayoutBuilder(
      builder: (context, constraints) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(height),
          child: ColoredBox(
            color: background,
            child: Align(
              alignment: Alignment.centerLeft,
              child: SizedBox(
                width: constraints.maxWidth * clamped,
                height: height,
                child: ColoredBox(color: color),
              ),
            ),
          ),
        );
      },
    );
  }
}

class ColorDot extends StatelessWidget {
  const ColorDot({super.key, required this.color, this.size = 8});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(FlowmRadius.xxs),
      ),
    );
  }
}

class Sparkline extends StatelessWidget {
  const Sparkline({
    super.key,
    required this.data,
    this.color = FlowmColors.accent,
    this.fill = FlowmColors.accentSoft,
    this.height = FlowmSizes.sparklineHeight,
  });

  final List<num> data;
  final Color color;
  final Color fill;
  final double height;

  @override
  Widget build(BuildContext context) {
    if (data.length < 2) {
      return SizedBox(width: FlowmSizes.sparklineWidth, height: height);
    }

    final values = data.map((value) => value.toDouble()).toList();
    final minValue = values.reduce(math.min);
    final maxValue = values.reduce(math.max);
    final spread = math.max(maxValue - minValue, 1);
    final spots = [
      for (var i = 0; i < values.length; i++)
        FlSpot(i.toDouble(), (values[i] - minValue) / spread),
    ];

    return SizedBox(
      width: FlowmSizes.sparklineWidth,
      height: height,
      child: LineChart(
        duration: const Duration(milliseconds: 220),
        LineChartData(
          minX: 0,
          maxX: (values.length - 1).toDouble(),
          minY: 0,
          maxY: 1,
          lineTouchData: LineTouchData(
            enabled: true,
            touchSpotThreshold: 18,
            getTouchedSpotIndicator: (barData, spotIndexes) {
              return [
                for (final _ in spotIndexes)
                  TouchedSpotIndicatorData(
                    const FlLine(color: FlowmColors.accentLine, strokeWidth: 1),
                    FlDotData(
                      getDotPainter: (spot, percent, barData, index) =>
                          FlDotCirclePainter(
                            radius: 3.6,
                            color: color,
                            strokeWidth: 1.8,
                            strokeColor: FlowmColors.surface,
                          ),
                    ),
                  ),
              ];
            },
            touchTooltipData: LineTouchTooltipData(
              tooltipPadding: _chartTooltipPadding,
              tooltipMargin: 8,
              tooltipBorderRadius: _chartTooltipRadius,
              fitInsideHorizontally: true,
              fitInsideVertically: true,
              getTooltipColor: (_) => FlowmColors.ink,
              getTooltipItems: (spots) {
                return [
                  for (final spot in spots)
                    LineTooltipItem(
                      money(values[spot.spotIndex]),
                      _chartTooltipTextStyle,
                    ),
                ];
              },
            ),
          ),
          gridData: const FlGridData(show: false),
          borderData: FlBorderData(show: false),
          titlesData: const FlTitlesData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: false,
              color: color,
              barWidth: 2.2,
              isStrokeCapRound: true,
              dotData: FlDotData(
                show: true,
                checkToShowDot: (spot, barData) => spot.x == spots.last.x,
                getDotPainter: (spot, percent, barData, index) =>
                    FlDotCirclePainter(
                      radius: 3,
                      color: color,
                      strokeWidth: 1.6,
                      strokeColor: FlowmColors.surface,
                    ),
              ),
              belowBarData: BarAreaData(show: true, color: fill),
            ),
          ],
        ),
      ),
    );
  }
}

class DayBarsChart extends StatelessWidget {
  const DayBarsChart({super.key, required this.data});

  final List<num> data;

  @override
  Widget build(BuildContext context) {
    final maxValue = data
        .map((value) => value.abs())
        .fold<num>(1, (a, b) => a > b ? a : b)
        .toDouble();
    final groups = [
      for (var i = 0; i < data.length; i++)
        BarChartGroupData(
          x: i,
          barRods: [
            BarChartRodData(
              toY: data[i].abs().toDouble(),
              width: 6,
              color: data[i] == 0
                  ? FlowmColors.transfer.withValues(alpha: 0.18)
                  : FlowmColors.transfer,
              borderRadius: BorderRadius.circular(2),
            ),
          ],
        ),
    ];

    return SizedBox(
      height: FlowmSizes.dayBarsHeight,
      child: BarChart(
        duration: const Duration(milliseconds: 220),
        BarChartData(
          minY: 0,
          maxY: maxValue,
          alignment: BarChartAlignment.spaceBetween,
          groupsSpace: 2,
          barGroups: groups,
          barTouchData: BarTouchData(
            enabled: true,
            touchExtraThreshold: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 10,
            ),
            touchTooltipData: BarTouchTooltipData(
              tooltipPadding: _chartTooltipPadding,
              tooltipMargin: 8,
              tooltipBorderRadius: _chartTooltipRadius,
              fitInsideHorizontally: true,
              fitInsideVertically: true,
              getTooltipColor: (_) => FlowmColors.ink,
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                final value = data[group.x].abs();
                if (value == 0) return null;
                return BarTooltipItem(
                  '${group.x + 1}日\n${money(value)}',
                  _chartTooltipTextStyle,
                  textAlign: TextAlign.center,
                );
              },
            ),
          ),
          gridData: const FlGridData(show: false),
          borderData: FlBorderData(
            show: true,
            border: const Border(
              bottom: BorderSide(color: FlowmColors.hair, width: 1),
            ),
          ),
          titlesData: const FlTitlesData(show: false),
        ),
      ),
    );
  }
}

class CategoryBars extends StatelessWidget {
  const CategoryBars({
    super.key,
    required this.rows,
    required this.labelFor,
    required this.colorFor,
  });

  final List<({String category, num amount})> rows;
  final String Function(String category) labelFor;
  final Color Function(String category) colorFor;

  @override
  Widget build(BuildContext context) {
    final maxValue = rows.map((row) => row.amount).fold<num>(1, math.max);
    return Column(
      children: [
        for (var i = 0; i < rows.length; i++) ...[
          _CategoryBarRow(
            label: labelFor(rows[i].category),
            value: rows[i].amount,
            percent: rows[i].amount / maxValue,
            color: colorFor(rows[i].category),
          ),
          if (i != rows.length - 1) const SizedBox(height: FlowmSpacing.xxl),
        ],
      ],
    );
  }
}

class _CategoryBarRow extends StatelessWidget {
  const _CategoryBarRow({
    required this.label,
    required this.value,
    required this.percent,
    required this.color,
  });

  final String label;
  final num value;
  final num percent;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Text(
              label,
              style: const TextStyle(color: FlowmColors.ink, fontSize: 13),
            ),
            const Spacer(),
            Text(money(value), style: monoStyle(size: 13)),
          ],
        ),
        const SizedBox(height: FlowmSpacing.sm),
        ProgressBar(
          percent: percent.toDouble(),
          color: color,
          height: FlowmSizes.categoryProgress,
        ),
      ],
    );
  }
}

class VerticalBarItem {
  const VerticalBarItem({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final num value;
  final Color color;
}

class VerticalBarsChart extends StatelessWidget {
  const VerticalBarsChart({
    super.key,
    required this.rows,
    required this.height,
    this.barWidth = 18,
    this.horizontalPadding = FlowmSpacing.xs,
    this.labelGap = FlowmSpacing.sm,
    this.labelStyle = const TextStyle(color: FlowmColors.ink3, fontSize: 10.5),
  });

  final List<VerticalBarItem> rows;
  final double height;
  final double barWidth;
  final double horizontalPadding;
  final double labelGap;
  final TextStyle labelStyle;

  @override
  Widget build(BuildContext context) {
    if (rows.isEmpty) return SizedBox(height: height);

    final chartHeight = math.max(1.0, height - labelGap - 14);
    final maxValue = rows
        .map((row) => row.value.abs())
        .fold<num>(1, (a, b) => a > b ? a : b)
        .toDouble();

    return SizedBox(
      height: height,
      child: Column(
        children: [
          SizedBox(
            height: chartHeight,
            child: BarChart(
              duration: const Duration(milliseconds: 220),
              BarChartData(
                minY: 0,
                maxY: maxValue,
                alignment: BarChartAlignment.spaceAround,
                groupsSpace: 0,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchExtraThreshold: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 10,
                  ),
                  touchTooltipData: BarTouchTooltipData(
                    tooltipPadding: _chartTooltipPadding,
                    tooltipMargin: 8,
                    tooltipBorderRadius: _chartTooltipRadius,
                    fitInsideHorizontally: true,
                    fitInsideVertically: true,
                    getTooltipColor: (_) => FlowmColors.ink,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      final row = rows[group.x];
                      return BarTooltipItem(
                        '${row.label}\n${money(row.value.abs())}',
                        _chartTooltipTextStyle,
                        textAlign: TextAlign.center,
                      );
                    },
                  ),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: const FlTitlesData(show: false),
                barGroups: [
                  for (var i = 0; i < rows.length; i++)
                    BarChartGroupData(
                      x: i,
                      barRods: [
                        BarChartRodData(
                          toY: math.max(
                            rows[i].value.abs().toDouble(),
                            maxValue * 0.08,
                          ),
                          width: barWidth,
                          color: rows[i].color,
                          borderRadius: BorderRadius.circular(FlowmRadius.xs),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
          SizedBox(height: labelGap),
          Row(
            children: [
              for (final row in rows)
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: horizontalPadding,
                    ),
                    child: Text(
                      row.label,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: labelStyle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class GroupLabel extends StatelessWidget {
  const GroupLabel(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(label, style: FlowmTextStyles.groupLabel);
  }
}

class InfoSection extends StatelessWidget {
  const InfoSection({
    super.key,
    this.title,
    required this.rows,
    this.last = false,
    this.labelWidth,
    this.valueMonospace = true,
  });

  final String? title;
  final List<(String, String)> rows;
  final bool last;
  final double? labelWidth;
  final bool valueMonospace;

  @override
  Widget build(BuildContext context) {
    return DividedSection(
      last: last,
      child: Padding(
        padding: FlowmSpacing.infoPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (title != null) ...[
              GroupLabel(title!),
              const SizedBox(height: FlowmSpacing.xs),
            ],
            for (var i = 0; i < rows.length; i++)
              InfoRow(
                label: rows[i].$1,
                value: rows[i].$2,
                first: i == 0,
                labelWidth: labelWidth,
                valueMonospace: valueMonospace,
              ),
          ],
        ),
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    required this.first,
    this.labelWidth,
    this.valueMonospace = true,
  });

  final String label;
  final String value;
  final bool first;
  final double? labelWidth;
  final bool valueMonospace;

  @override
  Widget build(BuildContext context) {
    final labelText = Text(
      label,
      style: labelWidth == null
          ? const TextStyle(color: FlowmColors.ink, fontSize: 14)
          : const TextStyle(color: FlowmColors.ink3, fontSize: 12.5),
    );
    final valueStyle = valueMonospace
        ? monoStyle(size: 12.5, color: FlowmColors.ink3)
        : const TextStyle(color: FlowmColors.ink2, fontSize: 12.5);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: FlowmSpacing.xl),
      decoration: BoxDecoration(
        border: Border(
          top: first
              ? BorderSide.none
              : const BorderSide(color: FlowmColors.hair3),
        ),
      ),
      child: Row(
        children: [
          if (labelWidth == null)
            labelText
          else
            SizedBox(width: labelWidth, child: labelText),
          const Spacer(),
          Flexible(
            child: Text(value, textAlign: TextAlign.right, style: valueStyle),
          ),
        ],
      ),
    );
  }
}

class FlowmPill extends StatelessWidget {
  const FlowmPill(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: FlowmColors.surface2,
        border: Border.all(color: FlowmColors.hair),
        borderRadius: BorderRadius.circular(FlowmRadius.pill),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: FlowmSpacing.md,
          vertical: FlowmSpacing.xxs,
        ),
        child: Text(
          label,
          style: const TextStyle(color: FlowmColors.ink3, fontSize: 9.5),
        ),
      ),
    );
  }
}

class MetricIcon extends StatelessWidget {
  const MetricIcon({
    super.key,
    required this.icon,
    required this.color,
    this.size = FlowmSizes.profileMetricIcon,
  });

  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(FlowmRadius.md),
      ),
      child: Icon(icon, color: color, size: 18),
    );
  }
}

class FlowmListRow extends StatelessWidget {
  const FlowmListRow({
    super.key,
    required this.title,
    this.subtitle,
    this.titleMeta,
    this.value,
    this.leading,
    this.bottom,
    this.onTap,
    this.first = false,
    this.padding = const EdgeInsets.symmetric(vertical: FlowmSpacing.xl),
    this.titleStyle = FlowmTextStyles.rowTitle,
    this.titleMetaStyle = FlowmTextStyles.rowMeta,
    this.subtitleStyle = FlowmTextStyles.rowMeta,
    this.valueStyle,
    this.showChevron,
  });

  final String title;
  final String? subtitle;
  final String? titleMeta;
  final String? value;
  final Widget? leading;
  final Widget? bottom;
  final VoidCallback? onTap;
  final bool first;
  final EdgeInsetsGeometry padding;
  final TextStyle titleStyle;
  final TextStyle titleMetaStyle;
  final TextStyle subtitleStyle;
  final TextStyle? valueStyle;
  final bool? showChevron;

  @override
  Widget build(BuildContext context) {
    final hasChevron = showChevron ?? onTap != null;
    final row = Container(
      padding: padding,
      decoration: BoxDecoration(
        border: Border(
          top: first
              ? BorderSide.none
              : const BorderSide(color: FlowmColors.hair3),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              if (leading != null) ...[
                leading!,
                const SizedBox(width: FlowmSpacing.xl),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: titleStyle,
                          ),
                        ),
                        if (titleMeta != null) ...[
                          const SizedBox(width: FlowmSpacing.md),
                          Text(titleMeta!, style: titleMetaStyle),
                        ],
                      ],
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: FlowmSpacing.xxs - 1),
                      Text(
                        subtitle!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: subtitleStyle,
                      ),
                    ],
                  ],
                ),
              ),
              if (value != null) ...[
                const SizedBox(width: FlowmSpacing.xl),
                Text(
                  value!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: valueStyle ?? monoStyle(size: 14),
                ),
              ],
              if (hasChevron) ...[
                const SizedBox(width: FlowmSpacing.xs),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: FlowmSizes.chevron,
                  color: FlowmColors.ink4,
                ),
              ],
            ],
          ),
          if (bottom != null) ...[
            const SizedBox(height: FlowmSpacing.md),
            bottom!,
          ],
        ],
      ),
    );

    if (onTap == null) {
      return row;
    }

    return InkWell(onTap: onTap, child: row);
  }
}
