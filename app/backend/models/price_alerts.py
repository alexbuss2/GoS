from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String


class Price_alerts(Base):
    __tablename__ = "price_alerts"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    asset_name = Column(String, nullable=False)
    asset_category = Column(String, nullable=True)
    target_price = Column(Float, nullable=False)
    condition = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=True)
    is_triggered = Column(Boolean, nullable=True)
    triggered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)