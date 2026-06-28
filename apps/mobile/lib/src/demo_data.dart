/*
 * @purpose Static placeholder data for the read-only mobile UI.
 * @role    Supplies realistic display data until Desktop sync is wired.
 * @deps    theme.dart for category colors.
 * @gotcha  These values are placeholders, not a local mobile ledger.
 */
import 'package:flutter/material.dart';

import 'theme.dart';

class Account {
  const Account({
    required this.id,
    required this.name,
    required this.group,
    required this.balance,
    required this.kind,
    required this.note,
    required this.trend,
  });

  final String id;
  final String name;
  final String group;
  final num balance;
  final String kind;
  final String note;
  final List<num> trend;
}

class Liability {
  const Liability({
    required this.name,
    required this.bank,
    required this.remaining,
    required this.total,
    required this.monthly,
    required this.rate,
    required this.termLeft,
  });

  final String name;
  final String bank;
  final num remaining;
  final num total;
  final num monthly;
  final num rate;
  final int termLeft;
}

class SubscriptionItem {
  const SubscriptionItem({
    required this.name,
    required this.category,
    required this.cycle,
    required this.amount,
    required this.next,
  });

  final String name;
  final String category;
  final String cycle;
  final num amount;
  final String next;
}

class TransactionItem {
  const TransactionItem({
    required this.date,
    required this.name,
    required this.category,
    required this.source,
    required this.amount,
    this.tags = const [],
  });

  final String date;
  final String name;
  final String category;
  final String source;
  final num amount;
  final List<String> tags;
}

class BudgetItem {
  const BudgetItem({
    required this.category,
    required this.limit,
    required this.spent,
  });

  final String category;
  final num limit;
  final num spent;
}

class UpcomingItem {
  const UpcomingItem({
    required this.date,
    required this.name,
    required this.amount,
    required this.kind,
  });

  final String date;
  final String name;
  final num amount;
  final String kind;
}

class TagItem {
  const TagItem({required this.name, required this.count});

  final String name;
  final int count;
}

class CategorySpend {
  const CategorySpend({required this.category, required this.amount});

  final String category;
  final num amount;
}

class CalendarDaySummary {
  const CalendarDaySummary({
    required this.year,
    required this.month,
    required this.day,
    required this.spend,
    required this.income,
    this.categorySpend = const {},
  });

  final int year;
  final int month;
  final int day;
  final num spend;
  final num income;
  final Map<String, num> categorySpend;

  DateTime get date => DateTime(year, month, day);
  num get net => income - spend;
  bool get hasActivity => spend > 0 || income > 0;
}

class CategoryMeta {
  const CategoryMeta({required this.name, required this.color});

  final String name;
  final Color color;
}

class MobileLedgerSnapshot {
  const MobileLedgerSnapshot({
    required this.accounts,
    required this.liabilityAccounts,
    required this.liabilities,
    required this.subscriptions,
    required this.transactions,
    required this.categoryMeta,
    required this.categorySpend,
    required this.budgets,
    required this.upcoming,
    required this.tags,
    required this.netTrend,
    required this.dailySpend,
    required this.calendarDays,
    required this.monthIn,
    required this.dashboardSubtitle,
    required this.calendarMonthLabel,
    required this.cashflowSubtitle,
    required this.lastSyncLabel,
  });

  final List<Account> accounts;
  final List<Account> liabilityAccounts;
  final List<Liability> liabilities;
  final List<SubscriptionItem> subscriptions;
  final List<TransactionItem> transactions;
  final Map<String, CategoryMeta> categoryMeta;
  final List<CategorySpend> categorySpend;
  final List<BudgetItem> budgets;
  final List<UpcomingItem> upcoming;
  final List<TagItem> tags;
  final List<num> netTrend;
  final List<num> dailySpend;
  final List<CalendarDaySummary> calendarDays;
  final num monthIn;
  final String dashboardSubtitle;
  final String calendarMonthLabel;
  final String cashflowSubtitle;
  final String lastSyncLabel;
}

abstract final class DemoData {
  static String dashboardSubtitle = '6月9日 · 周一';
  static String calendarMonthLabel = '2026 年 6 月';
  static String cashflowSubtitle = '6 月 · 218 笔 · 只读';
  static String lastSyncLabel = '今天 16:28';

