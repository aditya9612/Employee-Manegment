from sqlalchemy.orm import Session
from datetime import datetime,timedelta
from app.db.models.attendance import Attendance
import csv 
import io 
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet 


def check_in(db: Session, user_id: int, gps_location: str = None, selfie: str = None):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    attendance = (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.check_in >= today_start)
        .first()
    )
    if attendance:
        # Update last check-in (no new record)
        attendance.check_in = datetime.utcnow()
        attendance.gps_location = gps_location or attendance.gps_location
        attendance.selfie = selfie or attendance.selfie
    else:
        # First check-in of the day
        attendance = Attendance(
            user_id=user_id,
            check_in=datetime.utcnow(),
            gps_location=gps_location,
            selfie=selfie
        )
        db.add(attendance)

    db.commit()
    db.refresh(attendance)
    return attendance

def check_out(db: Session, user_id: int, gps_location: str = None, selfie: str = None):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    attendance = (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.check_in >= today_start)
        .first()
    )
    if not attendance:
        return None

    # Update checkout and calculate total hours
    now = datetime.utcnow()
    if attendance.check_out:
        # Add hours from previous checkout to now
        delta = now - attendance.check_out
    else:
        # First checkout today
        delta = now - attendance.check_in

    attendance.check_out = now
    attendance.total_hours += delta.total_seconds() / 3600  # hours
    attendance.gps_location = gps_location or attendance.gps_location
    attendance.selfie = selfie or attendance.selfie

    db.commit()
    db.refresh(attendance)
    return attendance

def list_attendance(db: Session, user_id: int):
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    return (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.check_in >= six_months_ago)
        .order_by(Attendance.check_in.desc())
        .all()
    )

def total_present_today(db: Session):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    return db.query(Attendance).filter(Attendance.check_in >= today_start, Attendance.check_in < today_end).count()

# ✅ Export Attendance to CSV
def export_attendance_csv(db: Session, user_id: int = None):
    query = db.query(Attendance)
    if user_id:
        query = query.filter(Attendance.user_id == user_id)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Attendance ID", "User ID", "Check In", "Check Out", "Total Hours (hrs)", "GPS", "Selfie"])

    for a in query.all():
        writer.writerow([
            a.attendance_id,
            a.user_id,
            a.check_in.strftime("%Y-%m-%d %H:%M:%S") if a.check_in else "",
            a.check_out.strftime("%Y-%m-%d %H:%M:%S") if a.check_out else "",
            round(a.total_hours or 0, 2),
            a.gps_location or "",
            a.selfie or ""
        ])

    output.seek(0)
    return output


# ✅ Export Attendance to PDF
def export_attendance_pdf(db: Session, user_id: int = None):
    query = db.query(Attendance)
    if user_id:
        query = query.filter(Attendance.user_id == user_id)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    data = [["Attendance ID", "User ID", "User Name", "Department", "Check In", "Check Out", "Total Hours"]]
    for a in query.all():
        data.append([
            a.attendance_id,
            a.user_id,
            a.user_name,
            a.department,
            a.check_in.strftime("%Y-%m-%d %H:%M:%S") if a.check_in else "",
            a.check_out.strftime("%Y-%m-%d %H:%M:%S") if a.check_out else "",
            f"{round(a.total_hours or 0, 2)} hrs"
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))

    elements.append(Paragraph("Employee Attendance Report", styles['Title']))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer