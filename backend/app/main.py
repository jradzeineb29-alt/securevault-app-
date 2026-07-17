from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import user, entry
from app.routers import auth
from app.routers import entries


from contextlib import asynccontextmanager




# Import your models here so SQLAlchemy knows about them
# Example:
# from app.models.user import User
# from app.models.password import Password
#
# Or if your models are all inside app/models.py:
# from app import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="SecureVault API",
    lifespan=lifespan,
)

# Include your routers here
# Example:
# from app.routes import auth, passwords
#
# app.include_router(auth.router)
# app.include_router(passwords.router)