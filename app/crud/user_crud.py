from sqlalchemy.orm import Session
from app.db.models.user import User
from app.schemas.user_schema import UserCreate
from app.enums import RoleEnum
from passlib.hash import bcrypt

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = bcrypt.hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        employee_id=user.employee_id,
        department=user.department,
        designation=user.designation,
        phone=user.phone,
        address=user.address,
        role=user.role,
        gender=user.gender,
        resignation_date=user.resignation_date,
        pan_card=user.pan_card,
        aadhar_card=user.aadhar_card,
        shift_type=user.shift_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def list_users(db: Session):
    return db.query(User).all()

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def update_user_role(db: Session, user_id: int, new_role: RoleEnum):
    user = get_user(db, user_id)
    if not user:
        return None
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user
