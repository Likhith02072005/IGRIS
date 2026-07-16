import time
import abc
import logging
from typing import Callable, Dict, Any, List

logger = logging.getLogger(__name__)

class BaseMarketDataAdapter(abc.ABC):
    """
    Abstract Base Class for Broker Websocket Feed Adapters.
    Defines the contract for real-time tick and quote streams.
    """
    def __init__(self, broker_name: str):
        self.broker_name = broker_name
        self.connected = False
        self.latency_ms = 0.0
        self.on_tick_callback: Callable[[Dict[str, Any]], None] = None
        self.on_disconnect_callback: Callable[[], None] = None

    @abc.abstractmethod
    def connect(self, credentials: Dict[str, Any]) -> bool:
        """Establishes connection to the broker websocket endpoint."""
        pass

    @abc.abstractmethod
    def subscribe_symbols(self, symbols: List[str]):
        """Sends subscription request for specific stock/options instruments."""
        pass

    @abc.abstractmethod
    def disconnect(self):
        """Safely disconnects from the websocket endpoint."""
        pass

    def register_callbacks(self, on_tick: Callable[[Dict[str, Any]], None], on_disconnect: Callable[[], None]):
        self.on_tick_callback = on_tick
        self.on_disconnect_callback = on_disconnect

    def measure_latency(self, sent_time: float):
        self.latency_ms = (time.time() - sent_time) * 1000
        return self.latency_ms

    def validate_tick(self, tick: Dict[str, Any]) -> bool:
        """Enforces schema compliance for real-time tick feeds."""
        required = ["symbol", "ltp", "volume"]
        return all(k in tick for k in required)
