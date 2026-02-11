from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class User_settings(Base):
    __tablename__ = "user_settings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    base_currency = Column(String, nullable=False)
    pin_code = Column(String, nullable=True)
    pin_enabled = Column(Boolean, nullable=True)
    theme = Column(String, nullable=True)
    notifications_enabled = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)