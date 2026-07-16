import logging
from typing import Dict, Any
from app.market_data.adapters.base import BaseMarketDataAdapter
from app.market_data.adapters.angleone import AngelOneDataAdapter
from app.market_data.adapters.openalgo import OpenAlgoDataAdapter
from app.market_data.adapters.shoonya import ShoonyaDataAdapter

logger = logging.getLogger(__name__)

class GenericDataAdapter(BaseMarketDataAdapter):
    """
    Fallback generic market data feed adapter for AliceBlue, Zerodha, Dhan, Upstox, Fyers, IIFL, Kotak, 5Paisa.
    """
    def __init__(self, broker_name: str):
        super().__init__(broker_name)
        self.subscribed_tokens = []

    def connect(self, credentials: Dict[str, Any]) -> bool:
        logger.info(f"Connecting Generic {self.broker_name} data feed adapter...")
        self.connected = True
        return True

    def subscribe_symbols(self, symbols: list):
        self.subscribed_tokens.extend(symbols)

    def disconnect(self):
        self.connected = False
        if self.on_disconnect_callback:
            self.on_disconnect_callback()

def get_market_data_adapter(broker: str) -> BaseMarketDataAdapter:
    broker_upper = broker.upper()
    if broker_upper == "ANGELONE":
        return AngelOneDataAdapter()
    elif broker_upper == "OPENALGO":
        return OpenAlgoDataAdapter()
    elif broker_upper == "SHOONYA":
        return ShoonyaDataAdapter()
    else:
        # Falls back to generic implementation for Zerodha, Dhan, AliceBlue, Upstox, Fyers, IIFL, Kotak, 5Paisa
        return GenericDataAdapter(broker_upper)
