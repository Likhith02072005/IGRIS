import time
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class RiskEngine:
    """
    Separate Risk Engine Service.
    Enforces trading limits, sizes, circuit breakers, and blackout windows.
    """
    def __init__(self):
        self.kill_switch_active = False
        self.news_blackout_active = False

    def validate_order(self, order: Dict[str, Any], risk_profile: Dict[str, Any], stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates order parameters against risk rules before passing to execution router.
        """
        if self.kill_switch_active:
            return {"approved": False, "reason": "MASTER_KILL_SWITCH_ACTIVE"}
            
        if self.news_blackout_active:
            return {"approved": False, "reason": "NEWS_BLACKOUT_WINDOW"}
            
        # 1. Enforce Daily / Weekly Loss limits
        current_loss = stats.get("daily_loss", 0.0)
        max_daily_loss = risk_profile.get("max_daily_loss", 5000.0)
        if current_loss >= max_daily_loss:
            return {"approved": False, "reason": "BREACH_DAILY_LOSS_LIMIT"}

        # 2. Portfolio Heat Limit Check
        current_heat = stats.get("portfolio_heat", 0.0)
        max_heat = risk_profile.get("max_portfolio_heat", 70.0)
        allocated_pct = order.get("margin_required", 0.0) / stats.get("available_capital", 100000.0) * 100
        if (current_heat + allocated_pct) > max_heat:
            return {"approved": False, "reason": "BREACH_MAX_PORTFOLIO_HEAT"}

        # 3. Position Size limit check
        qty = order.get("qty", 0)
        max_qty = risk_profile.get("max_position_qty", 500)
        if qty > max_qty:
            return {"approved": False, "reason": "BREACH_MAX_POSITION_LIMIT"}

        return {"approved": True, "reason": "RISK_PARAMETERS_OK"}

    def calculate_kelly_size(self, win_rate: float, avg_win: float, avg_loss: float, capital: float) -> float:
        """
        Standard Kelly Criterion sizing equation:
        f* = (p * R - q) / R
        where R is Avg Win / Avg Loss, p is win rate, q is loss rate.
        """
        if avg_loss == 0:
            return 0.0
            
        r = avg_win / avg_loss
        p = win_rate
        q = 1.0 - p
        
        kelly_fraction = (p * r - q) / r if r > 0 else 0.0
        # Fractional scaling (half-kelly) to avoid excessive volatility
        scaled_fraction = max(0.0, min(0.3, kelly_fraction * 0.5))
        return round(capital * scaled_fraction, 2)

    def calculate_atr_size(self, atr: float, multiplier: float, capital: float, risk_pct: float, point_value: float = 1.0) -> int:
        """
        ATR Sizing:
        Qty = (Capital * Risk%) / (ATR * Multiplier * PointValue)
        """
        if atr <= 0 or multiplier <= 0 or point_value <= 0:
            return 1
            
        risk_amount = capital * (risk_pct / 100.0)
        stop_distance = atr * multiplier
        qty = int(risk_amount / (stop_distance * point_value))
        return max(1, qty)

# Global RiskEngine instance
risk_engine = RiskEngine()
