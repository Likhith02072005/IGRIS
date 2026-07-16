import pandas as pd
from typing import Dict, Any, Optional, Tuple

class BaseStrategy:
    """
    Abstract Base Class for all Astra Quant Lab strategies.
    Provides standard helper functions for technical analysis and signal checking.
    """
    def __init__(self, name: str, params: Dict[str, Any]):
        self.name = name
        self.params = params
        self.target = params.get("target", 0.0)
        self.stop_loss = params.get("stop_loss", 0.0)
        self.trailing_stop = params.get("trailing_stop", None)
        self.position_size = params.get("position_size", 1.0)
        self.risk_percent = params.get("risk_percent", 1.0)

    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate technical indicators on historical data.
        Override in strategy files if custom computations are needed.
        """
        # Copy to avoid side-effects
        df = df.copy()
        
        # Simple Moving Averages
        if "close" in df.columns:
            df["ema_9"] = df["close"].ewm(span=9, adjust=False).mean()
            df["ema_20"] = df["close"].ewm(span=20, adjust=False).mean()
            df["ema_50"] = df["close"].ewm(span=50, adjust=False).mean()
            df["ema_200"] = df["close"].ewm(span=200, adjust=False).mean()
            
            # Simple RSI
            delta = df["close"].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / (loss + 1e-9)
            df["rsi_14"] = 100 - (100 / (1 + rs))
            
            # MACD
            ema12 = df["close"].ewm(span=12, adjust=False).mean()
            ema26 = df["close"].ewm(span=26, adjust=False).mean()
            df["macd"] = ema12 - ema26
            df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
            
            # Bollinger Bands
            df["bb_middle"] = df["close"].rolling(window=20).mean()
            df["bb_std"] = df["close"].rolling(window=20).std()
            df["bb_upper"] = df["bb_middle"] + (df["bb_std"] * 2)
            df["bb_lower"] = df["bb_middle"] - (df["bb_std"] * 2)
            
            # VWAP
            if "volume" in df.columns:
                # Intraday cumulative volume price product
                # We assume df is already sorted and matches intraday reset
                q = df["volume"]
                p = (df["high"] + df["low"] + df["close"]) / 3
                df["vwap"] = (p * q).cumsum() / (q.cumsum() + 1e-9)
            else:
                df["vwap"] = df["close"]
                
        return df

    def on_candle(self, df: pd.DataFrame) -> Tuple[Optional[str], str]:
        """
        Processes the dataframe containing historical data up to the current candle.
        Returns:
            signal: "BUY", "SELL", or None
            message: Execution remarks
        """
        return None, "No signal triggered."

    def check_exit(self, position: Dict[str, Any], current_row: pd.Series) -> Tuple[bool, str]:
        """
        Check if the active position has reached target or stop loss.
        Returns:
            should_exit: bool
            reason: String (e.g., "TARGET", "STOP_LOSS", "TIME_EXIT")
        """
        direction = position.get("direction", "BUY")
        entry_price = position.get("entry_price", 0.0)
        curr_close = current_row.get("close", entry_price)
        
        if direction == "BUY":
            # Check Target
            if self.target > 0 and curr_close >= entry_price + self.target:
                return True, "TARGET"
            # Check Stop Loss
            if self.stop_loss > 0 and curr_close <= entry_price - self.stop_loss:
                return True, "STOP_LOSS"
        elif direction == "SELL":
            # Check Target
            if self.target > 0 and curr_close <= entry_price - self.target:
                return True, "TARGET"
            # Check Stop Loss
            if self.stop_loss > 0 and curr_close >= entry_price + self.stop_loss:
                return True, "STOP_LOSS"
                
        return False, "HOLD"
