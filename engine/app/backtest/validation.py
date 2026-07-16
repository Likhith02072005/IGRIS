import numpy as np
import pandas as pd
from typing import Dict, Any, List

class WalkForwardValidator:
    """
    Advanced backtest verification engine.
    Splits datasets into walk-forward training/testing grids and checks overfitting.
    """
    
    @staticmethod
    def split_data(df: pd.DataFrame, n_splits: int = 3, train_ratio: float = 0.7) -> List[Dict[str, pd.DataFrame]]:
        """
        Splits historical data into sliding walk-forward windows.
        """
        total_rows = len(df)
        if total_rows < 100:
            return [{"train": df, "test": df}]
            
        step = int((1 - train_ratio) * total_rows / n_splits)
        train_size = int(train_ratio * total_rows)
        
        splits = []
        for i in range(n_splits):
            start_idx = i * step
            train_end = start_idx + train_size
            test_end = min(total_rows, train_end + step)
            
            splits.append({
                "window": i + 1,
                "train": df.iloc[start_idx:train_end],
                "test": df.iloc[train_end:test_end]
            })
            
            if test_end >= total_rows:
                break
        return splits

    @staticmethod
    def calculate_efficiency(in_sample_profit: float, out_sample_profit: float) -> float:
        """
        Walk Forward Efficiency (WFE) = Out-of-sample Annualized Return / In-sample Annualized Return
        A WFE > 50-60% confirms strategy robustness.
        """
        if in_sample_profit == 0:
            return 0.0
        return round((out_sample_profit / in_sample_profit) * 100, 2)
