from pydantic import BaseModel


class EntryCreate(BaseModel):
    title: str
    username: str
    password: str
    notes: str | None = None
    category: str | None = None


class EntryResponse(BaseModel):
    id: int
    title: str
    username: str
    notes: str | None
    category: str | None

    class Config:
        from_attributes = True

class EntryDetailResponse(BaseModel):
    id: int
    title: str
    username: str
    password: str
    notes: str | None
    category: str | None

    class Config:
        from_attributes = True

class EntryUpdate(BaseModel):
    title: str
    username: str
    password: str
    notes: str | None = None
    category: str | None = None