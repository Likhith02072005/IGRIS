import random
import numpy as np
from typing import Dict, Any, List

class MonteCarloSimulator:
    """
    Monte Carlo Simulation Engine for Backtest Robustness Testing.
    Simulates latency spikes, skipped entries, and slippage variations.
    """
    
    @staticmethod
    def run_simulations(
        trades_pnl: List[float],
        initial_capital: float = 100000.0,
        n_simulations: int = 1000,
        skip_probability: float = 0.05,
        slip_deviation: float = 0.1
    ) -> Dict[str, Any]:
        """
        Shuffles trades, applies random slippages, and calculates confidence distribution bands.
        """
        if not trades_pnl:
            return {"error": "NO_TRADES_PROVIDED"}
            
        simulated_curves = []
        max_drawdowns = []
        final_returns = []
        
        n_trades = len(trades_pnl)
        
        for _ in range(n_simulations):
            capital = initial_capital
            peak = initial_capital
            max_dd = 0.0
            
            # Shuffle order to simulate different market sequences
            shuffled = list(trades_pnl)
            random.shuffle(shuffled)
            
            for pnl in shuffled:
                # 1. Randomly skip trades (system disconnect simulation)
                if random.random() < skip_probability:
                    continue
                    
                # 2. Add random slippage / commission drift
                slippage_drift = random.normalvariate(0.0, slip_deviation) * abs(pnl)
                adjusted_pnl = pnl - slippage_drift
                
                capital += adjusted_pnl
                
                # Drawdown calculations
                if capital > peak:
                    peak = capital
                dd = (peak - capital) / peak * 100
                if dd > max_dd:
                    max_dd = dd
                    
            final_returns.append(round(((capital - initial_capital) / initial_capital) * 100, 2))
            max_drawdowns.append(round(max_dd, 2))
            
        # Calculate Percentiles
        final_returns = np.array(final_returns)
        max_drawdowns = np.array(max_drawdowns)
        
        return {
            "simulations_run": n_simulations,
            "confidence_intervals": {
                "p95": float(np.percentile(final_returns, 95)), # Best Case
                "p50": float(np.percentile(final_returns, 50)), # Median Case
                "p5": float(np.percentile(final_returns, 55)),  # Conservative/Worst Case
            },
            "drawdown_distribution": {
                "p95_worst": float(np.percentile(max_drawdowns, 95)),
                "p50_median": float(np.percentile(max_drawdowns, 50)),
                "p5_best": float(np.percentile(max_drawdowns, 5)),
            },
            "expected_return_pct": float(np.mean(final_returns)),
            "worst_case_drawdown_pct": float(np.max(max_drawdowns))
        }
