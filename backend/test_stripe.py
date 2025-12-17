"""
Test Stripe Integration
"""
import os
import stripe

def test_stripe_key():
    """Test if Stripe API key is valid"""
    api_key = os.getenv("STRIPE_SECRET_KEY")

    if not api_key:
        print("[FAIL] STRIPE_SECRET_KEY not found in environment")
        return False

    # Check if it's a test key
    if not api_key.startswith("sk_test_"):
        print(f"[WARNING] Using LIVE Stripe key: {api_key[:12]}...")
        print("[INFO] For testing, use a test key (sk_test_...)")
    else:
        print(f"[OK] Found test API key: {api_key[:20]}...")

    stripe.api_key = api_key

    try:
        # Test by listing recent customers (limit 1)
        customers = stripe.Customer.list(limit=1)
        print(f"[OK] API Connection successful")
        print(f"[OK] Found {len(customers.data)} customers in account")

        # Test webhook secret
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        if webhook_secret:
            print(f"[OK] Webhook secret configured: {webhook_secret[:20]}...")
        else:
            print("[WARNING] STRIPE_WEBHOOK_SECRET not set (needed for webhooks)")

        # Test price IDs
        price_ids = {
            "STARTER": os.getenv("STRIPE_STARTER_PRICE_ID"),
            "PRO": os.getenv("STRIPE_PRO_PRICE_ID"),
            "TEAM": os.getenv("STRIPE_TEAM_PRICE_ID")
        }

        for plan, price_id in price_ids.items():
            if price_id:
                print(f"[OK] {plan} price ID configured: {price_id}")
            else:
                print(f"[WARNING] STRIPE_{plan}_PRICE_ID not set")

        return True

    except stripe.error.AuthenticationError as e:
        print(f"[FAIL] Authentication failed: {str(e)}")
        return False
    except Exception as e:
        print(f"[FAIL] Stripe API Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Stripe Integration...")
    print("-" * 50)
    success = test_stripe_key()
    print("-" * 50)
    if success:
        print("[SUCCESS] Stripe integration is configured!")
        print("\nTo test a payment:")
        print("1. Use test card: 4242 4242 4242 4242")
        print("2. Use any future expiry date (e.g., 12/34)")
        print("3. Use any 3-digit CVC")
    else:
        print("[ERROR] Stripe integration has issues")
        print("\nSetup instructions:")
        print("1. Get test API keys from https://dashboard.stripe.com/test/apikeys")
        print("2. Create products and prices at https://dashboard.stripe.com/test/products")
        print("3. Set environment variables in Render dashboard")
