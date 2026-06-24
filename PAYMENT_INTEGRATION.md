# Payment Integration

This project uses one internal paid-order confirmation endpoint and keeps payment providers behind an adapter layer.

## Current payment contract

Endpoint:

```text
POST /api/payments/notify
```

Required secret:

```text
PAYMENT_WEBHOOK_SECRET=your-long-random-secret
```

The secret can be sent either as a header or body field:

```text
x-payment-secret: your-long-random-secret
```

Body shape:

```json
{
  "orderId": "order_xxx",
  "provider": "wechat|alipay|stripe|manual-test",
  "secret": "optional-if-header-is-used"
}
```

Successful response:

```json
{
  "ok": true,
  "idempotent": false,
  "message": "支付通知已确认，权益已发放。"
}
```

Repeated notification response:

```json
{
  "ok": true,
  "idempotent": true,
  "message": "订单已支付，重复通知已忽略。"
}
```

## Provider adapter rule

Do not put provider-specific code inside report generation or user entitlement logic. A payment adapter only needs to verify the provider signature, extract the internal order id, and call the internal confirmation contract.

```text
payment provider callback
  -> verify provider signature
  -> extract orderId / provider trade id / paid amount
  -> POST /api/payments/notify
  -> order becomes paid
  -> credits or membership are granted once
```

## Provider mapping

| Provider | External field to map | Internal field |
| --- | --- | --- |
| WeChat Pay | out_trade_no | orderId |
| Alipay | out_trade_no | orderId |
| Stripe | metadata.orderId | orderId |
| Manual test | orderId | orderId |

## Manual smoke test

```bash
curl -X POST https://your-domain.com/api/payments/notify \
  -H "content-type: application/json" \
  -H "x-payment-secret: your-long-random-secret" \
  -d "{\"orderId\":\"order_xxx\",\"provider\":\"manual-test\"}"
```

Then check the order from a logged-in user session:

```text
GET /api/orders/:orderId
```

## Production notes

- Keep `PAYMENT_WEBHOOK_SECRET` as a Cloudflare Secret, not a public Vite variable.
- Real provider callbacks must verify the official signature before calling this internal endpoint.
- The frontend never receives merchant private keys.
- Repeated callbacks must remain safe: an already paid order should not grant credits twice.
- Refunds, chargebacks, invoices, and reconciliation are not implemented yet.
## 通用 HMAC 支付网关适配

本项目现在支持 `generic_hmac` 支付通道，用来承接你自己的支付中转服务、微信/支付宝服务端网关或第三方收银台。

### 需要配置的变量

- `DEFAULT_PAYMENT_PROVIDER=generic_hmac`
- `PAYMENT_CHECKOUT_BASE_URL`：你的收银台地址。创建订单后，前端会打开这个地址。
- `PAYMENT_CHECKOUT_SECRET`：生成收银台跳转签名；不填时使用 `PAYMENT_WEBHOOK_SECRET`。
- `PAYMENT_WEBHOOK_SECRET`：支付通知验签密钥，长度建议 32 位以上。

### 创建订单后的收银台参数

如果配置了 `PAYMENT_CHECKOUT_BASE_URL`，后端会返回并打开：

```text
{PAYMENT_CHECKOUT_BASE_URL}?orderId=xxx&amount=1990&provider=generic_hmac&plan=single&sign=xxx
```

`sign` 的计算逻辑：

```text
HMAC_SHA256_BASE64URL(orderId.amount.userId.provider, PAYMENT_CHECKOUT_SECRET)
```

### 支付成功回调

你的支付中转服务应 POST 到：

```text
/api/payments/notify
```

请求头：

```text
x-payment-timestamp: 2026-06-24T10:00:00.000Z
x-payment-signature: HMAC_SHA256_BASE64URL(`${timestamp}.${rawBody}`, PAYMENT_WEBHOOK_SECRET)
```

请求体示例：

```json
{
  "provider": "generic_hmac",
  "orderId": "order_xxx",
  "amount": 1990,
  "transactionId": "pay_gateway_123"
}
```

后端会校验签名、订单是否存在、金额是否一致，并且幂等发放套餐权益。微信、支付宝、Stripe 的正式 SDK 可以先在你的支付中转服务完成平台签名校验，再映射成上述统一回调格式。
