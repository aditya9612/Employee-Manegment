from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.database import get_db
from app.core.config import settings
from app.enums import RoleEnum

api_key_header = APIKeyHeader(name="Authorization")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(api_key_header)) -> User:
    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.role.value != role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Role mismatch")

    return user

def require_roles(*allowed_roles: RoleEnum):
    """
    Usage: Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
    """
    allowed_roles_values = [role.value for role in allowed_roles]

    def wrapper(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in allowed_roles_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {current_user.role.value}"
            )
        return current_user

    return wrapper
