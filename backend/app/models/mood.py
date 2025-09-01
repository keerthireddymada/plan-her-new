from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class DailyMood(Base):
    __tablename__ = "daily_moods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Mood data
    date = Column(Date, nullable=False)
    day_of_cycle = Column(Integer)
    energy_level = Column(Integer)  # 0=low, 1=medium, 2=high
    mood = Column(String, nullable=True)
    symptoms = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="moods")

    def __repr__(self):
        return f"<DailyMood(id={self.id}, user_id={self.user_id}, date={self.date}, energy_level={self.energy_level})>"