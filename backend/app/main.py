from datetime import date
from random import sample

from fastapi import FastAPI
from pydantic import BaseModel
from sqlmodel import Field, Session, SQLModel, create_engine, select


class PlayerProgress(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    total_xp: int = 0
    streak: int = 0
    updated_at: date = Field(default_factory=date.today)


class DailyQuestRequest(BaseModel):
    stats: list[str]


class Quest(BaseModel):
    label: str
    xp: int


QUEST_POOL = [
    Quest(label="1 DSA question", xp=10),
    Quest(label="30 min coding", xp=20),
    Quest(label="Drink 2L water", xp=8),
    Quest(label="Workout", xp=30),
    Quest(label="Apply to 1 internship", xp=15),
    Quest(label="Study 1 hour", xp=20),
]

app = FastAPI(title="ARISE API")
engine = create_engine("sqlite:///arise.db")


@app.on_event("startup")
def on_startup() -> None:
    SQLModel.metadata.create_all(engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/quests/daily")
def daily_quests(payload: DailyQuestRequest) -> dict[str, list[dict[str, str | int]]]:
    selected = sample(QUEST_POOL, k=3)
    return {"quests": [quest.model_dump() for quest in selected], "focus": payload.stats[:3]}


@app.post("/players/{name}/xp")
def grant_xp(name: str, amount: int) -> dict[str, int | str]:
    with Session(engine) as session:
        player = session.exec(select(PlayerProgress).where(PlayerProgress.name == name)).first()
        if not player:
            player = PlayerProgress(name=name)
            session.add(player)
        player.total_xp = max(0, player.total_xp + amount)
        session.add(player)
        session.commit()
        return {
            "name": player.name,
            "total_xp": player.total_xp,
            "level": player.total_xp // 100,
        }
