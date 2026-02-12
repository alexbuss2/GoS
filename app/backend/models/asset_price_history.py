from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String, func


class AssetPriceHistory(Base):
    __tablename__ = "asset_price_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    asset_key = Column(String, nullable=False, index=True)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)
    interval_bucket = Column(String, nullable=False, default="5m")
    price = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="TRY")
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
