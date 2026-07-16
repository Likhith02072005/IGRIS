import pandas as pd
from typing import Dict, Any, Optional, Tuple
from .base import BaseStrategy

class MomentumCatcherStrategy(BaseStrategy):
    """
    Momentum Catcher Strategy:
    1. Identify opening breakout levels (first candle high/low).
    2. Buy first ATM option breaking this opening range.
    3. Target: 40 points, SL: 40 points.
    4. Time exit: 12:00 PM (Noon).
    """
    def __init__(self, name: str = "Momentum Catcher", params: Optional[Dict[str, Any]] = None):
        default_params = {
            "target": 40.0,
            "stop_loss": 40.0,
            "position_size": 1.0,
            "risk_percent": 1.0
        }
        if params:
            default_params.update(params)
        super().__init__(name, default_params)
        
        self.opening_high = None
        self.opening_low = None
        self.trade_taken = False

    def on_candle(self, df: pd.DataFrame) -> Tuple[Optional[str], str]:
        if len(df) < 1 or self.trade_taken:
            return None, "Awaiting opening range or trade completed."

        # Establish opening high/low from the first candle
        if self.opening_high is None:
            first_candle = df.iloc[0]
            self.opening_high = first_candle["high"]
            self.opening_low = first_candle["low"]
            return None, f"Opening range established. High: {self.opening_high}, Low: {self.opening_low}"

        latest = df.iloc[-1]
        
        # Check breakout of opening high (Buy CE)
        if latest["close"] > self.opening_high:
            self.trade_taken = True
            return "BUY", f"Bullish breakout of opening high ({self.opening_high}). Buying ATM Call."
            
        # Check breakout of opening low (Buy PE)
        if latest["close"] < self.opening_low:
            self.trade_taken = True
            return "SELL", f"Bearish breakout of opening low ({self.opening_low}). Buying ATM Put."

        return None, "No momentum signal triggered."

    def check_exit(self, position: Dict[str, Any], current_row: pd.Series) -> Tuple[bool, str]:
        timestamp = current_row.get("time")
        if timestamp:
            time_str = str(timestamp).split()[-1]
            if time_str >= "12:00:00":
                return True, "TIME_EXIT"

        return super().check_exit(position, current_row)
