from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.database import get_db
from app.db.models.attendance import Attendance
from app.schemas.attendance_schema import AttendanceOut
from app.crud.attendance_crud import check_in, check_out, list_attendance, total_present_today
from fastapi.responses import StreamingResponse
from app.crud.attendance_crud import (
    check_in, check_out, list_attendance, total_present_today,
    export_attendance_csv, export_attendance_pdf
)
router = APIRouter(prefix="/attendance", tags=["Attendance"])

# Employee Check-In
@router.post("/check-in", response_model=AttendanceOut)
def employee_check_in_route(user_id: int, gps_location: str = None, selfie: str = None, db: Session = Depends(get_db)):
    return check_in(db, user_id=user_id, gps_location=gps_location, selfie=selfie)

# Employee Check-Out
@router.post("/check-out", response_model=AttendanceOut)
def employee_check_out_route(user_id: int, gps_location: str = None, selfie: str = None, db: Session = Depends(get_db)):
    attendance = check_out(db, user_id=user_id, gps_location=gps_location, selfie=selfie)
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No attendance record found today")
    return attendance

# Employee Self-Attendance (Last 6 Months)
@router.get("/my-attendance/{user_id}", response_model=list[AttendanceOut])
def get_self_attendance(user_id: int, db: Session = Depends(get_db)):
    return list_attendance(db, user_id=user_id)

# Today's Attendance Summary
@router.get("/summary")
def attendance_summary(db: Session = Depends(get_db)):
    total_employees = db.query(Attendance.user_id).distinct().count()
    present_today = total_present_today(db)
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": total_employees - present_today
    }
@router.get("/download/csv")
def download_attendance_csv(user_id: int = None, db: Session = Depends(get_db)):
    """Download attendance data as a CSV file."""
    output = export_attendance_csv(db, user_id)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
    )
# ✅ Download Attendance as PDF
@router.get("/download/pdf")
def download_attendance_pdf(user_id: int = None, db: Session = Depends(get_db)):
    """Download attendance data as a PDF file."""
    buffer = export_attendance_pdf(db, user_id)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=attendance_report.pdf"}
    )