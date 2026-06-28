/*
 * @purpose Read-only Flowm mobile application shell.
 * @role    Owns MaterialApp setup and bottom-tab navigation.
 * @deps    demo_data.dart, screens.dart, theme.dart.
 * @gotcha  Navigation is allowed, but financial data mutations are desktop-only.
 */
import 'dart:ui';

import 'package:flutter/material.dart';

import 'data/mobile_ledger_repository.dart';
import 'demo_data.dart';
import 'screens.dart';
import 'theme.dart';

class FlowmMobileApp extends StatelessWidget {
  const FlowmMobileApp({super.key, this.loadSqlite = true});

  final bool loadSqlite;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flowm',
      debugShowCheckedModeBanner: false,
      theme: flowmTheme,
      home: loadSqlite
          ? const _FlowmLedgerBootstrap()
          : const FlowmReadOnlyShell(),
    );
  }
}

class _FlowmLedgerBootstrap extends StatefulWidget {
  const _FlowmLedgerBootstrap();

  @override
  State<_FlowmLedgerBootstrap> createState() => _FlowmLedgerBootstrapState();
}

class _FlowmLedgerBootstrapState extends State<_FlowmLedgerBootstrap> {
  late final Future<void> _load = _loadLedger();

  Future<void> _loadLedger() async {
    final snapshot = await MobileLedgerRepository.loadBundledDemoLedger();
    DemoData.useSnapshot(snapshot);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _load,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          if (snapshot.hasError) {
            return _LedgerLoadError(error: snapshot.error);
          }
          return const FlowmReadOnlyShell();
        }

        return const Scaffold(
          backgroundColor: FlowmColors.surface,
          body: SafeArea(
            child: Center(
              child: Text(
                '加载 Desktop SQLite',
                style: TextStyle(color: FlowmColors.ink3, fontSize: 12),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _LedgerLoadError extends StatelessWidget {
  const _LedgerLoadError({required this.error});

  final Object? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FlowmColors.surface,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(FlowmSpacing.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.storage_outlined,
                  color: FlowmColors.ink3,
                  size: 30,
                ),
                const SizedBox(height: FlowmSpacing.md),
                const Text(
                  'SQLite 读取失败',
                  style: TextStyle(
                    color: FlowmColors.ink,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: FlowmSpacing.sm),
                Text(
                  '$error',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: FlowmColors.ink3,
                    fontSize: 12,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class FlowmReadOnlyShell extends StatefulWidget {
  const FlowmReadOnlyShell({super.key});

  @override
  State<FlowmReadOnlyShell> createState() => _FlowmReadOnlyShellState();
}

class _FlowmReadOnlyShellState extends State<FlowmReadOnlyShell> {
  int _tab = 0;

  static const _screens = [
    DashboardScreen(),
    CalendarScreen(),
    BudgetScreen(),
    FixedScreen(),
    AssetsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FlowmColors.surface,
      body: Stack(
        children: [
          Positioned.fill(
            child: IndexedStack(index: _tab, children: _screens),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _ReadOnlyTabBar(
              currentIndex: _tab,
              onChanged: (index) => setState(() => _tab = index),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReadOnlyTabBar extends StatelessWidget {
  const _ReadOnlyTabBar({required this.currentIndex, required this.onChanged});

  final int currentIndex;
  final ValueChanged<int> onChanged;

  static const _items = [
    _TabItem(label: '看板', icon: Icons.dashboard_outlined),
    _TabItem(label: '花费', icon: Icons.receipt_long_outlined),
    _TabItem(label: '预算', icon: Icons.speed_outlined),
    _TabItem(label: '固定', icon: Icons.event_repeat_outlined),
    _TabItem(label: '资产', icon: Icons.account_balance_wallet_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.88),
            border: const Border(
              top: BorderSide(color: FlowmColors.hair, width: 0.5),
            ),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                FlowmSpacing.md,
                FlowmSpacing.md + 1,
                FlowmSpacing.md,
                FlowmSpacing.md - 1,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (var i = 0; i < _items.length; i++)
                    Expanded(
                      child: _TabButton(
                        item: _items[i],
                        active: i == currentIndex,
                        onTap: () => onChanged(i),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.item,
    required this.active,
    required this.onTap,
  });

  final _TabItem item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? FlowmColors.accent : FlowmColors.ink4;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(FlowmRadius.md + 2),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: FlowmSpacing.xs),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(item.icon, size: 22, color: color),
            const SizedBox(height: FlowmSpacing.xs + 1),
            Text(
              item.label,
              style: FlowmTextStyles.tabLabel.copyWith(
                color: color,
                fontWeight: active ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabItem {
  const _TabItem({required this.label, required this.icon});

  final String label;
  final IconData icon;
}
