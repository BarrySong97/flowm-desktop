import { describe, expect, it } from "vitest"
import * as XLSX from "xlsx"
import {
  parseAlipayPersonalCsv,
  parseWeChatPersonalXlsx,
} from "../src"

describe("statement import parsers", () => {
  it("normalizes Alipay personal CSV rows", () => {
    const csv = [
      "支付宝交易明细证明",
      "交易时间,交易分类,交易对方,对方账号,商品说明,收/支,金额,收/付款方式,交易状态,交易订单号,商家订单号,备注",
      "2026-01-02 08:03:04,餐饮美食,早餐店,,豆浆,支出,8.50,余额宝,交易成功,ALI-1,M-1,",
      "2026-01-03 09:10:11,转账红包,张三,zhang@example.com,转账收款,收入,100.00,账户余额,交易成功,ALI-2,,",
      "2026-01-04 10:00:00,投资理财,余额宝,,收益发放,不计收支,0.18,余额宝,交易成功,ALI-3,,",
      "2026-01-05 10:00:00,日用百货,小店,,若恶意投诉直接封禁会员账号不退款,支出,15.90,余额宝,交易成功,ALI-4,,",
      "2026-01-06 10:00:00,退款,蚂蚁财富-蚂蚁（杭州）基金销售有限公司,,蚂蚁财富-富国全球科技互联网股票(QDII)A-买入退款,不计收支,500.00,余额宝,退款成功,ALI-5,,",
      "2026-01-07 10:00:00,投资理财,蚂蚁财富-蚂蚁（杭州）基金销售有限公司,,蚂蚁财富-富国全球科技互联网股票(QDII)A-买入,不计收支,500.00,余额宝,退款成功,ALI-6,,",
    ].join("\n")

    const result = parseAlipayPersonalCsv(csv)

    expect(result.summary.total).toBe(6)
    expect(result.entries[0]).toMatchObject({
      sourceAccountName: "Assets:Investments:Yuebao",
      direction: "expense",
      classification: "external_expense_candidate",
      amountNumber: "8.50",
    })
    expect(result.entries[1]).toMatchObject({
      sourceAccountName: "Assets:Wallet:Alipay:Balance",
      classification: "personal_transfer_candidate",
    })
    expect(result.entries[2]).toMatchObject({
      classification: "investment_income_candidate",
    })
    expect(result.entries[3]).toMatchObject({
      classification: "external_expense_candidate",
    })
    expect(result.entries[4]).toMatchObject({
      classification: "investment_refund_candidate",
    })
    expect(result.entries[5]).toMatchObject({
      classification: "investment_refund_candidate",
    })
  })

  it("normalizes WeChat Pay XLSX rows", () => {
    const rows = [
      ["微信支付账单明细"],
      [],
      ["交易时间", "交易类型", "交易对方", "商品", "收/支", "金额(元)", "支付方式", "当前状态", "交易单号", "商户单号", "备注"],
      [45294.5, "商户消费", "便利店", "饮料", "支出", "6.00", "零钱", "支付成功", "WX-1", "WM-1", ""],
      [45295.25, "转账", "李四", "转账", "收入", "20.00", "/", "已存入零钱", "WX-2", "", ""],
      [45296, "零钱通转出-到工商银行(0854)", "零钱通", "零钱通转出", "不计收支", "200.00", "零钱通", "已到账", "WX-3", "", ""],
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "微信支付账单")
    const input = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer

    const result = parseWeChatPersonalXlsx(input)

    expect(result.summary.total).toBe(3)
    expect(result.entries[0]).toMatchObject({
      sourceAccountName: "Assets:Wallet:WeChat:Balance",
      classification: "external_expense_candidate",
    })
    expect(result.entries[1]).toMatchObject({
      sourceAccountName: "Assets:Wallet:WeChat:Balance",
      classification: "personal_transfer_candidate",
    })
    expect(result.entries[2]).toMatchObject({
      sourceAccountName: "Assets:Investments:WeChatChangePlus",
      classification: "internal_transfer_candidate",
    })
  })
})
