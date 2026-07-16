from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import user, entry
from app.routers import auth
from app.routers import entries


app = FastAPI(
    title="SecureVault API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
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