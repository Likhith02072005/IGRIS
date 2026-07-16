import numpy as np
import pandas as pd
from typing import Dict, Any

class MarketRegimeDetector:
    """
    Quantitative Market Regime Classification Engine.
    Analyzes volatility, trends, and momentum metrics to identify market regimes.
    """
    
    @staticmethod
    def detect_regime(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates indicators (ATR, SMA, standard deviation) and classifies the market.
        """
        if len(df) < 50:
            return {
                "regime": "INSUFFICIENT_DATA",
                "volatility": "NORMAL",
                "trend": "NEUTRAL",
                "vix_approx": 15.0
            }
            
        close = df["close"]
        high = df["high"]
        low = df["low"]
        
        # 1. Trend Calculation (using 50 SMA and 200 SMA)
        sma_50 = close.rolling(window=50).mean().iloc[-1]
        sma_200 = close.rolling(window=200).mean().iloc[-1] if len(df) >= 200 else close.rolling(window=min(len(df), 100)).mean().iloc[-1]
        latest_close = close.iloc[-1]
        
        trend = "NEUTRAL"
        if latest_close > sma_50 > sma_200:
            trend = "BULLISH"
        elif latest_close < sma_50 < sma_200:
            trend = "BEARISH"
            
        # 2. Volatility Calculation (using Standard Deviation and ATR approximation)
        returns = close.pct_change().dropna()
        vol = float(returns.rolling(window=20).std().iloc[-1] * np.sqrt(252) * 100) # Annualized Volatility %
        
        # Classify Volatility
        volatility_class = "NORMAL"
        if vol > 22.0:
            volatility_class = "HIGH"
        elif vol < 12.0:
            volatility_class = "LOW"
            
        # 3. Formulate Regime Class
        regime = "RANGE_BOUND"
        if trend == "BULLISH":
            regime = f"{volatility_class}_VOLATILITY_BULLISH"
        elif trend == "BEARISH":
            regime = f"{volatility_class}_VOLATILITY_BEARISH"
        else:
            if volatility_class == "HIGH":
                regime = "HIGH_VOLATILITY_CHOPPY"
            else:
                regime = "LOW_VOLATILITY_CONSOLIDATION"
                
        return {
            "regime": regime,
            "annualized_volatility_pct": round(vol, 2),
            "trend": trend,
            "sma_50": round(sma_50, 2),
            "vix_approximation": round(vol * 0.85, 2)  # Correlation approximation
        }
