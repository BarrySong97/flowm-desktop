# 订阅读取时投影计划

## 背景

订阅计划当前会在账本打开、跨越本地日期以及创建订阅时，把未来扣费写入
`subscription_occurrences`。这让可由计划规则确定的展示数据成为第二份持久化状态：
计划修改后旧 occurrence 会残留，`subscriptions.next_charge_date` 也不会随时间推进。
详情页还把已过计划日期的 forecast occurrence 表述为「累计已扣」和「扣款记录」，
与 Flowm 的非对称财务模型冲突。

订阅不需要逐期对账。真实扣款来自 `cashflow_events`，用户通过 `object_links` 把流水
绑定到订阅；计划日期只负责描述未来可能发生的扣费。

## 目标

- `subscriptions` 是订阅预测的唯一持久化事实来源。
- 任何日期窗口内的订阅预测都由共享纯函数按读取时间即时投影，不写 SQLite。
- 桌面订阅页和首页不再查询或触发生成 `subscription_occurrences`。
- 实际扣款列表和累计金额只来自用户绑定的真实流水。
- 修改计划后所有预测展示立即按新规则重算，不存在新旧日程混合。
- 贷款 occurrence 及其日期推导保持不变；本计划只处理订阅。

## 设计

### 共享投影规则

在 `@flowm/shared` 增加浏览器安全的订阅投影工具：

- 输入最小计划字段、`dateFrom` 和 `dateTo`。
- 输出稳定的虚拟 occurrence，展示键为 `subscriptionId + dueDate`。
- 周期必须从原始锚点计算第 N 期，不能从上一个被月末截断的日期继续累加；
  例如 1 月 31 日应投影为 2 月 28/29 日、3 月 31 日。
- 日期使用 `YYYY-MM-DD` 和 UTC 日历运算处理规则本身；「今天」边界由调用方使用
  本地日期键提供。
- 下次扣费取 `dueDate >= localToday` 的第一期，包含今天。

### 桌面读取与展示

- 订阅列表、月历和首页未来扣费从 active plans 在渲染时投影。
- 详情页把预测区改为「扣费计划」，不把已过预测称作实际扣款。
- 详情页读取 `cashflow.linkedTo`，以绑定流水计算「已关联扣款」数量和合计；
  现有抽屉继续负责绑定与解绑。
- 不再使用 occurrence 推断「已订阅多久」或「开始日期」；没有独立可靠字段前移除
  这两个断言。

### API、CLI 与兼容

- 删除订阅 occurrence 生成 API 和桌面账本维护调用。
- `listSubscriptionOccurrences` 在过渡期改为从 plan 读取时投影，供 CLI 或旧消费者
  兼容；它不访问 occurrence 表，返回的 ID 为稳定虚拟 ID。
- CLI 的 generate 命令移除，list/get 命令继续输出读取时投影结果。
- `getFutureFixedPressure` 的订阅部分从 active plans 投影，贷款部分继续读取贷款
  occurrence。

### 旧表与数据

- 本次先让 `subscription_occurrences` 退出运行时和产品读路径，并清除新账本/demo seed
  对它的依赖。
- 为降低用户数据库迁移风险，旧表可以保留为未使用的兼容表；代码和文档明确它不再是
  产品状态。确认移动端和历史工具完成迁移后，再单独删除表。
- 已有旧行不会再影响任何页面或统计，无需逐条修复。

## 验证

- 共享纯函数覆盖月付、年付、自定义间隔、月末、闰年、窗口边界和今天包含规则。
- API 测试证明 list occurrence 为读取时投影且不写表，修改 plan 后结果立即改变。
- API 测试证明未来压力从 plans 计算，且不会创建现金流或资产记录。
- Renderer 测试覆盖首页使用虚拟 occurrence；详情的累计金额只来自绑定流水。
- 用 7 月 1 日月付计划在 8 月 7 日验证：列表下次为 9 月 1 日，计划区可展示日期，
  没有绑定流水时实际扣款为 0。
- 运行受影响的类型检查和测试，再运行 `pnpm check-architecture`、`pnpm check-types`、
  `pnpm test`、`pnpm build`、`pnpm check-docs`（可行时补充 lint/format）。

## 非目标

- 不自动匹配流水与某个虚拟周期。
- 不根据预测生成现金流或资产变化。
- 不在本次改造贷款的持久化还款计划。
- 不支持单期跳过、单期改价等例外；将来若需要，新增稀疏 override，而不是重新物化
  全量 occurrence。

## 实施结果

- 已完成共享投影、桌面/网页/移动端读取切换、API/CLI 兼容投影和未来压力改造。
- 已移除订阅生成 API、CLI 命令、创建时生成以及账本打开/跨日维护写入。
- demo 与个人 starter 不再创建订阅 occurrence；旧兼容表保留但不参与产品读取。
- 详情页已将即时「扣费计划」与绑定的「实际扣款流水」分开。
- `pnpm check-architecture`、`pnpm check-types`、`pnpm test`、`pnpm build`、
  `pnpm check-docs`、`pnpm lint`、`pnpm format:check`、`flutter analyze` 和
  `flutter test` 均通过。
