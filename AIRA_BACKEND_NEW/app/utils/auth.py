"""Authentication utilities"""
from fastapi import Depends
from app.api.auth import get_current_active_user
from app.models.user import User

# Re-export for convenience
__all__ = ["get_current_active_user"]
