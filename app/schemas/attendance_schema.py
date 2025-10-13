from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceBase(BaseModel):
    gps_location: Optional[str] = None
    selfie: Optional[str] = None

class AttendanceOut(AttendanceBase):
    attendance_id: int
    user_id: int
    check_in: datetime
    check_out: Optional[datetime] = None
    total_hours: float

    class Config:
        from_attributes = True