  static List<Account> accounts = const [
    Account(
      id: 'house',
      name: '自住房 · 估值',
      group: '不动产',
      balance: 4200000,
      kind: 'illiquid',
      note: '朝阳 · 89㎡',
      trend: [398, 401, 405, 410, 415, 418, 420],
    ),
    Account(
      id: 'broker',
      name: '券商 · 股票 + 基金',
      group: '投资',
      balance: 152340,
      kind: 'liquid',
      note: '华泰证券',
      trend: [141, 138, 145, 149, 147, 150, 152.3],
    ),
    Account(
      id: 'gjj',
      name: '住房公积金',
      group: '投资',
      balance: 86420,
      kind: 'semi',
      note: '每月入账',
      trend: [78, 80, 81, 83, 84, 85, 86.4],
    ),
    Account(
      id: 'cmb',
      name: '招商银行 · 储蓄卡',
      group: '现金',
      balance: 48230,
      kind: 'liquid',
      note: '·· 6621',
      trend: [52, 49, 55, 51, 47, 50, 48.2],
    ),
    Account(
      id: 'usd',
      name: '美元活期',
      group: '现金',
      balance: 30156,
      kind: 'liquid',
      note: r'$4,200 · 7.18',
      trend: [29, 29.4, 30, 29.8, 30.2, 30.1, 30.1],
    ),
    Account(
      id: 'alipay',
      name: '支付宝 · 余额宝',
      group: '现金',
      balance: 23805,
      kind: 'liquid',
      note: '7日 1.42%',
      trend: [18, 20, 22, 21, 24, 23, 23.8],
    ),
    Account(
      id: 'icbc',
      name: '工商银行 · 储蓄卡',
      group: '现金',
      balance: 12500,
      kind: 'liquid',
      note: '·· 0473 · 工资',
      trend: [11, 15, 9, 14, 12, 13, 12.5],
    ),
    Account(
      id: 'wx',
      name: '微信 · 零钱',
      group: '现金',
      balance: 3420,
      kind: 'liquid',
      note: '零钱通',
      trend: [4, 3.2, 5, 2.8, 3.6, 3.1, 3.4],
    ),
  ];

  static List<Account> liabilityAccounts = const [
    Account(
      id: 'mortgage-liability',
      name: '商业房贷负债',
      group: '负债',
      balance: 1820000,
      kind: 'liability',
      note: '招商银行',
      trend: [194, 191, 188, 186, 184, 183, 182],
    ),
    Account(
      id: 'consumer-liability',
      name: '消费贷负债',
      group: '负债',
      balance: 45000,
      kind: 'liability',
      note: '招联金融',
      trend: [58, 55, 52, 49, 47, 46, 45],
    ),
    Account(
      id: 'card-liability',
      name: '信用卡待还',
      group: '负债',
      balance: 8640,
      kind: 'liability',
      note: '招商银行',
      trend: [6, 8, 7, 9, 8, 10, 8.6],
    ),
  ];

  static List<Liability> liabilities = const [
    Liability(
      name: '商业房贷',
      bank: '招商银行',
      remaining: 1820000,
      total: 2480000,
      monthly: 9850,
      rate: 4.15,
      termLeft: 246,
    ),
    Liability(
      name: '消费贷',
      bank: '招联金融',
      remaining: 45000,
      total: 80000,
      monthly: 2180,
      rate: 5.4,
      termLeft: 22,
    ),
    Liability(
      name: '信用卡待还',
      bank: '招商银行',
      remaining: 8640,
      total: 8640,
      monthly: 8640,
      rate: 0,
      termLeft: 1,
    ),
  ];

  static List<SubscriptionItem> subscriptions = const [
    SubscriptionItem(
      name: '威尔士健身',
      category: 'fun',
      cycle: '月',
      amount: 299,
      next: '06-21',
    ),
    SubscriptionItem(
      name: 'ChatGPT Plus',
      category: 'sub',
      cycle: '月',
      amount: 145,
      next: '06-14',
    ),
    SubscriptionItem(
      name: '爱奇艺 黄金',
      category: 'fun',
      cycle: '月',
      amount: 25,
      next: '06-11',
    ),
    SubscriptionItem(
      name: 'iCloud 200G',
      category: 'sub',
      cycle: '月',
      amount: 21,
      next: '06-19',
    ),
    SubscriptionItem(
      name: '网易云 黑胶',
      category: 'fun',
      cycle: '月',
      amount: 18,
      next: '06-27',
    ),
  ];

