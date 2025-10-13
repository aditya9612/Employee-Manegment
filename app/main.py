from fastapi import FastAPI

from app.db import models
from app.db.database import engine
from app.routes import user_routes, attendance_routes, leave_routes, task_routes, auth_routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Management System", version="1.0")

# Routers
app.include_router(user_routes.router)
app.include_router(attendance_routes.router)
app.include_router(leave_routes.router)
app.include_router(task_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
def home():
    return {"message": "Welcome to Employee Management System API"}
