from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import config
from app.api import reviews
from app.api import config as config_api
from app.core.database import init_db

app = FastAPI(title="ReviewBot API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(reviews.router, prefix="/api")
app.include_router(config_api.router, prefix="/api") # Changed to use config_api
# app.include_router(config.router, prefix="/api") # Original line, now commented/removed

@app.get("/")
def read_root():
    return {"message": "ReviewBot Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
