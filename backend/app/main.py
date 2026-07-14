from fastapi import FastAPI
from app.database import Base, engine
from app.models import user, entry
from app.routers import auth
from app.routers import entries


app = FastAPI(
    title="SecureVault API"
)
app.include_router(entries.router)
app.include_router(auth.router)

Base.metadata.create_all(bind=engine)
@app.get("/")
def root():
    return {
        "message": "SecureVault API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }