"""Database models"""
from app.models.user import User
from app.models.call import Call
from app.models.candidate import Candidate
from app.models.notification import Notification

__all__ = ["User", "Call", "Candidate", "Notification"]
