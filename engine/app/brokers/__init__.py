from .base import BaseBrokerAdapter
from .openalgo import OpenAlgoAdapter
from .zerodha import ZerodhaKiteAdapter
from .dhan import DhanAdapter
from .angleone import AngelOneAdapter

def get_broker_adapter(broker_name: str) -> BaseBrokerAdapter:
    name = broker_name.upper()
    if name == "OPENALGO":
        return OpenAlgoAdapter()
    elif name == "ZERODHA" or name == "KITE":
        return ZerodhaKiteAdapter()
    elif name == "DHAN":
        return DhanAdapter()
    elif name == "ANGELONE":
        return AngelOneAdapter()
    else:
        # Default fallback to OpenAlgo for dynamic/other mock systems
        return OpenAlgoAdapter()
