from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime
from app.enums import RoleEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[RoleEnum] = RoleEnum.EMPLOYEE
    gender: Optional[str] = None
    resignation_date: Optional[datetime] = None
    pan_card: Optional[str] = None
    aadhar_card: Optional[str] = None
    shift_type: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str]  # plain password, will be hashed
    employee_id: str

class UserOut(UserBase):
    user_id: int
    employee_id: str
    is_verified: bool
    is_active: bool 
    profile_photo: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class UpdateRoleSchema(BaseModel):
    role: RoleEnum
