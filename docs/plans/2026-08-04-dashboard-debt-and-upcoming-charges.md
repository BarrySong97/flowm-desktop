# 首页欠款与即将扣费 Bug 修复计划

## 背景与已确认问题

本计划对应 Flowm 首页的两个问题：

1. 首页「欠款」不会随着贷款还款计划的到期时间推进而下降。
2. 首页「即将扣费」没有展示未来 30 天内的全部扣费，目前最多只展示前几笔。

相关代码链路是：

- `apps/desktop/src/renderer/src/dashboard/OverviewPage.tsx` 负责首页查询、聚合和展示。
- 贷款列表页的 `apps/desktop/src/renderer/src/loans/loanSchedule.ts` 已按非跳过、已到期的 occurrence 推导 `paid` 和 `remain`。
- `packages/api/src/use-cases/dashboard/dashboard-api.ts` 的 `getNetWorthSnapshot()` 目前直接把贷款的 `currentPrincipalEstimate` 加入负债，未使用到期日推导后的剩余本金。
- 首页 `useUpcoming()` 在未来 30 天筛选之后调用 `.slice(0, 6)`，会截断结果；它还用当前时刻与 UTC 日期比较，可能把今天的扣费误判为已过期。

## 修改方案

### Bug 1：首页欠款随贷款时间减少

1. 让首页使用与贷款列表页相同的日期推导结果：按本地日期统计每笔贷款截至今天的非跳过 occurrence，并取最新已到期 occurrence 的 `remainingPrincipalEstimate`。
2. 抽取或复用 `buildLoanSchedule()` 的纯计算逻辑，避免首页和贷款页各自实现一套还款进度算法。
3. 首页欠款聚合时，将日期推导后的贷款剩余本金与当前 liability asset snapshot 分开换算后相加；保留现有多币种转换和缺失汇率降级行为。
4. 只在读取/展示时计算，不更新 `loan_payment_occurrences.status`、`loans.currentPrincipalEstimate`、现金流或资产快照，继续遵守贷款计划是预测层的约束。
5. 明确首页欠款与贷款列表页欠款总额的一致性，并避免用未推导的 `assets.netWorth` 数值覆盖首页显示结果。

### Bug 2：展示未来 30 天全部扣费

1. 首页查询窗口直接按本地日期生成 `[今天, 今天 + 30 天]`，或继续查询更大的维护窗口但在展示层严格使用同一套日期边界。
2. 将 occurrence 的日期比较改为日期键比较，不使用带时分秒的 `Date` 差值；确保今天的扣费包含在列表中。
3. 合并订阅和贷款 occurrence 后，排除 `skipped` 等不应显示的预测记录，按 `dueDate` 稳定排序。
4. 删除固定 `.slice(0, 6)` 截断，展示窗口内的全部扣费；如果 UI 高度不足，使用已有滚动容器承载完整列表，而不是丢数据。
5. 「未来 30 天 · N 笔」和总金额都基于同一份完整列表计算，避免数量、金额和明细不一致。

## 验证计划

- 增加贷款日期推导测试：到期日前、到期日当天、连续多个到期日之后，首页展示的剩余本金分别保持、下降并与贷款页一致；确认 occurrence 状态和数据库存储值不变。
- 增加首页 upcoming 纯函数测试：包含今天、未来第 30 天、超过 30 天、跳过记录，以及超过 6 笔记录时，断言今天和第 30 天包含、超窗和跳过记录排除、所有有效记录均保留。
- 运行受影响的 API/renderer 测试，再运行 `pnpm check-types`、`pnpm test`、`pnpm build` 和 `pnpm check-docs`（可行时补充 `pnpm lint`、`pnpm format:check`）。
- 手动打开首页，使用至少两笔贷款和超过六笔订阅/贷款扣费的数据验证：日期推进后欠款下降，未来 30 天明细完整，今天的扣费可见，多币种总额仍正确。

## 注意事项

- 不把贷款预测 occurrence 转换成实际现金流，也不通过导入流水推断资产余额。
- 如实现时需要调整 `getNetWorthSnapshot()` 的整体语义，应先单独确认其与现有非对称财务模型及 ADR 0001/0009 的关系；本 Bug 的最小修复优先限定在首页展示读取逻辑。
