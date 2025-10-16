from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.enums import RoleEnum

class User(Base):
    __tablename__ = "users"

    # Primary Key
    user_id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    employee_id = Column(String(500), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE)

    # Optional Info
    department = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    gender = Column(String(50), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)

    # PAN, Aadhaar, Shift
    pan_card = Column(String(20), nullable=True)
    aadhar_card = Column(String(20), nullable=True)
    shift_type = Column(String(50), nullable=True)

    # Dates
    joining_date = Column(DateTime(timezone=True), server_default=func.now())
    resignation_date = Column(DateTime(timezone=True), nullable=True)

    # Profile & verification
    # Profile & verification
    profile_photo = Column(String(1024), nullable=True)  # stores path to profile photo

    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    leaves = relationship("Leave", back_populates="user", cascade="all, delete-orphan")
    assigned_tasks = relationship("Task", back_populates="assigned_to_user", foreign_keys='Task.assigned_to')
    created_tasks = relationship("Task", back_populates="assigned_by_user", foreign_keys='Task.assigned_by')
