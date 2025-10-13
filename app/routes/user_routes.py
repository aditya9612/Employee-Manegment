from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models.user import User
from app.schemas.user_schema import UserCreate, UserOut, UpdateRoleSchema
from app.crud.user_crud import create_user, list_users, update_user_role, delete_user, get_user_by_email, get_user
from app.db.database import get_db
from app.dependencies import require_roles
from app.enums import RoleEnum

router = APIRouter(prefix="/employees", tags=["Employees"])

# ✅ Register new employee (public)
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_employee(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return create_user(db, user)

# ✅ List employees with optional search/filter
@router.get("/", response_model=List[UserOut])
def get_all_employees(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by name, email or department"),
    department: Optional[str] = Query(None, description="Filter by department"),
    role: Optional[RoleEnum] = Query(None, description="Filter by role")
):
    employees = list_users(db)
    if search:
        employees = [
            emp for emp in employees
            if search.lower() in emp.name.lower() or
               search.lower() in emp.email.lower() or
               (emp.department and search.lower() in emp.department.lower())
        ]
    if department:
        employees = [emp for emp in employees if emp.department == department]
    if role:
        employees = [emp for emp in employees if emp.role == role]
    return employees

# ✅ Update employee details (Admin & HR)
@router.put("/{employee_id}", response_model=UserOut)
def update_employee(
    employee_id: int,
    user_data: UserCreate,
    db: Session = Depends(get_db),
    _: RoleEnum = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
):
    employee = get_user(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    # Update fields
    for field, value in user_data.dict(exclude={"password", "employee_id"}).items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return employee

# ✅ Update employee role (Admin & HR)
@router.put("/{employee_id}/role", response_model=UserOut)
def update_role(employee_id: int, role_data: UpdateRoleSchema, db: Session = Depends(get_db),
                _: RoleEnum = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))):
    employee = update_user_role(db, employee_id, role_data.role)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee

# ✅ Delete employee (Admin & HR)
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_employee(employee_id: int, db: Session = Depends(get_db),
                    _: RoleEnum = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))):
    employee = delete_user(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return None

# ✅ Get single employee by ID
@router.get("/{employee_id}", response_model=UserOut)
def get_single_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR, RoleEnum.EMPLOYEE))
):
    employee = get_user(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if current_user.role == RoleEnum.EMPLOYEE and current_user.user_id != employee_id:
        raise HTTPException(status_code=403, detail="Operation not permitted")
    return employee
