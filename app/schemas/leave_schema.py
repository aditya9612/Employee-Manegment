from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class LeaveBase(BaseModel):
    start_date: date
    end_date: date
    reason: Optional[str] = None
    status: Optional[str] = "Pending"

class LeaveCreate(LeaveBase):
    user_id: int

class LeaveOut(LeaveBase):
    leave_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
