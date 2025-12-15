# Paystack Payment Integration - Test Checklist

## ✅ Deployment Status

**Pricing Page Updated:** ✅ Live at https://daflegal-frontend.onrender.com/pricing

**New Pricing Tiers:**
- ✅ Free: $0 (limited features)
- ✅ Basic: $29/month (~KES 3,770)
- ✅ Pro: $49/month (~KES 6,370)
- ✅ Enterprise: $299/month (~KES 38,870)

---

## 🧪 Manual Test Steps

### Test 1: Verify Pricing Display

1. **Visit:** https://daflegal-frontend.onrender.com/pricing
2. **Check:**
   - ✅ All 4 pricing tiers are displayed
   - ✅ Prices show: $0, $29, $49, $299
   - ✅ KES conversions are visible below each price
   - ✅ "Pro" plan has "Most Popular" badge
   - ✅ Toggle between Monthly/Annual billing works

**Expected Result:** All pricing tiers display correctly with KES conversions

---

### Test 2: Free Plan Signup

1. **Click:** "Get Started Free" button on Free tier
2. **Expected:** Redirect to `/auth/signup`

**Status:** _______________

---

### Test 3: Paid Plan - Not Logged In

1. **Make sure you're logged out** (open incognito window)
2. **Visit:** https://daflegal-frontend.onrender.com/pricing
3. **Click:** "Start Basic Plan" or "Start Pro Plan" or "Start Enterprise"
4. **Expected:** Redirect to `/auth/signup?plan=basic` (or pro/enterprise)

**Status:** _______________

---

### Test 4: Paystack Payment Modal - Basic Plan

**Prerequisites:**
- Create an account or login at https://daflegal-frontend.onrender.com/auth/signin

**Steps:**
1. **Login** to your account
2. **Visit:** https://daflegal-frontend.onrender.com/pricing
3. **Click:** "Start Basic Plan" button
4. **Expected:**
   - Paystack payment modal should appear
   - Shows: **$29** payment amount
   - Shows: Your email address
   - Shows: DafLegal Basic plan

5. **Enter Test Card:**
   ```
   Card Number: 4084 0840 8408 4081
   Expiry: 12/25
   CVV: 123
   PIN: 0000 (if prompted)
   OTP: 123456 (if prompted)
   ```

6. **Complete Payment**

7. **Expected:**
   - Payment success message appears
   - Redirect to `/dashboard?payment=success`
   - Payment appears in Paystack dashboard: https://dashboard.paystack.com/#/transactions

**Status:** _______________

---

### Test 5: Paystack Payment Modal - Pro Plan

**Steps:**
1. **Login** to your account (or use test account)
2. **Visit:** https://daflegal-frontend.onrender.com/pricing
3. **Click:** "Start Pro Plan" button
4. **Expected:**
   - Paystack modal appears
   - Shows: **$49** payment amount
   - Plan Code: `PLN_qsdxwz1p17wbp1n`

5. **Use same test card** and complete payment
6. **Verify** in Paystack dashboard

**Status:** _______________

---

### Test 6: Paystack Payment Modal - Enterprise Plan

**Steps:**
1. **Login** to your account
2. **Visit:** https://daflegal-frontend.onrender.com/pricing
3. **Click:** "Start Enterprise" button
4. **Expected:**
   - Paystack modal appears
   - Shows: **$299** payment amount
   - Plan Code: `PLN_rrlbrmigelan0zl`

5. **Complete payment**
6. **Verify** in Paystack dashboard

**Status:** _______________

---

### Test 7: Annual Billing (20% Discount)

**Steps:**
1. **Toggle** to "Annual" billing on pricing page
2. **Verify prices:**
   - Basic: $23.20/month ($278.40/year)
   - Pro: $39.20/month ($470.40/year)
   - Enterprise: $239.20/month ($2,870.40/year)
3. **Click** on a plan
4. **Expected:** Paystack modal shows annual amount (12 months × monthly price)

**Status:** _______________

---

### Test 8: Payment Cancellation

**Steps:**
1. **Click** on any paid plan
2. **When Paystack modal appears,** click "Close" or press ESC
3. **Expected:**
   - Modal closes
   - User stays on pricing page
   - No payment is processed

**Status:** _______________

---

### Test 9: Browser Console Check

**Steps:**
1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Click** on a paid plan
4. **Check for:**
   - ✅ Paystack script loads from `https://js.paystack.co/v1/inline.js`
   - ✅ No JavaScript errors
   - ✅ When payment succeeds, console logs: `Payment successful: {reference: '...'}`

**Status:** _______________

---

### Test 10: Webhook Verification

**Steps:**
1. **Complete a test payment**
2. **Go to Paystack Dashboard:** https://dashboard.paystack.com/#/webhooks
3. **Check webhook logs**
4. **Expected:**
   - Webhook to `https://daflegal-backend.onrender.com/api/v1/billing/webhook/paystack` was called
   - Status: 200 OK (or appropriate response)
   - Event type: `charge.success` or `subscription.create`

