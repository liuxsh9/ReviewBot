from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class ReviewExecution(Base):
    __tablename__ = "review_executions"

    id = Column(Integer, primary_key=True, index=True)
    pr_url = Column(String, index=True)
    status = Column(String, default="pending")  # pending, completed, failed
    result = Column(Text) # Markdown content
    metadata_json = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
