/*
 * @purpose Smoke test for the Flowm mobile read-only shell.
 * @role    Verifies the first screen renders the read-only dashboard and tabs.
 * @deps    Flutter widget test framework plus lib/main.dart.
 * @gotcha  Mobile must not expose create, edit, import, delete, or reset actions.
 */
import 'package:flutter_test/flutter_test.dart';

import 'package:flowm_mobile/src/flowm_mobile_app.dart';

void main() {
  testWidgets('renders the Flowm mobile read-only dashboard', (tester) async {
    await tester.pumpWidget(const FlowmMobileApp(loadSqlite: false));

    expect(find.text('看板'), findsWidgets);
    expect(find.text('只读同步'), findsOneWidget);
    expect(find.text('净资产'), findsOneWidget);
    expect(find.text('花费'), findsOneWidget);
    expect(find.text('预算'), findsWidgets);
    expect(find.text('固定'), findsOneWidget);
    expect(find.text('资产'), findsOneWidget);
    expect(find.text('流水'), findsNothing);
    expect(find.text('我的'), findsNothing);
    expect(find.text('记一笔'), findsNothing);
    expect(find.text('＋'), findsNothing);
  });

  testWidgets('opens the spend calendar tab', (tester) async {
    await tester.pumpWidget(const FlowmMobileApp(loadSqlite: false));

    await tester.tap(find.text('花费'));
    await tester.pumpAndSettle();

    expect(find.text('每日花费'), findsOneWidget);
    expect(find.text('本月支出'), findsOneWidget);
    expect(find.text('添加流水'), findsNothing);
    expect(find.text('保存'), findsNothing);
  });

  testWidgets('opens budget and fixed read-only tabs', (tester) async {
    await tester.pumpWidget(const FlowmMobileApp(loadSqlite: false));

    await tester.tap(find.text('预算').last);
    await tester.pumpAndSettle();

    expect(find.text('有没有超支 · 只读'), findsOneWidget);
    expect(find.text('总预算'), findsOneWidget);
    expect(find.text('编辑预算'), findsNothing);

    await tester.tap(find.text('固定'));
    await tester.pumpAndSettle();

    expect(find.text('订阅和贷款 · 只读'), findsOneWidget);
    expect(find.text('每月固定支出'), findsOneWidget);
    expect(find.text('新增订阅'), findsNothing);
    expect(find.text('新增贷款'), findsNothing);
  });
}
