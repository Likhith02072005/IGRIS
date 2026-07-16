import time
import random
import threading
import logging
from typing import Dict, Any, List
from app.market_data.adapters.base import BaseMarketDataAdapter

logger = logging.getLogger(__name__)

class ShoonyaDataAdapter(BaseMarketDataAdapter):
    """
    Shoonya Real-time Feed Adapter.
    """
    def __init__(self):
        super().__init__("SHOONYA")
        self.subscribed_tokens = []
        self._thread = None
        self._stop_event = threading.Event()

    def connect(self, credentials: Dict[str, Any]) -> bool:
        logger.info("Connecting to Shoonya feed...")
        self.connected = True
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._feed_loop, daemon=True)
        self._thread.start()
        return True

    def subscribe_symbols(self, symbols: List[str]):
        logger.info(f"Shoonya subscribed symbols: {symbols}")
        self.subscribed_tokens.extend(symbols)

    def disconnect(self):
        logger.info("Disconnecting Shoonya feed...")
        self.connected = False
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=1.0)
        if self.on_disconnect_callback:
            self.on_disconnect_callback()

    def _feed_loop(self):
        while not self._stop_event.is_set():
            if not self.subscribed_tokens:
                time.sleep(1.0)
                continue
                
            for symbol in self.subscribed_tokens:
                ltp = round(350.0 + random.uniform(-4.0, 4.0), 2)
                tick = {
                    "symbol": symbol,
                    "ltp": ltp,
                    "volume": random.randint(200, 3000),
                    "oi": random.randint(2000, 8000),
                    "greeks": {
                        "delta": round(random.uniform(0.2, 0.8), 2),
                        "gamma": round(random.uniform(0.01, 0.03), 3),
                        "vega": round(random.uniform(0.3, 1.5), 2),
                        "theta": round(random.uniform(-2.0, -0.3), 2)
                    },
                    "depth": {
                        "bid": [{"price": ltp - 0.05, "qty": 150}],
                        "ask": [{"price": ltp + 0.05, "qty": 200}]
                    },
                    "timestamp": time.time()
                }
                if self.on_tick_callback and self.validate_tick(tick):
                    self.on_tick_callback(tick)
            time.sleep(1.0)
