# Paystack Payment Setup Guide for DafLegal

## What is Paystack?

Paystack is Africa's leading payment processor. Perfect for DafLegal because:
- **Accepts payments in:** KES, NGN, GHS, ZAR, USD
- **Lower fees:** 1.5% + KES 25 (Kenya) vs Stripe's 2.9% + $0.30
- **Local optimization:** Built for African markets
- **Mobile money:** M-Pesa, MTN, Airtel Money support
- **Free to start:** No monthly fees, pay only when you earn

## Time Required: 25 minutes

---

## Step 1: Create Paystack Account (5 min)

1. Go to: https://dashboard.paystack.com/signup
2. Sign up with your email
3. Choose your country (Kenya)
4. Verify your email address
5. Complete your profile

**Important:** Start in **Test Mode** (you'll see a toggle for this)

---

## Step 2: Get API Keys (2 min)

1. After login, go to: **Settings** → **API Keys & Webhooks**
2. You'll see two sets of keys:

### Test Mode Keys (Use these first!)

```
Test Public Key: pk_test_xxxxxxxxxxxxx
Test Secret Key: sk_test_xxxxxxxxxxxxx
```

### Live Mode Keys (Use after testing)

```
Live Public Key: pk_live_xxxxxxxxxxxxx
Live Secret Key: sk_live_xxxxxxxxxxxxx
```

**Important:** Keep Secret keys private!

---

## Step 3: Create Subscription Plans (10 min)

### 3.1 Navigate to Plans

1. Go to: **Commerce** → **Plans**
2. Click **Create Plan**

### 3.2 Create Your Plans

#### Plan 1: DafLegal Pro
```
Name: DafLegal Pro
Amount: 9,900 (KES 99.00 or your preferred amount)
Interval: Monthly
Currency: KES (or your currency)
Description: Professional plan - 50 contracts/month, 100 pages/contract
```
Click **Create Plan**

**Copy the Plan Code:** `PLN_xxxxxxxxxxxxx`

#### Plan 2: DafLegal Enterprise
```
Name: DafLegal Enterprise
Amount: 49,900 (KES 499.00 or your preferred amount)
Interval: Monthly
Currency: KES
Description: Enterprise plan - Unlimited contracts, unlimited pages
```
Click **Create Plan**

**Copy the Plan Code:** `PLN_xxxxxxxxxxxxx`

**Note:** Free plan doesn't need a Paystack plan code - it's handled in your app.

---

## Step 4: Configure Webhook (5 min)

Webhooks notify your backend when payments succeed, subscriptions are canceled, etc.

1. Go to: **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhook URL**
3. Enter: `https://daflegal-backend.onrender.com/api/v1/billing/webhook/paystack`
4. Click **Save**

The webhook will automatically be sent these events:
- `charge.success` - Payment succeeded
- `subscription.create` - Subscription created
- `subscription.disable` - Subscription canceled
- `invoice.create` - Invoice created
- `invoice.payment_failed` - Payment failed

---

## Step 5: Set Environment Variables on Render (5 min)

### Backend Environment Variables

Go to: https://dashboard.render.com → **daflegal-backend** → **Environment**

```bash
# Paystack API Keys (Start with test keys!)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Plan Codes
PAYSTACK_PLAN_CODE_PRO=PLN_xxxxxxxxxxxxx
PAYSTACK_PLAN_CODE_ENTERPRISE=PLN_xxxxxxxxxxxxx

# Success/Cancel URLs (for checkout)
PAYSTACK_SUCCESS_URL=https://daflegal-frontend.onrender.com/dashboard?payment=success
PAYSTACK_CANCEL_URL=https://daflegal-frontend.onrender.com/pricing?payment=canceled

# Payment Provider (set to paystack)
PAYMENT_PROVIDER=paystack
```

### Frontend Environment Variables

Go to: **daflegal-frontend** → **Environment**

```bash
# Public key for frontend
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Payment provider
NEXT_PUBLIC_PAYMENT_PROVIDER=paystack
```

Click **Save Changes** on both services.

---

## Step 6: Test Payment Flow (5 min)

### 6.1 Test Checkout

1. Go to your frontend: https://daflegal-frontend.onrender.com/pricing
2. Click **Upgrade to Pro**
3. You'll see Paystack payment modal

### 6.2 Use Test Cards

Paystack provides test cards for different scenarios:

**Successful Payment:**
```
Card number: 4084 0840 8408 4081
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
PIN: 0000 (if prompted)
OTP: 123456 (if prompted)
```

**Declined Payment:**
```
Card number: 5060 6666 6666 6666
```

**Insufficient Funds:**
```
Card number: 5060 6666 6666 6666
(with 1234 as PIN)
```

### 6.3 Verify in Dashboard

1. Go to Paystack Dashboard → **Transactions**
2. You should see your test payment
3. Check **Customers** to see the customer record
4. Check **Subscriptions** to see active subscription

---

## Environment Variables Summary

### Backend (daflegal-backend)

```bash
# Paystack Keys
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Plan Codes
PAYSTACK_PLAN_CODE_PRO=PLN_xxxxxxxxxxxxx
PAYSTACK_PLAN_CODE_ENTERPRISE=PLN_xxxxxxxxxxxxx

# URLs
PAYSTACK_SUCCESS_URL=https://daflegal-frontend.onrender.com/dashboard?payment=success
PAYSTACK_CANCEL_URL=https://daflegal-frontend.onrender.com/pricing?payment=canceled

# Provider
PAYMENT_PROVIDER=paystack
```

### Frontend (daflegal-frontend)

```bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_PAYMENT_PROVIDER=paystack
```

---

## Troubleshooting

### "Payment modal not opening"
- Verify NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is set on frontend
- Check browser console for errors
- Make sure you're using test keys in test mode

### "Payment succeeds but subscription not created"
- Check webhook is configured correctly
- Verify webhook URL is: `...backend.../api/v1/billing/webhook/paystack`
- Check backend logs for webhook processing errors

### "Invalid API key"
- Make sure you copied the correct key (test vs live)
- Verify no extra spaces in environment variables
- Check that backend redeployed after adding keys

### "Webhook not receiving events"
- Verify webhook URL in Paystack settings
- Check backend logs for webhook requests
- Test webhook using Paystack dashboard test feature

---

## Going Live (When Ready)

When you're ready for real payments:

1. **Complete Paystack verification:**
   - Go to: **Settings** → **Profile**
   - Provide business information
   - Add bank account for payouts
   - Submit required documents (varies by country)
   - Wait for approval (usually 1-3 days)

2. **Switch to Live keys:**
   - Get live API keys from dashboard
   - Update plan codes (create live versions)
   - Update all environment variables with live keys

3. **Test thoroughly:**
   - Use real card for small test payment
   - Verify webhook works in live mode
   - Test full customer journey

4. **Enable production mode:**
   - Switch Paystack toggle to **Live mode**
   - Update frontend to use live public key

---

## Pricing Recommendations for Kenya

Based on local market:

### Free Plan (Default for new users)
- 3 contracts/month
- 30 pages per contract
- Basic analysis
- No credit card required

### Pro Plan (KES 4,999/month or ~$39/month)
- 50 contracts/month
- 100 pages per contract
- Advanced analysis
- Clause library access
- Compliance checker
- Priority support

### Enterprise Plan (KES 24,999/month or ~$199/month)
- Unlimited contracts
- Unlimited pages
- All features
- API access
- Dedicated support
- Custom integrations

**Adjust based on your target market and costs!**

---

## Fees & Costs

### Paystack Fees (Kenya)

**Local Cards:**
- 1.5% + KES 25 per transaction
- Capped at KES 2,000

**International Cards:**
- 3.9% + KES 100

**Mobile Money (M-Pesa, Airtel Money):**
- 1.5% + KES 25
- Capped at KES 2,000

**Bank Transfer:**
- Free for customers
- KES 50 flat fee for business

### Examples:

**Pro Plan (KES 4,999):**
- Fee: 1.5% + KES 25 = KES 100
- You receive: KES 4,899

**Enterprise Plan (KES 24,999):**
- Fee: 1.5% + KES 25 = KES 400
- You receive: KES 24,599

---

## Supported Payment Methods

Paystack in Kenya supports:

✅ **Credit/Debit Cards:**
- Visa
- Mastercard
- Verve (Nigeria)

✅ **Mobile Money:**
- M-Pesa (Kenya)
- MTN Mobile Money (Ghana, Uganda)
- Airtel Money (multiple countries)
- Vodafone Cash (Ghana)

✅ **Bank Transfer:**
- Direct bank transfers
- USSD codes

✅ **QR Codes:**
- Dynamic QR for mobile payments

---

## M-Pesa Integration

M-Pesa is automatically enabled when you use Paystack in Kenya!

**How it works:**
1. User selects M-Pesa at checkout
2. Enters phone number
3. Receives STK push on phone
4. Enters M-Pesa PIN
5. Payment completes instantly

**Test M-Pesa:**
- Use test phone: 0700000000
- PIN: Any 4 digits

---

## Customer Portal (Subscription Management)

Paystack doesn't have a built-in customer portal like Stripe, but you can:

**Option 1: Build Simple Portal**
- Show subscription status
- Cancel subscription button (calls Paystack API)
- View payment history
- Update payment method

**Option 2: Use Paystack Inline**
- Let users update cards via Paystack modal
- Manage subscriptions via dashboard (for now)
- Add self-service later

I can help you build a simple customer portal if needed!

---

## Testing Checklist

### After Setup:
- [ ] Test card payment with test card
- [ ] Test M-Pesa (if in Kenya)
- [ ] Verify transaction appears in dashboard
- [ ] Check subscription is created
- [ ] Test webhook receives events
- [ ] Verify user account is upgraded
- [ ] Test subscription cancellation

---

## Code Integration Notes

Your backend likely needs to be updated to support Paystack. Key changes:

### 1. Payment Initialization

Instead of Stripe checkout, use Paystack:

```python
# Initialize Paystack transaction
url = "https://api.paystack.co/transaction/initialize"
headers = {
    "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
    "Content-Type": "application/json"
}
data = {
    "email": user_email,
    "amount": amount * 100,  # Amount in kobo/cents
    "plan": plan_code,
    "callback_url": success_url
}
response = requests.post(url, json=data, headers=headers)
```

### 2. Webhook Handling

```python
# Verify Paystack webhook
signature = request.headers.get('x-paystack-signature')
payload = request.body

# Verify signature
hash = hmac.new(
    PAYSTACK_SECRET_KEY.encode('utf-8'),
    payload,
    hashlib.sha512
).hexdigest()

if hash == signature:
    # Process webhook
    event = json.loads(payload)
    if event['event'] == 'charge.success':
        # Handle successful payment
        pass
```

### 3. Subscription Management

```python
# Cancel subscription
url = f"https://api.paystack.co/subscription/{subscription_code}"
headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
response = requests.post(f"{url}/disable", headers=headers)
```

**Do you need help updating the backend code for Paystack?**

---

## Additional Features

### Paystack Invoicing
- Create and send invoices
- Track invoice status
- Automatic reminders

### Payment Pages
- Create hosted payment pages
- No coding required
- Great for simple use cases

### Payment Links
- Generate one-time payment links
- Share via email/SMS
- Track clicks and payments

### Splits & Subaccounts
- Split payments automatically
- Great for marketplaces
- Pay partners/contractors

---

## Resources

### Documentation:
- API Docs: https://paystack.com/docs/api
- Integration Guide: https://paystack.com/docs/guides
- Test Cards: https://paystack.com/docs/payments/test-payments

### Support:
- Email: support@paystack.com
- Help Center: https://support.paystack.com
- Status Page: https://status.paystack.com

### Dashboards:
- Test Dashboard: https://dashboard.paystack.com
- Live Dashboard: (same, just toggle mode)

---

## Next Steps

After Paystack is working:

1. ✅ Paystack configured
2. ⏭️ Test payment flow
3. ⏭️ Set up Google OAuth (20 min)
4. ⏭️ Set up Analytics (25 min)
5. ⏭️ Update backend code (if needed)
6. ⏭️ Go live!

---

**Paystack Setup Complete!** 🎉

Your DafLegal application can now accept payments from customers across Africa!

**Time to complete:** 25 minutes
**Difficulty:** Easy ⭐⭐
**Priority:** 🟡 Medium (needed for monetization)

Let me know if you need help with:
- Backend code updates for Paystack
- Building a customer portal
- Testing the integration
- Going live

**Ready to accept payments! 🚀**
