import time
import random
import threading
import logging
from typing import Dict, Any, List
from app.market_data.adapters.base import BaseMarketDataAdapter

logger = logging.getLogger(__name__)

class OpenAlgoDataAdapter(BaseMarketDataAdapter):
    """
    OpenAlgo Real-time Feed Adapter.
    """
    def __init__(self):
        super().__init__("OPENALGO")
        self.subscribed_tokens = []
        self._thread = None
        self._stop_event = threading.Event()

    def connect(self, credentials: Dict[str, Any]) -> bool:
        logger.info("Connecting to OpenAlgo feed...")
        self.connected = True
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._feed_loop, daemon=True)
        self._thread.start()
        return True

    def subscribe_symbols(self, symbols: List[str]):
        logger.info(f"OpenAlgo subscribed symbols: {symbols}")
        self.subscribed_tokens.extend(symbols)

    def disconnect(self):
        logger.info("Disconnecting OpenAlgo feed...")
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
                ltp = round(250.0 + random.uniform(-3.0, 3.0), 2)
                tick = {
                    "symbol": symbol,
                    "ltp": ltp,
                    "volume": random.randint(100, 2000),
                    "oi": random.randint(1500, 6000),
                    "greeks": {
                        "delta": round(random.uniform(0.15, 0.85), 2),
                        "gamma": round(random.uniform(0.01, 0.04), 3),
                        "vega": round(random.uniform(0.4, 1.8), 2),
                        "theta": round(random.uniform(-1.8, -0.4), 2)
                    },
                    "depth": {
                        "bid": [{"price": ltp - 0.05, "qty": 120}],
                        "ask": [{"price": ltp + 0.05, "qty": 160}]
                    },
                    "timestamp": time.time()
                }
                if self.on_tick_callback and self.validate_tick(tick):
                    self.on_tick_callback(tick)
            time.sleep(1.0)
