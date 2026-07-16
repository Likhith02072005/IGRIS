import time
import logging
import threading
from typing import Dict, Any, List
from app.market_data.adapters import get_market_data_adapter, BaseMarketDataAdapter
from app.core.event_bus import event_bus

logger = logging.getLogger(__name__)

class MarketDataService:
    """
    Centralized Market Data Connection Hub.
    Maintains unified broker connections and broadcasts ticks on the Event Bus.
    """
    def __init__(self):
        self.active_adapters: Dict[str, BaseMarketDataAdapter] = {}
        self.lock = threading.Lock()
        self._monitor_thread = None
        self._stop_event = threading.Event()

    def start(self):
        self._stop_event.clear()
        self._monitor_thread = threading.Thread(target=self._monitor_connections_loop, daemon=True)
        self._monitor_thread.start()
        logger.info("MarketDataService monitoring loop started.")

    def stop(self):
        self._stop_event.set()
        with self.lock:
            for broker, adapter in list(self.active_adapters.items()):
                adapter.disconnect()
                logger.info(f"Stopped market data adapter: {broker}")
            self.active_adapters.clear()

    def connect_broker_feed(self, broker: str, credentials: Dict[str, Any], symbols: List[str]) -> bool:
        """
        Connects a broker web socket feed and registers event stream callbacks.
        """
        broker_upper = broker.upper()
        with self.lock:
            if broker_upper in self.active_adapters and self.active_adapters[broker_upper].connected:
                logger.info(f"Market feed for {broker_upper} is already active. Subscribing to extra symbols.")
                self.active_adapters[broker_upper].subscribe_symbols(symbols)
                return True

            adapter = get_market_data_adapter(broker_upper)
            
            # Callbacks publishing tick events to event bus
            def handle_tick(tick: Dict[str, Any]):
                latency = adapter.measure_latency(tick.get("timestamp", time.time()))
                tick["latency_ms"] = round(latency, 2)
                event_bus.publish("MarketTick", tick)

            def handle_disconnect():
                logger.warning(f"Market data adapter {broker_upper} disconnected!")
                event_bus.publish("BrokerDisconnected", {"broker": broker_upper})
                # Reconnection attempts handled by background thread

            adapter.register_callbacks(on_tick=handle_tick, on_disconnect=handle_disconnect)
            
            success = adapter.connect(credentials)
            if success:
                adapter.subscribe_symbols(symbols)
                self.active_adapters[broker_upper] = adapter
                event_bus.publish("BrokerReconnected", {"broker": broker_upper})
                logger.info(f"Market data feed connected for broker: {broker_upper}")
                return True
            else:
                logger.error(f"Failed to connect market data feed for broker: {broker_upper}")
                return False

    def _monitor_connections_loop(self):
        while not self._stop_event.is_set():
            with self.lock:
                for broker, adapter in list(self.active_adapters.items()):
                    if not adapter.connected:
                        logger.warning(f"Re-connecting lost market data stream for: {broker}")
                        # Simulate credentials lookup and re-connect attempt
                        adapter.connect({})
                        event_bus.publish("BrokerReconnected", {"broker": broker})
            time.sleep(10.0)

# Global service instance
market_data_service = MarketDataService()
