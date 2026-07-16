from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

class BaseBrokerAdapter(ABC):
    """
    Abstract Base Class for Broker Abstraction Layer.
    All broker integrations (Zerodha, Dhan, Upstox, OpenAlgo) must inherit and implement these.
    """
    
    @abstractmethod
    def connect(self, credentials: Dict[str, Any]) -> bool:
        """
        Authenticate and connect to the broker API.
        """
        pass
        
    @abstractmethod
    def place_order(
        self,
        symbol: str,
        direction: str,  # BUY, SELL
        qty: int,
        order_type: str,  # MARKET, LIMIT, SL-M, SL-L
        price: Optional[float] = None,
        trigger_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Place a new order with the broker. Returns transaction dict.
        """
        pass
        
    @abstractmethod
    def cancel_order(self, order_id: str) -> bool:
        """
        Cancel an existing pending order.
        """
        pass
        
    @abstractmethod
    def get_positions(self) -> List[Dict[str, Any]]:
        """
        Retrieve current open and closed intraday positions.
        """
        pass
        
    @abstractmethod
    def get_margins(self) -> Dict[str, Any]:
        """
        Retrieve available margin, collateral, and used margins.
        """
        pass
        
    @abstractmethod
    def get_order_status(self, order_id: str) -> str:
        """
        Get the current execution status of an order (EXECUTED, REJECTED, PENDING, CANCELLED).
        """
        pass
