from .base import BaseStrategy
from .astra import AstraStrategy
from .momentum_catcher import MomentumCatcherStrategy

def load_strategy(strategy_name: str, params: dict) -> BaseStrategy:
    name_clean = strategy_name.lower().replace(" ", "_").strip()
    if name_clean == "astra":
        return AstraStrategy("ASTRA", params)
    elif name_clean == "momentum_catcher" or name_clean == "momentum":
        return MomentumCatcherStrategy("Momentum Catcher", params)
    else:
        # Fallback dynamic class builder or base strategy
        return BaseStrategy(strategy_name, params)
