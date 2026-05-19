from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@db:5432/analysis_cookbooks"
    secret_key: str = "change-this-secret-key-in-production"

    # 初回起動時に作成される管理者アカウント
    initial_admin_username: str = "admin"
    initial_admin_password: str = "changeme"

    model_config = {"env_file": ".env"}


settings = Settings()
