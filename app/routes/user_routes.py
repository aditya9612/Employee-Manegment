from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.user_schema import UserCreate, UserOut, UpdateRoleSchema
from app.crud.user_crud import create_user, list_users, update_user_role, delete_user, get_user_by_email, get_user
from app.db.database import get_db
from app.dependencies import require_roles
from app.enums import RoleEnum
import io
from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

router = APIRouter(prefix="/employees", tags=["Employees"])

# Public: Register
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_employee(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return create_user(db, user)

# Admin & HR: Update employee details
@router.put("/{employee_id}", response_model=UserOut)
def update_employee(
    employee_id: int,
    user_data: UserCreate,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
):
    employee = get_user(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    employee.name = user_data.name
    employee.email = user_data.email
    employee.department = user_data.department
    employee.designation = user_data.designation
    employee.phone = user_data.phone
    employee.address = user_data.address
    employee.role = user_data.role
    employee.gender = user_data.gender
    employee.resignation_date = user_data.resignation_date
    employee.pan_card = user_data.pan_card
    employee.aadhar_card = user_data.aadhar_card
    employee.shift_type = user_data.shift_type

    db.commit()
    db.refresh(employee)
    return employee

# Admin only: Update role
@router.put("/{employee_id}/role", response_model=UserOut)
def update_role(
    employee_id: int,
    role_data: UpdateRoleSchema,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_roles(RoleEnum.ADMIN))
):
    employee = update_user_role(db, employee_id, role_data.role)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee

# Admin & HR: Delete
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
):
    if not delete_user(db, employee_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return None

# Admin & HR: Get single employee
@router.get("/{employee_id}", response_model=UserOut)
def get_single_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
):
    employee = get_user(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


# PDF download
@router.get("/download/pdf")
def download_employees_pdf(
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
):
    employees = list_users(db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employees found")

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(30, height - 50, "Employee List")
    pdf.setFont("Helvetica", 10)

    y = height - 80
    for emp in employees:
        line = f"{emp.employee_id} | {emp.name} | {emp.email} | {emp.department} | {emp.designation} | {'Active' if emp.is_active else 'Inactive'}"
        pdf.drawString(30, y, line)
        y -= 20
        if y < 50:
            pdf.showPage()
            pdf.setFont("Helvetica", 10)
            y = height - 50

    pdf.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=employees.pdf"}
    )
# CSV download
@router.get("/download/csv")
def download_employees_csv(
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.HR))
):
    employees = list_users(db)  # Get all employees
    if not employees:
        raise HTTPException(status_code=404, detail="No employees found")

    data = []
    for emp in employees:
        data.append({
            "Employee ID": emp.employee_id,
            "Name": emp.name,
            "Email": emp.email,
            "Department": emp.department,
            "Designation": emp.designation,
            "Phone": emp.phone,
            "Address": emp.address,
            "Role": emp.role,
            "Gender": emp.gender,
            "Resignation Date": emp.resignation_date,
            "PAN Card": emp.pan_card,
            "Aadhar Card": emp.aadhar_card,
            "Shift Type": emp.shift_type,
            "Active": emp.is_active
        })

    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees.csv"}
    )