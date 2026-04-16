from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
import jwt
from app.core.config import settings

_password_hash = PasswordHash.recommended()

ACCESS_TOKEN_EXPIRE_HOURS = 8
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _password_hash.verify(plain_password, hashed_password)


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """トークンをデコードしてusernameを返す。無効なら jwt.PyJWTError を raise する。"""
    payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    return payload["sub"]
