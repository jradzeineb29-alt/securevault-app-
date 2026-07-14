from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class VaultEntry(Base):
    __tablename__ = "vault_entries"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    username = Column(
        String,
        nullable=False
    )

    encrypted_password = Column(
        String,
        nullable=False
    )

    notes = Column(
        String,
        nullable=True
    )

    category = Column(
        String,
        nullable=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="entries"
    )