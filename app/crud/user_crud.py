from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.models.user import User
from app.enums import RoleEnum
from passlib.context import CryptContext
from app.schemas.user_schema import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]
    return pwd_context.hash(password_bytes)

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.user_id == user_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)
    db_user = User(
        name=user.name,
        gender=user.gender,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        employee_id=user.employee_id,
        department=user.department,
        designation=user.designation,
        resignation_date=user.resignation_date,
        phone=user.phone,
        address=user.address,
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

def get_employees(db: Session, search: str = None, department: str = None, role: RoleEnum = None):
    query = db.query(User)
    if search:
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.department.ilike(f"%{search}%")
            )
        )
    if department:
        query = query.filter(User.department == department)
    if role:
        query = query.filter(User.role == role)
    return query.all()

def update_user_role(db: Session, user_id: int, role: RoleEnum):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.role = role
        db.commit()
        db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user