  static List<TransactionItem> transactions = const [
    TransactionItem(
      date: '06-07',
      name: '盒马鲜生',
      category: 'food',
      source: '支付宝',
      amount: -218.4,
      tags: ['囤货'],
    ),
    TransactionItem(
      date: '06-07',
      name: '滴滴出行',
      category: 'trans',
      source: '微信',
      amount: -34.0,
      tags: ['打车'],
    ),
    TransactionItem(
      date: '06-06',
      name: '招商银行 房贷扣款',
      category: 'live',
      source: '招商银行',
      amount: -9850.0,
    ),
    TransactionItem(
      date: '06-06',
      name: '星巴克',
      category: 'food',
      source: '微信',
      amount: -39.0,
      tags: ['咖啡'],
    ),
    TransactionItem(
      date: '06-05',
      name: '京东 · 显示器',
      category: 'shop',
      source: '支付宝',
      amount: -1299.0,
      tags: ['数码'],
    ),
    TransactionItem(
      date: '06-05',
      name: '基金定投 · 沪深300',
      category: 'invest',
      source: '招商银行',
      amount: -2000.0,
    ),
    TransactionItem(
      date: '06-04',
      name: '公司工资',
      category: 'income',
      source: '工商银行',
      amount: 28600.0,
    ),
    TransactionItem(
      date: '06-04',
      name: '美团外卖',
      category: 'food',
      source: '微信',
      amount: -52.5,
      tags: ['外卖'],
    ),
    TransactionItem(
      date: '06-03',
      name: '12306 高铁票',
      category: 'trans',
      source: '支付宝',
      amount: -553.0,
      tags: ['差旅'],
    ),
    TransactionItem(
      date: '06-02',
      name: '万达影城',
      category: 'fun',
      source: '微信',
      amount: -98.0,
      tags: ['约会'],
    ),
  ];

  static Map<String, CategoryMeta> categoryMeta = const {
    'live': CategoryMeta(name: '居住', color: FlowmColors.live),
    'food': CategoryMeta(name: '餐饮', color: FlowmColors.food),
    'trans': CategoryMeta(name: '交通', color: FlowmColors.transport),
    'shop': CategoryMeta(name: '购物', color: FlowmColors.shopping),
    'sub': CategoryMeta(name: '订阅', color: FlowmColors.subscription),
    'fun': CategoryMeta(name: '娱乐', color: FlowmColors.fun),
    'invest': CategoryMeta(name: '理财', color: FlowmColors.invest),
    'income': CategoryMeta(name: '收入', color: FlowmColors.income),
    'other': CategoryMeta(name: '其他', color: FlowmColors.other),
    'xfer': CategoryMeta(name: '转账', color: FlowmColors.transfer),
  };

  static List<CategorySpend> categorySpend = const [
    CategorySpend(category: 'live', amount: 10036),
    CategorySpend(category: 'food', amount: 3284),
    CategorySpend(category: 'invest', amount: 2000),
    CategorySpend(category: 'shop', amount: 1940),
    CategorySpend(category: 'trans', amount: 1150),
    CategorySpend(category: 'fun', amount: 680),
    CategorySpend(category: 'sub', amount: 206),
    CategorySpend(category: 'other', amount: 612),
  ];

  static List<BudgetItem> budgets = const [
    BudgetItem(category: 'food', limit: 4000, spent: 3284),
    BudgetItem(category: 'shop', limit: 1800, spent: 1940),
    BudgetItem(category: 'trans', limit: 1400, spent: 1150),
    BudgetItem(category: 'fun', limit: 1200, spent: 680),
    BudgetItem(category: 'other', limit: 900, spent: 612),
    BudgetItem(category: 'sub', limit: 600, spent: 206),
  ];

  static List<UpcomingItem> upcoming = const [
    UpcomingItem(date: '06-11', name: '爱奇艺 黄金', amount: 25, kind: '订阅'),
    UpcomingItem(date: '06-14', name: 'ChatGPT Plus', amount: 145, kind: '订阅'),
    UpcomingItem(date: '06-19', name: 'iCloud 200G', amount: 21, kind: '订阅'),
    UpcomingItem(date: '06-21', name: '威尔士健身', amount: 299, kind: '订阅'),
    UpcomingItem(date: '06-25', name: '消费贷 月供', amount: 2180, kind: '贷款'),
    UpcomingItem(date: '07-06', name: '房贷 月供', amount: 9850, kind: '贷款'),
  ];

