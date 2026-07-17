from datetime import timedelta
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.models import User, DoctorProfile, PendingRegistration
from backend.security import get_password_hash, verify_password, create_access_token, decode_access_token
from backend.schemas import (
    UserCreate, UserResponse, LoginRequest, TokenResponse,
    PendingRegistrationCreate, PendingRegistrationResponse, PendingRequestAction
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
security_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency injection to get the currently authenticated user from JWT."""
    token = credentials.credentials
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {current_user.role}",
            )
        return current_user

# Router endpoints
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new system user account."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # If the user is a doctor, create a default doctor profile
    if user.role == "doctor":
        # Create default doctor profile
        doctor = DoctorProfile(
            user_id=user.id,
            license_number=f"MD-{str(user.id)[:8]}",
            specialty="General Medicine",
            department="Outpatient Department (OPD)"
        )
        db.add(doctor)
        db.commit()
        
    return user

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Logs in an existing user and returns a JWT access token."""
    user = db.query(User).filter(User.email == login_data.email, User.is_deleted == False).first()
    if not user:
        # Check if there is a pending registration
        pending = db.query(PendingRegistration).filter(
            PendingRegistration.email == login_data.email
        ).first()
        if pending:
            if pending.status == "Pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Your registration request is pending review by a clinician."
                )
            elif pending.status == "Info Requested":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Additional info requested: {pending.info_request_notes}"
                )
            elif pending.status == "Rejected":
                reason = f" Reason: {pending.info_request_notes}" if pending.info_request_notes else ""
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Your registration request has been rejected.{reason}"
                )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/request-access", response_model=PendingRegistrationResponse, status_code=status.HTTP_201_CREATED)
def request_access(payload: PendingRegistrationCreate, db: Session = Depends(get_db)):
    """Registers a new access request for non-doctor staff."""
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
        
    existing_request = db.query(PendingRegistration).filter(PendingRegistration.email == payload.email).first()
    if existing_request:
        if existing_request.status == "Pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A pending request already exists for this email."
            )
        elif existing_request.status == "Info Requested":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A request already exists and is awaiting additional information."
            )
        else:
            db.delete(existing_request)
            db.commit()

    hashed_pwd = get_password_hash(payload.password)
    req = PendingRegistration(
        email=payload.email,
        password_hash=hashed_pwd,
        role=payload.role,
        license_number=payload.license_number,
        specialty=payload.specialty,
        department=payload.department,
        status="Pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/pending-requests", response_model=List[PendingRegistrationResponse])
def list_pending_requests(
    current_user: User = Depends(RoleChecker(["doctor"])),
    db: Session = Depends(get_db)
):
    """Lists all pending or info-requested registration requests (Doctors only)."""
    requests = db.query(PendingRegistration).filter(
        PendingRegistration.status.in_(["Pending", "Info Requested"])
    ).order_by(PendingRegistration.created_at.desc()).all()
    return requests

@router.post("/pending-requests/{request_id}/action", response_model=PendingRegistrationResponse)
def handle_pending_request(
    request_id: uuid.UUID,
    payload: PendingRequestAction,
    current_user: User = Depends(RoleChecker(["doctor"])),
    db: Session = Depends(get_db)
):
    """Approves, rejects, or requests info on a staff registration request."""
    req = db.query(PendingRegistration).filter(PendingRegistration.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found."
        )

    action = payload.action.lower()
    if action == "approve":
        req.status = "Approved"
        user = User(
            email=req.email,
            password_hash=req.password_hash,
            role=req.role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif action == "reject":
        req.status = "Rejected"
        req.info_request_notes = payload.notes
        db.commit()
    elif action == "request-info":
        req.status = "Info Requested"
        req.info_request_notes = payload.notes
        db.commit()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'approve', 'reject', or 'request-info'."
        )

    db.refresh(req)
    return req

@router.get("/users", response_model=List[UserResponse])
def list_system_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all active staff user accounts in the system."""
    users = db.query(User).filter(User.is_deleted == False).order_by(User.created_at.desc()).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_system_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a single staff user account by ID."""
    if current_user.role.lower() != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can view individual staff profiles."
        )
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")
    user = db.query(User).filter(User.id == uid, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_system_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft-deletes a staff user account. Doctors only."""
    if current_user.role.lower() != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can delete staff accounts."
        )
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")
    user = db.query(User).filter(User.id == uid, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.role.lower() in ("doctor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete doctor or admin accounts through this endpoint."
        )
    user.is_deleted = True
    user.is_active = False
    db.commit()

