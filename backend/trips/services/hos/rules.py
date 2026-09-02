"""
FMCSA-style Hours-of-Service limits (assessment rules).

Property-carrying driver, 70 hr / 8-day cycle, no adverse conditions.
"""

# Driving windows
MAX_DRIVE_HOURS_PER_DAY = 11.0
MIN_OFF_DUTY_RESET_HOURS = 10.0
BREAK_AFTER_DRIVE_HOURS = 8.0
BREAK_DURATION_HOURS = 0.5

# 70-hour / 8-day cycle
CYCLE_MAX_HOURS = 70.0
CYCLE_RECOVERY_REST_HOURS = 10.0

# Trip stops (README)
FUEL_INTERVAL_MILES = 1000
FUEL_STOP_HOURS = 0.5
PICKUP_ON_DUTY_HOURS = 1.0
DROPOFF_ON_DUTY_HOURS = 1.0

HOUR_EPSILON = 0.001
