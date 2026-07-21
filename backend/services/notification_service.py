"""
Notification Service
Handles real-time system notifications and alerts stored in PostgreSQL.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models import Notification, User

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        title: str,
        message: str,
        notification_type: str = "SYSTEM_ALERT",
        recipient_role: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Notification:
        """Creates a new notification record in PostgreSQL."""
        notif = Notification(
            title=title,
            message=message,
            type=notification_type,
            recipient_role=recipient_role,
            user_id=user_id,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def get_user_notifications(db: Session, user_role: str, user_id: Optional[str] = None, limit: int = 20) -> List[Notification]:
        """Fetches unread & recent notifications relevant to user or role."""
        query = db.query(Notification).filter(
            (Notification.recipient_role == user_role) | (Notification.recipient_role == "all") | (Notification.user_id == user_id)
        )
        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: str) -> bool:
        """Marks a notification as read."""
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            return True
        return False
