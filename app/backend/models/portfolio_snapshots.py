from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Portfolio_snapshots(Base):
    __tablename__ = "portfolio_snapshots"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    total_value_try = Column(Float, nullable=False)
    total_value_usd = Column(Float, nullable=True)
    total_value_eur = Column(Float, nullable=True)
    gold_value = Column(Float, nullable=True)
    crypto_value = Column(Float, nullable=True)
    stock_value = Column(Float, nullable=True)
    currency_value = Column(Float, nullable=True)
    other_value = Column(Float, nullable=True)
    snapshot_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)