**Status:** _______________

---

## 🔧 Environment Variables Check

### Frontend Variables

**Render Dashboard:** https://dashboard.render.com → daflegal-frontend → Environment

Expected variables:
```bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_92ee1bde3b5480561043571077d004d6316fa283
NEXT_PUBLIC_PAYMENT_PROVIDER=paystack
NEXT_PUBLIC_PAYSTACK_PLAN_CODE_BASIC=PLN_ju9c70d3e2w6ckx
NEXT_PUBLIC_PAYSTACK_PLAN_CODE_PRO=PLN_qsdxwz1p17wbp1n
NEXT_PUBLIC_PAYSTACK_PLAN_CODE_ENTERPRISE=PLN_rrlbrmigelan0zl
```

**Status:** _______________

### Backend Variables

**Render Dashboard:** https://dashboard.render.com → daflegal-backend → Environment

Expected variables:
```bash
PAYSTACK_SECRET_KEY=sk_test_8d8267e6734002615af06a197d66e942cb4e9e3d
PAYSTACK_PUBLIC_KEY=pk_test_92ee1bde3b5480561043571077d004d6316fa283
PAYSTACK_PLAN_CODE_BASIC=PLN_ju9c70d3e2w6ckx
PAYSTACK_PLAN_CODE_PRO=PLN_qsdxwz1p17wbp1n
PAYSTACK_PLAN_CODE_ENTERPRISE=PLN_rrlbrmigelan0zl
PAYSTACK_SUCCESS_URL=https://daflegal-frontend.onrender.com/dashboard?payment=success
PAYSTACK_CANCEL_URL=https://daflegal-frontend.onrender.com/pricing?payment=canceled
PAYMENT_PROVIDER=paystack
```

**Status:** _______________

---

## 🐛 Common Issues & Fixes

### Issue 1: Paystack Modal Doesn't Appear

**Symptoms:** Button click does nothing, no modal appears

**Fixes:**
1. Check browser console for errors
2. Verify Paystack script loaded: Look for `<script src="https://js.paystack.co/v1/inline.js">`
3. Check if `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set in frontend env vars
4. Hard refresh the page (Ctrl+Shift+R)

---

### Issue 2: "Invalid API Key" Error

**Symptoms:** Error message when payment modal opens

**Fixes:**
1. Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` starts with `pk_test_`
2. Make sure you're using TEST keys, not LIVE keys
3. Check Paystack dashboard: https://dashboard.paystack.com/settings/developer

---

### Issue 3: Wrong Amount Displayed

**Symptoms:** Modal shows different price than expected

**Fixes:**
1. Check `pricingTiers` array in `frontend/src/app/pricing/page.tsx`
2. Verify Monthly/Annual toggle is working correctly
3. Amount should be in cents (multiply by 100)

---

### Issue 4: Payment Succeeds But User Not Upgraded

**Symptoms:** Payment successful in Paystack, but user plan unchanged

**Fixes:**
1. Check webhook is configured: `https://daflegal-backend.onrender.com/api/v1/billing/webhook/paystack`
2. Verify backend webhook handler exists
3. Check Paystack webhook logs for errors
4. Verify backend has correct `PAYSTACK_SECRET_KEY`

---

### Issue 5: Modal Opens But Won't Close

**Symptoms:** Can't close Paystack modal

**Fixes:**
1. Press ESC key
2. Click outside the modal
3. Refresh the page if stuck

---

## ✅ Final Checklist

Before going to production (switching to LIVE keys):

- [ ] All test payments work correctly (Test 4, 5, 6)
- [ ] Annual billing works (Test 7)
- [ ] Webhook receives events from Paystack (Test 10)
- [ ] Free plan signup works (Test 2)
- [ ] Non-logged-in users redirect correctly (Test 3)
- [ ] Payment cancellation works (Test 8)
- [ ] No console errors (Test 9)
- [ ] Environment variables verified (Frontend + Backend)
- [ ] All 3 plan codes are correct in Paystack
- [ ] Success/Cancel URLs redirect correctly

---

## 🚀 Next Steps

Once all tests pass:

1. **Create LIVE Paystack Plans**
   - Switch to LIVE mode in Paystack dashboard
   - Create same 3 plans (Basic, Pro, Enterprise)
   - Get new LIVE plan codes

2. **Update Environment Variables**
   - Replace all `pk_test_*` with `pk_live_*`
   - Replace all `sk_test_*` with `sk_live_*`
   - Update plan codes with LIVE versions

3. **Final Production Test**
   - Test with real card (small amount)
   - Verify webhook works in production
   - Confirm user upgrade happens automatically

4. **Monitor**
   - Watch Paystack dashboard for real transactions
   - Monitor backend logs for webhook events
   - Check user plan upgrades are working

---

**Test Date:** _______________
**Tested By:** _______________
**All Tests Passed:** ☐ Yes ☐ No

**Notes:**
_______________________________________
_______________________________________
_______________________________________
