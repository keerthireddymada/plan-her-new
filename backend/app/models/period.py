from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class PeriodRecord(Base):
    __tablename__ = "period_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Period dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="periods")

    def __repr__(self):
        return f"<PeriodRecord(id={self.id}, user_id={self.user_id}, start_date={self.start_date})>"
