from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@db:5432/analysis_cookbooks"
    secret_key: str = "change-this-secret-key-in-production"

    model_config = {"env_file": ".env"}


settings = Settings()
