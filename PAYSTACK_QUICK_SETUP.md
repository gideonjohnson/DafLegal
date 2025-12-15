# ⚡ Paystack Quick Setup - 25 Minutes

## Why Paystack?
Perfect for African markets:
- Lower fees: 1.5% + KES 25 (vs Stripe's 2.9% + $0.30)
- M-Pesa support (Kenya)
- Local payment methods
- Built for Africa

---

## Step 1: Create Account (5 min)

1. **Go to:** https://dashboard.paystack.com/signup
2. **Sign up** with email
3. **Choose country:** Kenya (or your country)
4. **Verify** your email
5. **Switch to TEST MODE** (toggle top right)

---

## Step 2: Get API Keys (2 min)

1. **Go to:** Settings → API Keys & Webhooks
2. **Copy these:**

```
Test Public Key: pk_test_xxxxx
Test Secret Key: sk_test_xxxxx
```

---

## Step 3: Create Plans (10 min)

1. **Go to:** Commerce → Plans
2. **Create Plan 1:**
   ```
   Name: DafLegal Pro
   Amount: 9900 (KES 99.00)
   Interval: Monthly
   Currency: KES
   ```
   **Copy Plan Code:** `PLN_xxxxx`

3. **Create Plan 2:**
   ```
   Name: DafLegal Enterprise
   Amount: 49900 (KES 499.00)
   Interval: Monthly
   Currency: KES
   ```
   **Copy Plan Code:** `PLN_xxxxx`

---

## Step 4: Configure Webhook (3 min)

1. **Go to:** Settings → API Keys & Webhooks
2. **Webhook URL:** `https://daflegal-backend.onrender.com/api/v1/billing/webhook/paystack`
3. **Click:** Save

---

## Step 5: Add to Render (5 min)

### Backend Variables

**Go to:** https://dashboard.render.com → daflegal-backend → Environment

Add these:
```bash
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_PLAN_CODE_PRO=PLN_xxxxx
PAYSTACK_PLAN_CODE_ENTERPRISE=PLN_xxxxx
PAYSTACK_SUCCESS_URL=https://daflegal-frontend.onrender.com/dashboard?payment=success
PAYSTACK_CANCEL_URL=https://daflegal-frontend.onrender.com/pricing?payment=canceled
PAYMENT_PROVIDER=paystack
```

### Frontend Variables

**Go to:** daflegal-frontend → Environment

Add these:
```bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
NEXT_PUBLIC_PAYMENT_PROVIDER=paystack
```

**Click Save Changes** on both!

---

## Step 6: Test (5 min)

1. **Go to:** https://daflegal-frontend.onrender.com/pricing
2. **Click:** Upgrade to Pro
3. **Use test card:**
   ```
   Card: 4084 0840 8408 4081
   Expiry: 12/25
   CVV: 123
   PIN: 0000
   OTP: 123456
   ```
4. **Verify** payment in Paystack dashboard

---

## ✅ Checklist

- [ ] Created Paystack account
- [ ] Got API keys (public + secret)
- [ ] Created 2 plans (Pro + Enterprise)
- [ ] Copied plan codes
- [ ] Set webhook URL
- [ ] Added 7 backend variables
- [ ] Added 2 frontend variables
- [ ] Saved changes
- [ ] Tested payment

---

## 🎯 Test Cards

**Success:**
- Card: 4084 0840 8408 4081

**Declined:**
- Card: 5060 6666 6666 6666

**M-Pesa (Kenya):**
- Phone: 0700000000
- PIN: Any 4 digits

---

## 💰 Fees (Kenya)

Local cards: 1.5% + KES 25
M-Pesa: 1.5% + KES 25
International: 3.9% + KES 100

---

**Time:** 25 minutes
**Difficulty:** Easy ⭐⭐

See **SETUP_PAYSTACK.md** for full details!
