"""add market watchlist and portfolio tables

Revision ID: 9f3d2c7a1b11
Revises: dd52b1bd37e8
Create Date: 2026-02-12 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f3d2c7a1b11"
down_revision: Union[str, Sequence[str], None] = "dd52b1bd37e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_watchlist",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("asset_key", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "asset_key", name="uq_user_watchlist_user_asset"),
    )
    op.create_index(op.f("ix_user_watchlist_id"), "user_watchlist", ["id"], unique=False)
    op.create_index(op.f("ix_user_watchlist_user_id"), "user_watchlist", ["user_id"], unique=False)
    op.create_index(op.f("ix_user_watchlist_asset_key"), "user_watchlist", ["asset_key"], unique=False)

    op.create_table(
        "portfolio_positions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("asset_key", sa.String(), nullable=False),
        sa.Column("asset_name", sa.String(), nullable=False),
        sa.Column("asset_type", sa.String(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("avg_cost", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_portfolio_positions_id"), "portfolio_positions", ["id"], unique=False)
    op.create_index(op.f("ix_portfolio_positions_user_id"), "portfolio_positions", ["user_id"], unique=False)
    op.create_index(op.f("ix_portfolio_positions_asset_key"), "portfolio_positions", ["asset_key"], unique=False)
    op.create_index("ix_portfolio_positions_user_asset", "portfolio_positions", ["user_id", "asset_key"], unique=False)

    op.create_table(
        "asset_price_history",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("asset_key", sa.String(), nullable=False),
        sa.Column("asset_name", sa.String(), nullable=False),
        sa.Column("asset_type", sa.String(), nullable=False),
        sa.Column("interval_bucket", sa.String(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_asset_price_history_id"), "asset_price_history", ["id"], unique=False)
    op.create_index(op.f("ix_asset_price_history_asset_key"), "asset_price_history", ["asset_key"], unique=False)
    op.create_index(op.f("ix_asset_price_history_timestamp"), "asset_price_history", ["timestamp"], unique=False)
    op.create_index(
        "ix_asset_price_history_asset_timestamp",
        "asset_price_history",
        ["asset_key", "timestamp"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_asset_price_history_asset_timestamp", table_name="asset_price_history")
    op.drop_index(op.f("ix_asset_price_history_timestamp"), table_name="asset_price_history")
    op.drop_index(op.f("ix_asset_price_history_asset_key"), table_name="asset_price_history")
    op.drop_index(op.f("ix_asset_price_history_id"), table_name="asset_price_history")
    op.drop_table("asset_price_history")

    op.drop_index("ix_portfolio_positions_user_asset", table_name="portfolio_positions")
    op.drop_index(op.f("ix_portfolio_positions_asset_key"), table_name="portfolio_positions")
    op.drop_index(op.f("ix_portfolio_positions_user_id"), table_name="portfolio_positions")
    op.drop_index(op.f("ix_portfolio_positions_id"), table_name="portfolio_positions")
    op.drop_table("portfolio_positions")

    op.drop_index(op.f("ix_user_watchlist_asset_key"), table_name="user_watchlist")
    op.drop_index(op.f("ix_user_watchlist_user_id"), table_name="user_watchlist")
    op.drop_index(op.f("ix_user_watchlist_id"), table_name="user_watchlist")
    op.drop_table("user_watchlist")
