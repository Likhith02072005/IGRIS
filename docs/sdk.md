# IGRIS Plugin SDK

Developers can build strategy plugins using the IGRIS strategy loader.

## Custom Strategy Structure
Every strategy plugin resides under a subdirectory in `strategies/` containing:
- `strategy.py`: Strategy script deriving from `BaseStrategy`.
- `config.yaml`: Capital limit configurations.
- `metadata.json`: Display info and enablement parameters.

## Code Example
```python
import pandas as pd
from typing import Tuple, Optional, Dict, Any
from ..base import BaseStrategy

class CustomStrategy(BaseStrategy):
    def __init__(self, name: str = "Custom", params: Optional[Dict[str, Any]] = None):
        super().__init__(name, params)

    def on_candle(self, df: pd.DataFrame) -> Tuple[Optional[str], str]:
        # Implement logic here
        return None, "Awaiting signals."
```
