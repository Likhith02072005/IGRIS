from .base import BaseStrategy
from .igris.strategy import IgrisStrategy
from .momentum_catcher.strategy import MomentumCatcherStrategy

def load_strategy(strategy_name: str, params: dict) -> BaseStrategy:
    name_clean = strategy_name.lower().replace(" ", "_").strip()
    if name_clean == "igris":
        return IgrisStrategy("IGRIS", params)
    elif name_clean == "momentum_catcher" or name_clean == "momentum":
        return MomentumCatcherStrategy("Momentum Catcher", params)
    else:
        # Fallback dynamic class builder or base strategy
        return BaseStrategy(strategy_name, params)
