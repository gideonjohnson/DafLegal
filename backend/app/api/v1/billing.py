from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
import stripe
from datetime import datetime, timedelta

from app.core.database import get_session
from app.core.config import settings
from app.api.dependencies import get_current_user
from app.models.user import User, PlanType

router = APIRouter(prefix="/billing", tags=["billing"])

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session")
async def create_checkout_session(
    plan: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create Stripe checkout session for plan upgrade
    """
    # Validate plan
    if plan not in ["starter", "pro", "team"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan"
        )

    plan_config = settings.PLANS.get(plan)
    price_id_key = plan_config.get("stripe_price_id")
    price_id = getattr(settings, price_id_key)

    try:
        # Create or get Stripe customer
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": current_user.id}
            )
            current_user.stripe_customer_id = customer.id
            session.add(current_user)
            session.commit()

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=f"https://daflegal.com/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url="https://daflegal.com/pricing",
            metadata={
                "user_id": current_user.id,
                "plan": plan
            }
        )

        return {"checkout_url": checkout_session.url}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.post("/portal-session")
async def create_portal_session(
    current_user: User = Depends(get_current_user)
):
    """
    Create Stripe customer portal session
    """
    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription"
        )

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url="https://daflegal.com/dashboard"
        )

        return {"portal_url": portal_session.url}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portal session: {str(e)}"
        )


@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    session: Session = Depends(get_session)
):
    """
    Handle Stripe webhooks
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle events
    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]
        user_id = int(session_data["metadata"]["user_id"])
        plan = session_data["metadata"]["plan"]

        # Update user
        user = session.get(User, user_id)
        if user:
            user.plan = PlanType(plan)
            user.stripe_subscription_id = session_data["subscription"]
            user.billing_period_start = datetime.utcnow()
            user.billing_period_end = datetime.utcnow() + timedelta(days=30)
            user.pages_used_current_period = 0
            user.files_used_current_period = 0
            session.add(user)
            session.commit()

    elif event["type"] == "customer.subscription.deleted":
        subscription_id = event["data"]["object"]["id"]

        # Downgrade user to free trial
        statement = select(User).where(User.stripe_subscription_id == subscription_id)
        user = session.exec(statement).first()

        if user:
            user.plan = PlanType.FREE_TRIAL
            user.stripe_subscription_id = None
            user.billing_period_start = datetime.utcnow()
            user.billing_period_end = datetime.utcnow() + timedelta(days=30)
            user.pages_used_current_period = 0
            user.files_used_current_period = 0
            session.add(user)
            session.commit()

    return {"status": "success"}
