
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entry import VaultEntry
from app.models.user import User
from app.schemas.entry import (
    EntryCreate,
    EntryResponse,
    EntryDetailResponse,
    EntryUpdate
)
from app.core.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from app.services.encryption_service import ( encrypt_password ,  decrypt_password )

router = APIRouter(
    prefix="/entries",
    tags=["Entries"]
)

@router.post("/", response_model=EntryResponse)
def create_entry(
    entry: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    encrypted_password = encrypt_password(
    entry.password
)

    db_entry = VaultEntry(
    title=entry.title,
    username=entry.username,
    encrypted_password=encrypted_password,
    notes=entry.notes,
    category=entry.category,
    user_id=current_user.id
)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return db_entry

@router.get("/", response_model=list[EntryResponse])
def list_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(VaultEntry).filter(
        VaultEntry.user_id == current_user.id
    ).all()


@router.get(
    "/{entry_id}",
    response_model=EntryDetailResponse
)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = (
        db.query(VaultEntry)
        .filter(
            VaultEntry.id == entry_id
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return {
    "id": entry.id,
    "title": entry.title,
    "username": entry.username,
    "password": decrypt_password(
        entry.encrypted_password
    ),
    "notes": entry.notes,
    "category": entry.category
}
@router.put(
    "/{entry_id}",
    response_model=EntryDetailResponse
)
def update_entry(
    entry_id: int,
    updated_entry: EntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = (
        db.query(VaultEntry)
        .filter(
            VaultEntry.id == entry_id
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    encrypted_password = encrypt_password(
        updated_entry.password
    )

    entry.title = updated_entry.title
    entry.username = updated_entry.username
    entry.encrypted_password = encrypted_password
    entry.notes = updated_entry.notes
    entry.category = updated_entry.category

    db.commit()
    db.refresh(entry)

    return entry
@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = (
        db.query(VaultEntry)
        .filter(
            VaultEntry.id == entry_id
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Entry deleted successfully"
    }