  static List<TagItem> tags = const [
    TagItem(name: '咖啡', count: 8),
    TagItem(name: '外卖', count: 23),
    TagItem(name: '打车', count: 14),
    TagItem(name: '数码', count: 5),
    TagItem(name: '囤货', count: 6),
    TagItem(name: '差旅', count: 3),
  ];

  static List<num> netTrend = const [
    243.1,
    245.8,
    248.0,
    250.4,
    252.9,
    255.1,
    258.6,
    261.0,
    263.7,
    264.9,
    266.8,
    268.4,
  ];
  static List<num> dailySpend = const [
    120,
    0,
    340,
    86,
    52,
    1299,
    0,
    210,
    45,
    860,
    33,
    520,
    98,
    0,
    186,
    402,
    75,
    640,
    0,
    55,
    2553,
    39,
    98,
    0,
    1299,
    52,
    9889,
    238,
    34,
    260,
  ];
  static List<CalendarDaySummary> calendarDays = const [
    CalendarDaySummary(year: 2026, month: 6, day: 1, spend: 120, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 2, spend: 0, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 3, spend: 340, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 4, spend: 86, income: 28600),
    CalendarDaySummary(year: 2026, month: 6, day: 5, spend: 1351, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 6, spend: 9889, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 7, spend: 252, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 8, spend: 210, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 9, spend: 45, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 10, spend: 860, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 11, spend: 33, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 12, spend: 520, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 13, spend: 98, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 14, spend: 0, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 15, spend: 186, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 16, spend: 402, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 17, spend: 75, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 18, spend: 640, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 19, spend: 0, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 20, spend: 55, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 21, spend: 2553, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 22, spend: 39, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 23, spend: 98, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 24, spend: 0, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 25, spend: 1299, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 26, spend: 52, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 27, spend: 9889, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 28, spend: 238, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 29, spend: 34, income: 0),
    CalendarDaySummary(year: 2026, month: 6, day: 30, spend: 260, income: 0),
  ];

  static num get totalAssets =>
      accounts.fold<num>(0, (sum, account) => sum + account.balance);
  static num get liquidAssets => accounts
      .where((account) => account.kind == 'liquid')
      .fold<num>(0, (sum, account) => sum + account.balance);
  static num get totalLiabilities =>
      liabilityAccounts.fold<num>(0, (sum, item) => sum + item.balance);
  static num get loanPrincipalTotal =>
      liabilities.fold<num>(0, (sum, item) => sum + item.remaining);
  static num get netWorth => totalAssets - totalLiabilities;
  static num get monthOut =>
      categorySpend.fold<num>(0, (sum, item) => sum + item.amount);
  static num monthIn = 30228;
  static num get monthNet => monthIn - monthOut;
  static num get budgetTotal =>
      budgets.fold<num>(0, (sum, item) => sum + item.limit);
  static num get budgetSpent =>
      budgets.fold<num>(0, (sum, item) => sum + item.spent);
  static num get subscriptionMonthly => subscriptions.fold<num>(
    0,
    (sum, item) => sum + (item.cycle == '年' ? item.amount / 12 : item.amount),
  );
  static num get upcomingTotal =>
      upcoming.fold<num>(0, (sum, item) => sum + item.amount);

  static String categoryName(String key) => categoryMeta[key]?.name ?? '其他';
  static Color categoryColor(String key) =>
      categoryMeta[key]?.color ?? FlowmColors.other;

  static void useSnapshot(MobileLedgerSnapshot snapshot) {
    accounts = snapshot.accounts;
    liabilityAccounts = snapshot.liabilityAccounts;
    liabilities = snapshot.liabilities;
    subscriptions = snapshot.subscriptions;
    transactions = snapshot.transactions;
    categoryMeta = snapshot.categoryMeta;
    categorySpend = snapshot.categorySpend;
    budgets = snapshot.budgets;
    upcoming = snapshot.upcoming;
    tags = snapshot.tags;
    netTrend = snapshot.netTrend;
    dailySpend = snapshot.dailySpend;
    calendarDays = snapshot.calendarDays;
    monthIn = snapshot.monthIn;
    dashboardSubtitle = snapshot.dashboardSubtitle;
    calendarMonthLabel = snapshot.calendarMonthLabel;
    cashflowSubtitle = snapshot.cashflowSubtitle;
    lastSyncLabel = snapshot.lastSyncLabel;
  }
}
