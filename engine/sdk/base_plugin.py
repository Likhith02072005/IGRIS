import abc
from typing import Dict, Any, List

class BaseQuantPlugin(abc.ABC):
    """
    Developer SDK Base Plugin class.
    Allows developers to extend Igris with indicators, risk checkers, and strategies.
    """
    def __init__(self, name: str, version: str = "1.0.0"):
        self.name = name
        self.version = version

    @abc.abstractmethod
    def initialize(self, config: Dict[str, Any]):
        """Runs during plugin boot sequence."""
        pass

class BaseIndicatorPlugin(BaseQuantPlugin):
    """
    Base class for implementing technical indicators.
    """
    @abc.abstractmethod
    def calculate(self, data: Any) -> Any:
        """Returns indicators array/series."""
        pass

class BaseRiskPlugin(BaseQuantPlugin):
    """
    Base class for implementing custom risk parameters.
    """
    @abc.abstractmethod
    def validate_action(self, order: Dict[str, Any], stats: Dict[str, Any]) -> bool:
        """Returns True if approved, False if blocked by risk."""
        pass
