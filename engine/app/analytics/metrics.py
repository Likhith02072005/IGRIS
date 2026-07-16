import numpy as np
import pandas as pd
from typing import Dict, List, Any

class AnalyticsEngine:
    """
    Advanced Quantitative Analytics Engine.
    Computes Monte Carlo runs, walk-forward stats, and performance heatmaps.
    """
    
    @staticmethod
    def run_monte_carlo(trades_pnl: List[float], n_simulations: int = 1000, n_days: int = 30) -> Dict[str, Any]:
        """
        Executes a Monte Carlo Simulation by shuffling historical trade PnL paths.
        Returns percentile bands representing probability curves.
        """
        if not trades_pnl:
            return {"median": [], "percentile_10": [], "percentile_90": []}
            
        sim_paths = []
        for _ in range(n_simulations):
            # Bootstrap sample from historical trades
            sample = np.random.choice(trades_pnl, size=n_days, replace=True)
            path = np.cumsum(sample)
            sim_paths.append(path)
            
        sim_paths_arr = np.array(sim_paths)
        
        # Calculate percentiles at each step
        steps = list(range(1, n_days + 1))
        p10 = np.percentile(sim_paths_arr, 10, axis=0).tolist()
        p50 = np.percentile(sim_paths_arr, 50, axis=0).tolist()
        p90 = np.percentile(sim_paths_arr, 90, axis=0).tolist()
        
        return {
            "steps": steps,
            "percentile_10": [round(val, 2) for val in p10],
            "median": [round(val, 2) for val in p50],
            "percentile_90": [round(val, 2) for val in p90]
        }

    @staticmethod
    def calculate_heatmaps(trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Groups trades to compile monthly, daily, and hourly PnL heatmaps.
        """
        if not trades:
            return {"monthly": {}, "daily": {}, "hourly": {}}
            
        df = pd.DataFrame(trades)
        df["entry_time"] = pd.to_datetime(df["entry_time"])
        
        # Monthly Heatmap
        df["month"] = df["entry_time"].dt.strftime("%Y-%m")
        monthly = df.groupby("month")["pnl"].sum().to_dict()
        
        # Daily Heatmap (Day of week: Mon=0, Sun=6)
        df["day_name"] = df["entry_time"].dt.day_name()
        daily = df.groupby("day_name")["pnl"].sum().to_dict()
        
        # Hourly Heatmap (Hour of day: 9, 10, 11, etc.)
        df["hour"] = df["entry_time"].dt.hour
        hourly = df.groupby("hour")["pnl"].sum().to_dict()
        
        return {
            "monthly": {k: round(v, 2) for k, v in monthly.items()},
            "daily": {k: round(v, 2) for k, v in daily.items()},
            "hourly": {k: round(v, 2) for k, v in hourly.items()}
        }

    @staticmethod
    def calculate_distributions(trades_pnl: List[float]) -> Dict[str, Any]:
        """
        Compiles bin metrics for win/loss and risk-reward histograms.
        """
        if not trades_pnl:
            return {"bins": [], "counts": []}
            
        counts, bins = np.histogram(trades_pnl, bins=10)
        
        return {
            "bins": [round(b, 2) for b in bins.tolist()],
            "counts": counts.tolist()
        }
