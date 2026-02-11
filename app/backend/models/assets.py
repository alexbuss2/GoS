from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String


class Assets(Base):
    __tablename__ = "assets"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    current_price = Column(Float, nullable=True)
    currency = Column(String, nullable=False)
    is_sold = Column(Boolean, nullable=True)
    sold_price = Column(Float, nullable=True)
    sold_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)