from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.review import ReviewExecution
from app.services.git_provider import get_git_provider
from app.core.ai_reviewer import AIReviewer

router = APIRouter()
ai_reviewer = AIReviewer()

class ReviewRequest(BaseModel):
    pr_url: str

class ReviewResponse(BaseModel):
    id: int
    pr_url: str
    status: str
    result: Optional[str]
    created_at: str

async def process_review(review_id: int, pr_url: str, db_session_factory):
    # Create a new session for the background task
    async with db_session_factory() as db:
        try:
            # Fetch review
            result = await db.execute(select(ReviewExecution).where(ReviewExecution.id == review_id))
            review = result.scalar_one_or_none()
            if not review:
                return

            # Fetch Data
            provider = get_git_provider(pr_url)
            metadata = await provider.fetch_pr_metadata(pr_url)
            diff = await provider.fetch_pr_diff(pr_url)
            
            # Update Metadata
            review.metadata_json = metadata
            await db.commit()
            
            # Review
            ai_result = await ai_reviewer.review_diff(diff, metadata)
            
            # Save Result
            review.result = ai_result
            review.status = "completed"
            await db.commit()
            
        except Exception as e:
            # Handle failure
            # We need to re-fetch to ensure we are attached to session if needed, 
            # but usually transaction rollback/commit pattern is safer.
            # Simple error logging here.
            print(f"Review failed: {e}")
            result = await db.execute(select(ReviewExecution).where(ReviewExecution.id == review_id))
            review = result.scalar_one_or_none()
            if review:
                review.status = "failed"
                review.result = str(e)
                await db.commit()

@router.post("/reviews", response_model=ReviewResponse)
async def create_review(
    request: ReviewRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Create DB Entry
    new_review = ReviewExecution(pr_url=request.pr_url, status="pending")
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)

    # Trigger Background Task
    # We need to pass a session factory or handle session lifecycle carefully in background.
    # Passing the current session 'db' is risky if it closes.
    from app.core.database import AsyncSessionLocal
    background_tasks.add_task(process_review, new_review.id, request.pr_url, AsyncSessionLocal)

    return ReviewResponse(
        id=new_review.id,
        pr_url=new_review.pr_url,
        status=new_review.status,
        result=new_review.result,
        created_at=str(new_review.created_at)
    )

@router.get("/reviews", response_model=List[ReviewResponse])
async def list_reviews(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReviewExecution).order_by(ReviewExecution.created_at.desc()))
    reviews = result.scalars().all()
    return [
        ReviewResponse(
            id=r.id,
            pr_url=r.pr_url,
            status=r.status,
            result=r.result,
            created_at=str(r.created_at)
        )
        for r in reviews
    ]

@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReviewExecution).where(ReviewExecution.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return ReviewResponse(
        id=review.id,
        pr_url=review.pr_url,
        status=review.status,
        result=review.result,
        created_at=str(review.created_at)
    )

@router.delete("/reviews/{review_id}")
async def delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReviewExecution).where(ReviewExecution.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.delete(review)
    await db.commit()
    return {"message": "Review deleted successfully"}
