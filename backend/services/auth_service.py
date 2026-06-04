import os
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "fallback_secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# MVP Mock Database
USERS = {
    "admin": {
        "password_hash": pwd_context.hash("admin"),
        "role": "admin"
    },
    "researcher": {
        "password_hash": pwd_context.hash("researcher"),
        "role": "researcher"
    }
}

class AuthService:
    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def authenticate_user(username, password):
        user = USERS.get(username)
        if not user:
            return False
        if not AuthService.verify_password(password, user["password_hash"]):
            return False
        return user

    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
