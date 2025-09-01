from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, ForeignKey, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Physical measurements
    height_cm = Column(Integer, nullable=False)
    weight_kg = Column(Numeric(5, 2), nullable=False)
    
    # Cycle information
    cycle_length = Column(Integer, nullable=False)
    luteal_length = Column(Integer, nullable=False)
    menses_length = Column(Integer, nullable=False)
    unusual_bleeding = Column(Boolean, default=False)
    number_of_peak = Column(Integer, default=1)
    
    # Period information
    period_regularity = Column(String(20), nullable=False)  # "regular" or "irregular"
    period_description = Column(String(20), nullable=False)  # "usual" or "unusual"
    medical_conditions = Column(Text, nullable=True)
    last_period_start = Column(Date, nullable=False)
    last_period_end = Column(Date, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id}, cycle_length={self.cycle_length})>"
