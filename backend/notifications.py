from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from backend.database.session import get_db
from backend.database.models import User, Notification
from backend.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime
    sender_id: Optional[uuid.UUID] = None
    sender_email: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Retrieve all notifications for the current authenticated user."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a single notification as read."""
    try:
        nid = uuid.UUID(notification_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID."
        )
    notif = (
        db.query(Notification)
        .filter(Notification.id == nid, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found."
        )
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()


class MessageCreate(BaseModel):
    recipient_id: uuid.UUID
    message: str


@router.post("/send", status_code=status.HTTP_201_CREATED)
def send_user_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a communication message to another system user."""
    # Check if recipient exists
    recipient = (
        db.query(User)
        .filter(User.id == payload.recipient_id, User.is_deleted == False)
        .first()
    )
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found.")

    # Create notification acting as a message
    notif = Notification(
        user_id=payload.recipient_id,
        sender_id=current_user.id,
        title=f"Message from {current_user.email}",
        message=payload.message,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return {"status": "Message sent successfully", "notification_id": notif.id}
