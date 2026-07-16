import os
import yaml
import json
import logging
import importlib.util
from typing import Dict, Any, Type

logger = logging.getLogger(__name__)

class StrategySandboxLoader:
    """
    Dynamic strategy sandbox.
    Loads and hot-swaps strategy plugins from the strategies folder.
    """
    def __init__(self, strategies_dir: str = "/app/strategies"):
        # Default to local path if directory doesn't exist (e.g. running outside Docker)
        if not os.path.exists(strategies_dir):
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
            self.strategies_dir = os.path.join(base_dir, "strategies")
        else:
            self.strategies_dir = strategies_dir

    def list_strategies(self) -> list[Dict[str, Any]]:
        """Scans folder structure and reads metadata files."""
        results = []
        if not os.path.exists(self.strategies_dir):
            return results
            
        for item in os.listdir(self.strategies_dir):
            item_path = os.path.join(self.strategies_dir, item)
            if os.path.isdir(item_path):
                metadata_path = os.path.join(item_path, "metadata.json")
                config_path = os.path.join(item_path, "config.yaml")
                if os.path.exists(metadata_path):
                    try:
                        with open(metadata_path, "r") as f:
                            meta = json.load(f)
                        meta["path"] = item_path
                        results.append(meta)
                    except Exception as e:
                        logger.error(f"Error reading strategy metadata {item}: {e}")
        return results

    def load_strategy_class(self, name: str) -> Type[Any]:
        """
        Dynamically imports the strategy class from its sandbox file.
        """
        strat_path = os.path.join(self.strategies_dir, name, "strategy.py")
        if not os.path.exists(strat_path):
            # Fallback to direct file loader for compatibility with preloaded scripts
            fallback_path = os.path.join(self.strategies_dir, f"{name.lower()}.py")
            if not os.path.exists(fallback_path):
                raise FileNotFoundError(f"Strategy file not found for: {name}")
            strat_path = fallback_path

        module_name = f"strategies.{name}"
        spec = importlib.util.spec_from_file_location(module_name, strat_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load spec for {name}")
            
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Look for standard classes implementing BaseStrategy/Strategy
        for attr in dir(module):
            cls = getattr(module, attr)
            if isinstance(cls, type) and cls.__name__ != "BaseStrategy" and "Strategy" in cls.__name__:
                return cls
                
        raise AttributeError(f"Could not find strategy class in module {name}")
