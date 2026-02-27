"""Timezone utilities for IST (India Standard Time)"""
from datetime import datetime, timezone, timedelta
from typing import Optional

# IST is UTC+5:30
IST = timezone(timedelta(hours=5, minutes=30))


def utc_to_ist(dt: Optional[datetime]) -> Optional[datetime]:
    """Convert UTC datetime to IST"""
    if dt is None:
        return None
    
    # If datetime is naive, assume it's UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    # Convert to IST
    return dt.astimezone(IST)


def ist_now() -> datetime:
    """Get current datetime in IST"""
    return datetime.now(IST)


def utc_now() -> datetime:
    """Get current datetime in UTC"""
    return datetime.now(timezone.utc)


def format_ist(dt: Optional[datetime], format_str: str = "%Y-%m-%d %H:%M:%S") -> Optional[str]:
    """Format datetime in IST"""
    if dt is None:
        return None
    
    ist_dt = utc_to_ist(dt)
    return ist_dt.strftime(format_str)
