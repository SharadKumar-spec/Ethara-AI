from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@postgres:5432/inventory_db",
        description="PostgreSQL Connection URL"
    )
    PROJECT_NAME: str = "Inventory & Order Management System"
    API_V1_STR: str = "/api"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
