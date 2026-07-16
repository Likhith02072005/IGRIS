import pandas as pd
from typing import Dict, Any, Optional, Tuple
from .base import BaseStrategy

class AstraStrategy(BaseStrategy):
    """
    Astra Strategy:
    1. Wait first two 30-min candles.
    2. If first is Green AND second is Green:
       - Store first candle Low.
       - If price revisits this Low later: Buy ATM Put (bearish trade).
    3. If first is Red AND second is Red:
       - Store first candle High.
       - If price revisits this High later: Buy ATM Call (bullish trade).
    4. Target: 50 points, SL: 100 points.
    5. No reentry. Force exit at 15:15 (3:15 PM).
    """
    def __init__(self, name: str = "ASTRA", params: Optional[Dict[str, Any]] = None):
        default_params = {
            "target": 50.0,
            "stop_loss": 100.0,
            "position_size": 1.0,
            "risk_percent": 1.0
        }
        if params:
            default_params.update(params)
        super().__init__(name, default_params)
        
        # State tracking
        self.first_low = None
        self.first_high = None
        self.setup = None  # "PUT_SETUP" or "CALL_SETUP"
        self.trade_taken = False

    def on_candle(self, df: pd.DataFrame) -> Tuple[Optional[str], str]:
        if len(df) < 2 or self.trade_taken:
            return None, "Awaiting setup or trade already completed."

        # Verify setup on first two candles
        if self.setup is None:
            c1 = df.iloc[0]
            c2 = df.iloc[1]
            
            c1_green = c1["close"] > c1["open"]
            c2_green = c2["close"] > c2["open"]
            c1_red = c1["close"] < c1["open"]
            c2_red = c2["close"] < c2["open"]

            if c1_green and c2_green:
                self.first_low = c1["low"]
                self.setup = "PUT_SETUP"
                return None, f"Put buying setup activated. Target Low: {self.first_low}"
            elif c1_red and c2_red:
                self.first_high = c1["high"]
                self.setup = "CALL_SETUP"
                return None, f"Call buying setup activated. Target High: {self.first_high}"
            else:
                self.setup = "FAILED"
                return None, "Candle colors do not match setup criteria."

        # Check for entries on subsequent candles
        if self.setup == "PUT_SETUP" and self.first_low is not None:
            # We buy Put (SELL/SHORT signal on main index) when price touches or drops below the stored Low
            latest = df.iloc[-1]
            if latest["low"] <= self.first_low <= latest["high"]:
                self.trade_taken = True
                return "SELL", f"Price revisited stored low ({self.first_low}). Buying ATM Put."
                
        elif self.setup == "CALL_SETUP" and self.first_high is not None:
            # We buy Call (BUY/LONG signal on main index) when price touches or crosses above the stored High
            latest = df.iloc[-1]
            if latest["low"] <= self.first_high <= latest["high"]:
                self.trade_taken = True
                return "BUY", f"Price revisited stored high ({self.first_high}). Buying ATM Call."

        return None, "No signal triggered."

    def check_exit(self, position: Dict[str, Any], current_row: pd.Series) -> Tuple[bool, str]:
        # Handle time-based exit (15:15 / 3:15 PM)
        timestamp = current_row.get("time")
        if timestamp:
            time_str = str(timestamp).split()[-1]  # Get HH:MM:SS
            if time_str >= "15:15:00":
                return True, "TIME_EXIT"

        return super().check_exit(position, current_row)
