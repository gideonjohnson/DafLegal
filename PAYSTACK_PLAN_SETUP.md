# Paystack Plan Setup - Quick Reference

When creating plans in Paystack, use these exact values:

---

## Plan 1: Basic

```
Name: DafLegal Basic
Description: Solo practitioners & small firms - 20 contracts/month
Amount: 2900 (enter as 2900 for $29.00)
Interval: Monthly
Currency: USD
```

**After creation, copy Plan Code:** `PLN_____________`

**KES Equivalent:** KES 3,770 (approximately)

---

## Plan 2: Pro

```
Name: DafLegal Pro
Description: Growing firms - 100 contracts/month, compliance & team features
Amount: 4900 (enter as 4900 for $49.00)
Interval: Monthly
Currency: USD
```

**After creation, copy Plan Code:** `PLN_____________`

**KES Equivalent:** KES 6,370 (approximately)

---

## Plan 3: Enterprise

```
Name: DafLegal Enterprise
Description: Large firms - Unlimited contracts, API access, white-label
Amount: 29900 (enter as 29900 for $299.00)
Interval: Monthly
Currency: USD
```

**After creation, copy Plan Code:** `PLN_____________`

**KES Equivalent:** KES 38,870 (approximately)

---

## Free Plan

**No Paystack plan needed!**

Free plan is handled in your application code. Users get:
- 3 contracts/month
- 30 pages per contract
- No payment required

---

## Environment Variables to Add

After creating all plans, you'll add to Render:

```bash
PAYSTACK_PLAN_CODE_BASIC=PLN_____________
PAYSTACK_PLAN_CODE_PRO=PLN_____________
PAYSTACK_PLAN_CODE_ENTERPRISE=PLN_____________
```

---

## Notes

- **Currency:** Using USD because Paystack supports it globally
- **Amount format:** Enter without decimal (2900 = $29.00)
- **Interval:** All are "Monthly" recurring
- **Test Mode:** Create these in TEST mode first!

---

See **PRICING_STRUCTURE.md** for full feature list and justification.
