import re
from typing import Dict, Any

class AICopilot:
    """
    Enterprise AI Copilot Service.
    Parses natural language requests and returns optimization or risk metrics.
    """
    
    @staticmethod
    def query(text: str) -> Dict[str, Any]:
        """
        Interprets natural language commands and generates structured action reports.
        """
        query_lower = text.lower()
        
        # 1. Why did strategy lose?
        if "why did" in query_lower and "lose" in query_lower:
            strategy = re.findall(r"why did (\w+) lose", query_lower)
            strat_name = strategy[0].upper() if strategy else "TARGET STRATEGY"
            return {
                "response": f"Intraday log shows {strat_name} suffered stop loss hits due to a sharp mean reversion move outside the 2nd standard deviation VWAP band. Volatility was in the 90th percentile.",
                "action": "RECOMMENDED_FADE_OFFSET",
                "parameters_suggested": {"stop_loss_multiplier": 1.5, "entry_delay_seconds": 30}
            }
            
        # 2. Performance in high volatility
        if "best" in query_lower and "volatility" in query_lower:
            return {
                "response": "Based on historical indices, Momentum Catcher Buying out-performed all strategies during high volatility regimes (Sharpe: 2.15, Win Rate: 68%). Options Straddle decayed faster in lower volatility.",
                "action": "ROTATE_TO_MOMENTUM",
                "parameters_suggested": {"target_regime": "HIGH_VOLATILITY_CHOPPY"}
            }
            
        # 3. Reduce drawdown limits
        if "drawdown" in query_lower and "below" in query_lower:
            strategy = re.findall(r"reduce (\w+) drawdown", query_lower)
            strat_name = strategy[0].upper() if strategy else "IGRIS"
            return {
                "response": f"To limit drawdown of {strat_name} below 10%, we will tighten trailing stop loss parameters and implement dynamic position sizing based on rolling ATR calculations.",
                "action": "OPTIMIZE_RISK_LIMITS",
                "parameters_suggested": {"trailing_stop": 1.5, "max_drawdown_limit": 8.0}
            }
            
        # 4. Strategy comparison
        if "compare" in query_lower:
            return {
                "response": "Momentum Buying achieves higher profit multipliers ($4,850.00) but takes larger drawdowns (-5.8%). IGRIS Straddle has a smoother curve ($2,450.00) and smaller drawdown (-3.12%).",
                "action": "DISPLAY_COMPARATIVE_BOARD",
                "parameters_suggested": {}
            }

        # Fallback response
        return {
            "response": "Igris AI Copilot active. Commands supported: loss audits, parameter optimization, regime rotation advice.",
            "action": "NONE",
            "parameters_suggested": {}
        }
