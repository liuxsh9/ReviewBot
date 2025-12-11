from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
import os
from dotenv import set_key

router = APIRouter()

class ConfigUpdate(BaseModel):
    GITCODE_ACCESS_TOKEN: Optional[str] = None
    GITHUB_ACCESS_TOKEN: Optional[str] = None
    AI_PROVIDER: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL_NAME: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    VOLC_API_KEY: Optional[str] = None
    VOLC_MODEL: Optional[str] = None
    VOLC_BASE_URL: Optional[str] = None
    SYSTEM_PROMPT: Optional[str] = None

@router.get("/config")
async def get_config():
    # Mask sensitive keys for security
    def mask(s: str):
        return s[:4] + "***" + s[-4:] if s and len(s) > 8 else "***"

    return {
        "GITCODE_ACCESS_TOKEN": mask(settings.GITCODE_ACCESS_TOKEN),
        "GITHUB_ACCESS_TOKEN": mask(settings.GITHUB_ACCESS_TOKEN),
        "AI_PROVIDER": settings.AI_PROVIDER,
        # Don't mask OpenAI keys completely if the user needs to edit them, 
        # but for now let's just return them raw or masked? 
        # Usually settings forms show empty or masked. 
        # For simplicity in this local tool, we might return them provided this is a local tool.
        # But safest is to return them. 
        # If I return masked, the user can't edit them easily without re-typing.
        # Given this is a local tool, I will return raw values for editable fields, 
        # or handle it like "if not changed, keep same".
        "OPENAI_API_KEY": settings.OPENAI_API_KEY, 
        "OPENAI_MODEL_NAME": settings.OPENAI_MODEL_NAME,
        "OPENAI_BASE_URL": settings.OPENAI_BASE_URL,
        "VOLC_API_KEY": settings.VOLC_API_KEY,
        "VOLC_MODEL": settings.VOLC_MODEL,
        "VOLC_BASE_URL": settings.VOLC_BASE_URL,
        "SYSTEM_PROMPT": settings.SYSTEM_PROMPT,
        "GITCODE_API_URL": settings.GITCODE_API_URL,
        "GITHUB_API_URL": settings.GITHUB_API_URL,
    }

@router.patch("/config")
async def update_config(config: ConfigUpdate):
    env_file_path = settings.Config.env_file
    
    # Update in-memory settings and .env file
    updated_fields = config.model_dump(exclude_unset=True)
    
    for key, value in updated_fields.items():
        if value is not None:
            # Update settings object
            setattr(settings, key, value)
            # Update .env file
            # Note: set_key is synchronous and blocking, but fine for config updates
            set_key(env_file_path, key, value)
            
    return {"message": "Configuration updated successfully", "config": updated_fields}
