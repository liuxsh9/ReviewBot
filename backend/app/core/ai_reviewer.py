from app.core.config import settings
from typing import Dict, Any, List
from openai import AsyncOpenAI
import json

class AIReviewer:
    def __init__(self):
        if settings.AI_PROVIDER == "volcengine":
            self.client = AsyncOpenAI(
                api_key=settings.VOLC_API_KEY,
                base_url=settings.VOLC_BASE_URL
            )
            self.model = settings.VOLC_MODEL
        else:
            self.client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None
            )
            self.model = settings.OPENAI_MODEL_NAME

    async def review_diff(self, diff_content: str, metadata: Dict[str, Any]) -> str:
        try:
            prompt = settings.SYSTEM_PROMPT.format(
                title=metadata.get('title', 'N/A'),
                description=metadata.get('description', 'N/A'),
                author=metadata.get('author', 'N/A'),
                diff_content=diff_content
            )
        except Exception as e:
            # Fallback in case formatting fails due to mismatched keys in user config
            print(f"Error formatting prompt: {e}")
            prompt = f"Review this PR:\n\n{diff_content}"

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位乐于助人且严格的代码审查专家。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error analyzing PR: {str(e)}"
