# Payment Integration

This project exposes only two payment choices to users:

- WeChat Pay
- Alipay

## Current implemented mode

The site can display WeChat and Alipay QR codes on the order page:

```env
PAYMENT_RECEIVER_NAME=your-name
PAYMENT_WECHAT_QR_URL=/assets/pay-wechat.jpg
PAYMENT_ALIPAY_QR_URL=/assets/pay-alipay.jpg
DEFAULT_PAYMENT_PROVIDER=wechat
```

The QR images are stored in:

```text
public/assets/pay-wechat.jpg
public/assets/pay-alipay.jpg
```

## Important limitation

Personal WeChat / Alipay collection QR codes do not provide a server-to-server payment callback. A website cannot reliably detect personal QR payments automatically.

For true automatic detection and benefit granting, use one of these:

1. WeChat Pay merchant account callback.
2. Alipay Open Platform merchant callback.
3. A licensed aggregate payment provider that supports WeChat and Alipay callbacks.

After the provider verifies payment, it should call the internal confirmation endpoint below.

## Internal payment confirmation endpoint

```text
POST /api/payments/notify
```

Required Cloudflare secret:

```env
PAYMENT_WEBHOOK_SECRET=your-long-random-secret
```

Request example after the payment provider has verified the transaction:

```json
{
  "orderId": "order_xxx",
  "provider": "wechat",
  "amount": 1990,
  "transactionId": "provider_trade_no",
  "secret": "your-long-random-secret"
}
```

Supported provider values:

```text
wechat
alipay
```

Successful response:

```json
{
  "ok": true,
  "idempotent": false,
  "message": "支付通知已确认，权益已发放。"
}
```

The endpoint is idempotent. If the same paid order is notified again, credits or membership will not be granted twice.

## Production rule

Do not expose merchant private keys in frontend code. Provider signature verification should happen on the server or payment gateway side before calling `/api/payments/notify`.
