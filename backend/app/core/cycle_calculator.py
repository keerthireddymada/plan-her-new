from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from ..models.profile import UserProfile
from ..models.period import PeriodRecord


def calculate_day_of_cycle(user_id: int, target_date: date, db: Session) -> int:
    """
    Calculate the day of cycle for a given date
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")
    
    # Get all period records for the user
    periods = db.query(PeriodRecord).filter(
        PeriodRecord.user_id == user_id,
        PeriodRecord.start_date <= target_date
    ).order_by(PeriodRecord.start_date.desc()).all()
    
    if not periods:
        if profile.last_period_start:
            last_period_start = profile.last_period_start
        else:
            raise ValueError("No period records or last period start date found in profile.")
    else:
        # Find the most recent period start date before or on the target date
        last_period_start = None
        for period in periods:
            if period.start_date <= target_date:
                last_period_start = period.start_date
                break
        
        if not last_period_start:
            raise ValueError("No period start date found before target date in records.")
    
    # Calculate day of cycle
    day_of_cycle = (target_date - last_period_start).days + 1
    
    return day_of_cycle


def calculate_cycle_phase(day_of_cycle: int, cycle_length: int, luteal_length: int) -> str:
    """
    Calculate the cycle phase based on day of cycle
    """
    ovulation_day = cycle_length - luteal_length - 1
    
    if day_of_cycle <= 5:
        return "Menses"
    elif day_of_cycle <= ovulation_day:
        return "Follicular"
    elif day_of_cycle <= cycle_length:
        return "Luteal"
    else:
        return "Next Cycle"


def calculate_next_period_date(user_id: int, db: Session) -> date:
    """
    Calculates the next expected period date based on the user's
    historical average cycle length.
    Requires at least 3 logged cycles to use the statistical method,
    otherwise falls back to the profile's default cycle length.
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise ValueError("User profile not found")

    # Get all period records, sorted by start date
    periods = db.query(PeriodRecord).filter(
        PeriodRecord.user_id == user_id
    ).order_by(PeriodRecord.start_date).all()

    if not periods:
        raise ValueError("No period records found to calculate next period date")

    latest_period_start_date = periods[-1].start_date
    
    # Check if there is enough data for statistical prediction
    if len(periods) < 3:
        # Fallback to simple prediction using profile cycle length
        predicted_cycle_length = profile.cycle_length
    else:
        # Calculate the average cycle length from historical data
        cycle_lengths = []
        for i in range(1, len(periods)):
            cycle_length = (periods[i].start_date - periods[i-1].start_date).days
            cycle_lengths.append(cycle_length)
        
        # Use a simple average for prediction
        # A weighted average could be used here for more accuracy
        predicted_cycle_length = sum(cycle_lengths) / len(cycle_lengths)

    # Calculate next period date
    next_period_date = latest_period_start_date + timedelta(days=int(round(predicted_cycle_length)))
    
    return next_period_date


def calculate_days_until_next_period(user_id: int, db: Session) -> int:
    """
    Calculate days until next period
    """
    try:
        next_period_date = calculate_next_period_date(user_id, db)
        today = date.today()
        days_until = (next_period_date - today).days
        return max(0, days_until)
    except ValueError:
        return None


def get_cycle_statistics(user_id: int, db: Session) -> dict:
    """
    Get cycle statistics for the user
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return None
    
    # Get all period records
    periods = db.query(PeriodRecord).filter(
        PeriodRecord.user_id == user_id
    ).order_by(PeriodRecord.start_date).all()
    
    if len(periods) < 2:
        return {
            "total_periods": len(periods),
            "average_cycle_length": profile.cycle_length,
            "current_cycle_length": None
        }
    
    # Calculate actual cycle lengths
    cycle_lengths = []
    for i in range(1, len(periods)):
        cycle_length = (periods[i].start_date - periods[i-1].start_date).days
        cycle_lengths.append(cycle_length)
    
    # Calculate statistics
    avg_cycle_length = sum(cycle_lengths) / len(cycle_lengths)
    
    # Get current cycle length
    latest_period = periods[-1]
    today = date.today()
    current_cycle_length = (today - latest_period.start_date).days
    
    return {
        "total_periods": len(periods),
        "average_cycle_length": round(avg_cycle_length, 1),
        "current_cycle_length": current_cycle_length,
        "min_cycle_length": min(cycle_lengths),
        "max_cycle_length": max(cycle_lengths)
    }
