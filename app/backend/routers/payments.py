import logging
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.subscriptions import Subscriptions

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])

# PRO subscription price: 50 TRY/month
PRO_PRICE_TRY = 5000  # in cents (50.00 TRY)


class CheckoutSessionRequest(BaseModel):
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class PaymentVerificationRequest(BaseModel):
    session_id: str


class PaymentStatusResponse(BaseModel):
    status: str
    is_pro: bool
    subscription_end: str = None


class SubscriptionStatusResponse(BaseModel):
    is_pro: bool
    plan_type: str
    subscription_end: str = None
    asset_limit: int
    alerts_enabled: bool
    ads_enabled: bool


@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's subscription status"""
    try:
        result = await db.execute(
            select(Subscriptions).where(Subscriptions.user_id == current_user.id)
        )
        subscription = result.scalar_one_or_none()

        if subscription and subscription.is_pro:
            # Check if subscription is still valid
            if subscription.subscription_end:
                end_date = subscription.subscription_end
                if isinstance(end_date, str):
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                if end_date > datetime.now():
                    return SubscriptionStatusResponse(
                        is_pro=True,
                        plan_type="pro",
                        subscription_end=subscription.subscription_end.isoformat() if hasattr(subscription.subscription_end, 'isoformat') else subscription.subscription_end,
                        asset_limit=-1,  # Unlimited
                        alerts_enabled=True,
                        ads_enabled=False,
                    )

        # Free user
        return SubscriptionStatusResponse(
            is_pro=False,
            plan_type="free",
            subscription_end=None,
            asset_limit=5,
            alerts_enabled=False,
            ads_enabled=True,
        )
    except Exception as e:
        logging.error(f"Subscription status error: {e}")
        return SubscriptionStatusResponse(
            is_pro=False,
            plan_type="free",
            subscription_end=None,
            asset_limit=5,
            alerts_enabled=False,
            ads_enabled=True,
        )


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    data: CheckoutSessionRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session for PRO subscription"""
    try:
        frontend_host = request.headers.get("App-Host")
        if frontend_host and not frontend_host.startswith(("http://", "https://")):
            frontend_host = f"https://{frontend_host}"

        # Create or get Stripe customer
        result = await db.execute(
            select(Subscriptions).where(Subscriptions.user_id == current_user.id)
        )
        subscription = result.scalar_one_or_none()

        customer_id = None
        if subscription and subscription.stripe_customer_id:
            customer_id = subscription.stripe_customer_id
        else:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": current_user.id}
            )
            customer_id = customer.id

        # Create checkout session for subscription
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "try",
                        "product_data": {
                            "name": "BİRİKİO PRO Abonelik",
                            "description": "Aylık PRO üyelik - Sınırsız varlık, Fiyat alarmları, Reklamsız deneyim",
                        },
                        "unit_amount": PRO_PRICE_TRY,
                        "recurring": {
                            "interval": "month",
                        },
                    },
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{frontend_host}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_host}/pro",
            metadata={
                "user_id": current_user.id,
            }
        )

        return CheckoutSessionResponse(
            session_id=session.id,
            url=session.url
        )
    except Exception as e:
        logging.error(f"Checkout session creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


@router.post("/verify-payment", response_model=PaymentStatusResponse)
async def verify_payment(
    data: PaymentVerificationRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify payment and activate PRO subscription"""
    try:
        session = stripe.checkout.Session.retrieve(data.session_id)
        
        if session.payment_status == "paid":
            # Get or create subscription record
            result = await db.execute(
                select(Subscriptions).where(Subscriptions.user_id == current_user.id)
            )
            subscription = result.scalar_one_or_none()

            now = datetime.now()
            subscription_end = now + timedelta(days=30)

            if subscription:
                subscription.is_pro = True
                subscription.plan_type = "pro"
                subscription.stripe_customer_id = session.customer
                subscription.stripe_subscription_id = session.subscription
                subscription.subscription_start = now
                subscription.subscription_end = subscription_end
                subscription.updated_at = now
            else:
                new_subscription = Subscriptions(
                    user_id=current_user.id,
                    plan_type="pro",
                    is_pro=True,
                    stripe_customer_id=session.customer,
                    stripe_subscription_id=session.subscription,
                    subscription_start=now,
                    subscription_end=subscription_end,
                    created_at=now,
                    updated_at=now,
                )
                db.add(new_subscription)

            await db.commit()

            return PaymentStatusResponse(
                status="success",
                is_pro=True,
                subscription_end=subscription_end.isoformat()
            )

        return PaymentStatusResponse(
            status="pending",
            is_pro=False,
            subscription_end=None
        )
    except Exception as e:
        logging.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel PRO subscription"""
    try:
        result = await db.execute(
            select(Subscriptions).where(Subscriptions.user_id == current_user.id)
        )
        subscription = result.scalar_one_or_none()

        if subscription and subscription.stripe_subscription_id:
            # Cancel Stripe subscription
            stripe.Subscription.cancel(subscription.stripe_subscription_id)
            
            subscription.is_pro = False
            subscription.plan_type = "free"
            subscription.updated_at = datetime.now()
            await db.commit()

            return {"status": "cancelled", "message": "Abonelik iptal edildi"}

        return {"status": "not_found", "message": "Aktif abonelik bulunamadı"}
    except Exception as e:
        logging.error(f"Subscription cancellation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")