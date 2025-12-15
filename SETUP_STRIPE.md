# Stripe Payment Setup Guide for DafLegal

## What is Stripe?

Stripe handles payment processing for DafLegal subscriptions. It enables:
- Secure credit card payments
- Subscription management (Free, Pro, Enterprise plans)
- Automatic billing and invoicing
- Customer portal for users to manage subscriptions

## Time Required: 30-45 minutes

---

## Step 1: Create Stripe Account (5 min)

1. Go to: https://dashboard.stripe.com/register
2. Sign up with your email
3. Verify your email address
4. Complete business information (can update later)
5. **Important:** Start in **Test Mode** (toggle in top right)

---

## Step 2: Get API Keys (2 min)

1. In Stripe Dashboard, click **Developers** → **API keys**
2. You'll see two sets of keys:

### Test Mode Keys (Use these first!)

```
Publishable key: pk_test_xxxxxxxxxxxxx
Secret key: sk_test_xxxxxxxxxxxxx
```

### Live Mode Keys (Use after testing)

```
Publishable key: pk_live_xxxxxxxxxxxxx
Secret key: sk_live_xxxxxxxxxxxxx
```

**Important:** Keep Secret keys private!

---

## Step 3: Create Products and Prices (15 min)

### 3.1 Create Products

1. Go to: **Products** → **Add product**
2. Create three products:

#### Product 1: DafLegal Free
- **Name:** DafLegal Free
- **Description:** Free trial - 3 contracts, 30 pages/contract
- **Pricing:** Free
- Click **Save product**

#### Product 2: DafLegal Pro
- **Name:** DafLegal Pro
- **Description:** Professional plan - 50 contracts/month, 100 pages/contract
- **Pricing:** Recurring
  - **Price:** $99.00 USD
  - **Billing period:** Monthly
  - **Payment type:** Recurring
- Click **Save product**

#### Product 3: DafLegal Enterprise
- **Name:** DafLegal Enterprise
- **Description:** Enterprise plan - Unlimited contracts, unlimited pages
- **Pricing:** Recurring
  - **Price:** $499.00 USD
  - **Billing period:** Monthly
  - **Payment type:** Recurring
- Click **Save product**

### 3.2 Get Price IDs

After creating products, click on each one and copy the **Price ID**:

```
Free Plan: (no price ID needed - it's free)
Pro Plan: price_xxxxxxxxxxxxx
Enterprise Plan: price_xxxxxxxxxxxxx
```

Save these Price IDs - you'll need them for environment variables.

---

## Step 4: Configure Webhook (10 min)

Webhooks notify your backend when payments succeed, subscriptions are canceled, etc.

1. Go to: **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://daflegal-backend.onrender.com/api/v1/billing/webhook`
   - **Description:** DafLegal payment events
   - **Events to send:**
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)

---

## Step 5: Set Environment Variables on Render (5 min)

Add these to your **daflegal-backend** service:

```bash
# Stripe API Keys (Start with test keys!)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxx

# Success/Cancel URLs (for checkout)
STRIPE_SUCCESS_URL=https://daflegal-frontend.onrender.com/dashboard?payment=success
STRIPE_CANCEL_URL=https://daflegal-frontend.onrender.com/pricing?payment=canceled
```

Add these to your **daflegal-frontend** service:

```bash
# Public key for frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

Click **Save Changes** on both services.

---

## Step 6: Test Payment Flow (10 min)

### 6.1 Test Checkout

1. Go to your frontend: https://daflegal-frontend.onrender.com/pricing
2. Click **Upgrade to Pro**
3. You'll be redirected to Stripe Checkout

### 6.2 Use Test Cards

Stripe provides test cards for different scenarios:

**Successful Payment:**
```
Card number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Declined Payment:**
```
Card number: 4000 0000 0000 0002
```

**Requires Authentication:**
```
Card number: 4000 0025 0000 3155
```

### 6.3 Verify in Dashboard

1. Go to Stripe Dashboard → **Payments**
2. You should see your test payment
3. Check **Customers** to see the customer record
4. Check **Subscriptions** to see active subscription

---

## Step 7: Test Webhook (5 min)

1. In Stripe Dashboard, go to: **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select event: `checkout.session.completed`
5. Click **Send test webhook**

Check your backend logs in Render to verify the webhook was received.

---

## Step 8: Customer Portal Setup (5 min)

The Customer Portal allows users to:
- View subscription details
- Update payment methods
- Cancel subscriptions
- Download invoices

1. Go to: **Settings** → **Billing** → **Customer Portal**
2. Click **Activate** or **Configure**
3. Enable these features:
   - ✅ Update payment method
   - ✅ Cancel subscription
   - ✅ View invoices
4. Set **Cancellation behavior:**
   - Cancel immediately (for testing)
   - Or: Cancel at period end (for production)
5. Click **Save**

---

## Environment Variables Summary

### Backend (daflegal-backend)

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxx

# URLs
STRIPE_SUCCESS_URL=https://daflegal-frontend.onrender.com/dashboard?payment=success
STRIPE_CANCEL_URL=https://daflegal-frontend.onrender.com/pricing?payment=canceled
```

### Frontend (daflegal-frontend)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

---

## Troubleshooting

### "Checkout not working"
- Verify STRIPE_PUBLISHABLE_KEY is set on frontend
- Check browser console for errors
- Make sure you're using test keys in test mode

### "Webhook not receiving events"
- Verify webhook URL is correct
- Check STRIPE_WEBHOOK_SECRET is set correctly
- Look for webhook events in Stripe Dashboard → Webhooks
- Check backend logs for webhook processing

### "Invalid API key"
- Make sure you copied the correct key (test vs live)
- Verify no extra spaces in environment variables
- Check that backend redeployed after adding keys

### "Payment succeeds but subscription not created"
- Check webhook is configured and working
- Verify `checkout.session.completed` event is selected
- Check backend logs for errors

---

## Going Live (When Ready)

When you're ready for real payments:

1. **Complete Stripe onboarding:**
   - Go to: **Settings** → **Account details**
   - Provide business information
   - Add bank account for payouts
   - Verify identity

2. **Switch to Live keys:**
   - Get live API keys from **Developers** → **API keys**
   - Create live products and prices
   - Update all environment variables with live keys
   - Create new webhook for live mode

3. **Test thoroughly:**
   - Use real card for small test payment
   - Verify webhook works in live mode
   - Test full customer journey

4. **Enable production mode:**
   - Switch Stripe toggle to **Live mode**
   - Update frontend to use live publishable key

---

## Pricing Recommendations

Based on your DafLegal features:

### Free Plan (Default for new users)
- 3 contracts/month
- 30 pages per contract
- Basic analysis
- No credit card required

### Pro Plan ($99/month)
- 50 contracts/month
- 100 pages per contract
- Advanced analysis
- Clause library access
- Compliance checker
- Priority support

### Enterprise Plan ($499/month)
- Unlimited contracts
- Unlimited pages
- All features
- API access
- Dedicated support
- Custom integrations

Adjust prices based on your target market!

---

## Cost Information

**Stripe Fees:**
- 2.9% + $0.30 per successful charge
- No monthly fees
- No setup fees
- Free for test mode

**Example:**
- $99 subscription → You receive: $96.24
- Stripe fee: $2.76

---

## Next Steps

After Stripe is working:

1. Test full payment flow end-to-end
2. Set up subscription plan limits in your code
3. Configure Google OAuth
4. Set up analytics tracking
5. Test customer portal
6. Plan your go-live date

---

**Stripe Setup Complete!** 💳

Your DafLegal application can now accept payments and manage subscriptions!
