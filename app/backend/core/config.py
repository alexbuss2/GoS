import logging
import os
from typing import Any

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Application
    app_name: str = "FastAPI Modular Template"
    debug: bool = False
    version: str = "1.0.0"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    # Support both DATABASE_URL and DATABASE_URI for compatibility.
    database_url: str = Field(
        default="sqlite+aiosqlite:///./app.db",
        validation_alias=AliasChoices("DATABASE_URL", "DATABASE_URI"),
    )

    # AWS Lambda Configuration
    is_lambda: bool = False
    lambda_function_name: str = "fastapi-backend"
    aws_region: str = "us-east-1"

    # Price refresh scheduler
    price_refresh_enabled: bool = True
    price_refresh_interval_seconds: int = 300
    price_refresh_timeout_seconds: int = 15
    price_refresh_base_currency: str = "TRY"
    price_refresh_coingecko_vs_currency: str = "usd"

    # JWT settings (used by mobile auth token issuance)
    jwt_secret_key: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    def validate_production_safety(self) -> None:
        environment = os.getenv("ENVIRONMENT", "prod").lower()
        using_non_local_db = "sqlite" not in (self.database_url or "").lower()
        if (
            environment in {"prod", "production"}
            and using_non_local_db
            and self.jwt_secret_key == "change-this-secret-in-production"
        ):
            raise ValueError("JWT_SECRET_KEY must be set in production environment")

    @property
    def database_uri(self) -> str:
        """Backward-compatible alias used by older modules."""
        return self.database_url

    @property
    def backend_url(self) -> str:
        """Generate backend URL from host and port."""
        if self.is_lambda:
            # In Lambda environment, return the API Gateway URL
            return os.environ.get(
                "PYTHON_BACKEND_URL", f"https://{self.lambda_function_name}.execute-api.{self.aws_region}.amazonaws.com"
            )
        else:
            # Use localhost for external callbacks instead of 0.0.0.0
            display_host = "127.0.0.1" if self.host == "0.0.0.0" else self.host
            return os.environ.get("PYTHON_BACKEND_URL", f"http://{display_host}:{self.port}")

    class Config:
        case_sensitive = False
        extra = "ignore"

    def __getattr__(self, name: str) -> Any:
        """
        Dynamically read attributes from environment variables.
        For example: settings.opapi_key reads from OPAPI_KEY environment variable.

        Args:
            name: Attribute name (e.g., 'opapi_key')

        Returns:
            Value from environment variable

        Raises:
            AttributeError: If attribute doesn't exist and not found in environment variables
        """
        # Convert attribute name to environment variable name (snake_case -> UPPER_CASE)
        env_var_name = name.upper()

        # Check if environment variable exists
        if env_var_name in os.environ:
            value = os.environ[env_var_name]
            # Cache the value in instance dict to avoid repeated lookups
            self.__dict__[name] = value
            logger.debug(f"Read dynamic attribute {name} from environment variable {env_var_name}")
            return value

        # If not found, raise AttributeError to maintain normal Python behavior
        raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")


# Global settings instance
settings = Settings()
