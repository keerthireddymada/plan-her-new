from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, LargeBinary, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class UserModel(Base):
    __tablename__ = "user_models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Model data
    model_type = Column(String(50), default="energy", nullable=False)
    model_data = Column(LargeBinary)  # Serialized ML model
    accuracy_score = Column(Numeric(5, 4))
    model_version = Column(String(50), default="1.0")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="models")

    def __repr__(self):
        return f"<UserModel(id={self.id}, user_id={self.user_id}, model_type='{self.model_type}', accuracy_score={self.accuracy_score})>"