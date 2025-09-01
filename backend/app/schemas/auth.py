from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    user: Optional[dict] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
