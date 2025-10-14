from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.models.attendance import Attendance
from app.db.models.user import User
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
        attendance.check_in = datetime.utcnow()
        attendance.gps_location = gps_location or attendance.gps_location
        attendance.selfie = selfie or attendance.selfie
    else:
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

    now = datetime.utcnow()
    if attendance.check_out:
        delta = now - attendance.check_out
    else:
        delta = now - attendance.check_in

    attendance.check_out = now
    attendance.total_hours += delta.total_seconds() / 3600
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

def export_attendance_csv(db: Session, user_id: int = None):
    query = db.query(
        Attendance.attendance_id,
        Attendance.user_id,
        User.name.label("user_name"),
        User.department.label("user_department"),
        Attendance.check_in,
        Attendance.check_out,
        Attendance.total_hours,
        Attendance.gps_location,
        Attendance.selfie
    ).join(User, Attendance.user_id == User.user_id)

    if user_id:
        query = query.filter(Attendance.user_id == user_id)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Attendance ID", "User ID", "Name", "Department", "Check In", "Check Out", "Total Hours (hrs)", "GPS", "Selfie"])

    for a in query.all():
        writer.writerow([
            a.attendance_id,
            a.user_id,
            a.user_name,
            a.user_department or "",
            a.check_in.strftime("%Y-%m-%d %H:%M:%S") if a.check_in else "",
            a.check_out.strftime("%Y-%m-%d %H:%M:%S") if a.check_out else "",
            round(a.total_hours or 0, 2),
            a.gps_location or "",
            a.selfie or ""
        ])

    output.seek(0)
    return output

def export_attendance_pdf(db: Session, user_id: int = None):
    query = db.query(
        Attendance.attendance_id,
        Attendance.user_id,
        User.name.label("user_name"),
        User.department.label("user_department"),
        Attendance.check_in,
        Attendance.check_out,
        Attendance.total_hours
    ).join(User, Attendance.user_id == User.user_id)

    if user_id:
        query = query.filter(Attendance.user_id == user_id)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    data = [["Attendance ID", "User ID", "Name", "Department", "Check In", "Check Out", "Total Hours"]]

    for a in query.all():
        data.append([
            a.attendance_id,
            a.user_id,
            a.user_name,
            a.user_department or "",
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
