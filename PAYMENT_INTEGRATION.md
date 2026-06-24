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
