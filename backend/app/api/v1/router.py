"""
HealthFlow AI - Unified API v1 Router
Binds all core module endpoints into the versioned API route.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    schemes,
    prescriptions,
    medicines,
    qr,
    health_records,
    doctors,
    hospitals,
    appointments,
    blood_banks,
    reminders,
    emergency,
    admin,
    patients,
    medical_history,
    health_qr,
    trusted_contacts,
    accident,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(schemes.router)
api_router.include_router(prescriptions.router)
api_router.include_router(medicines.router)
api_router.include_router(qr.router)
api_router.include_router(health_records.router)
api_router.include_router(doctors.router)
api_router.include_router(hospitals.router)
api_router.include_router(appointments.router)
api_router.include_router(blood_banks.router)
api_router.include_router(reminders.router)
api_router.include_router(emergency.router)
api_router.include_router(admin.router)
api_router.include_router(patients.router)
api_router.include_router(medical_history.router)
api_router.include_router(health_qr.router)
api_router.include_router(trusted_contacts.router)
api_router.include_router(accident.router)
