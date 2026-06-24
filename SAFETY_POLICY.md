# Safety Policy

The site treats Chinese metaphysics as traditional culture, symbolic consultation, reflection, and entertainment reference. It must not be positioned as deterministic prophecy or professional advice.

## Blocked request categories

The backend blocks report generation when the user request asks for:

- death dates, lifespan claims, or fatalistic disaster prediction
- medical diagnosis, medication, surgery, treatment, pregnancy-risk decisions
- lottery, gambling, or guaranteed winning numbers
- stock, crypto, futures, leverage, or direct buy/sell instructions
- curses, revenge, harming others, or supernatural harm instructions
- fear-based paid services such as paid disaster removal, guaranteed reunion, or guaranteed wealth

## Backend behavior

When a blocked category is detected, `/api/reports` returns:

```json
{
  "ok": false,
  "code": "HIGH_RISK_QUERY",
  "category": "DEATH|MEDICAL|GAMBLING|INVESTMENT|HARM|FEAR_UPSELL",
  "message": "..."
}
```

No credits are deducted for blocked requests.

## Allowed rewrite direction

A blocked request can be reframed into safer prompts such as:

- 当前处境有哪些可整理的因素？
- 接下来 30 天我可以怎样规划？
- 我如何沟通、复盘、准备选择？
- 哪些现实信息需要找专业人士确认？

## Product rule

Do not sell fear. Do not claim certainty. Do not imply that payment can remove disaster.
