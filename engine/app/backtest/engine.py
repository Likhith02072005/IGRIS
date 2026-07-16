import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple

# Ensure we can load strategies relative to root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from strategies import load_strategy

class BacktestEngine:
    """
    High-Fidelity Intraday & Interday Backtesting Engine.
    Executes strategy logic candle-by-candle and aggregates performance analytics.
    """
    def __init__(
        self,
        strategy_name: str,
        params: Dict[str, Any],
        start_date: str,
        end_date: str,
        initial_capital: float = 100000.0,
        slippage: float = 0.5,     # Points slippage per trade
        brokerage: float = 20.0,    # Flat brokerage charge per trade
    ):
        self.strategy_name = strategy_name
        self.params = params
        self.start_date = datetime.strptime(start_date, "%Y-%m-%d")
        self.end_date = datetime.strptime(end_date, "%Y-%m-%d")
        self.capital = initial_capital
        self.slippage = slippage
        self.brokerage = brokerage
        
        # Load strategy
        self.strategy = load_strategy(strategy_name, params)
        
        # Output containers
        self.trades: List[Dict[str, Any]] = []
        self.equity_curve: List[Dict[str, Any]] = []
        
    def generate_synthetic_data(self, symbol: str, timeframe: str) -> pd.DataFrame:
        """
        Generates realistic synthetic financial candle timeseries if database data is missing.
        """
        print(f"Generating synthetic historical candles for {symbol} ({timeframe})...")
        
        # Timeframe mappings to minutes
        tf_map = {"1m": 1, "3m": 3, "5m": 5, "15m": 15, "30m": 30, "1h": 60, "1d": 1440}
        minutes_per_bar = tf_map.get(timeframe, 15)
        
        current_time = self.start_date.replace(hour=9, minute=15, second=0)
        end_time = self.end_date.replace(hour=15, minute=30, second=0)
        
        timestamps = []
        while current_time <= end_time:
            # Only include market hours (09:15 to 15:30) on weekdays
            if current_time.weekday() < 5 and 9 <= current_time.hour <= 15:
                if not (current_time.hour == 15 and current_time.minute > 30) and not (current_time.hour == 9 and current_time.minute < 15):
                    timestamps.append(current_time)
            
            # Increment time
            if minutes_per_bar == 1440:
                current_time += timedelta(days=1)
            else:
                current_time += timedelta(minutes=minutes_per_bar)
                if current_time.hour >= 16:
                    current_time = (current_time + timedelta(days=1)).replace(hour=9, minute=15)
                    
        # Simulate price path using geometric brownian motion
        n_bars = len(timestamps)
        if n_bars == 0:
            n_bars = 100
            timestamps = [self.start_date + timedelta(hours=i) for i in range(n_bars)]
            
        prices = np.zeros(n_bars)
        prices[0] = 24000.0 if "NIFTY" in symbol.upper() else 52000.0 if "BANK" in symbol.upper() else 1000.0
        
        # Random steps
        mu = 0.0001
        sigma = 0.0015
        for i in range(1, n_bars):
            # Reset daily price drift at market opening
            if timestamps[i].hour == 9 and timestamps[i].minute == 15:
                # Add gap opening simulation
                gap = np.random.normal(0, 0.005)
                prices[i] = prices[i-1] * (1 + gap)
            else:
                pct_change = np.random.normal(mu, sigma)
                prices[i] = prices[i-1] * (1 + pct_change)
                
        # Formulate candles (OHLC)
        df = pd.DataFrame(index=timestamps)
        df["time"] = timestamps
        df["close"] = prices
        df["open"] = df["close"].shift(1).fillna(prices[0])
        
        # Generate highs and lows based on drift spreads
        high_spread = np.abs(np.random.normal(0.001, 0.0008, n_bars))
        low_spread = np.abs(np.random.normal(0.001, 0.0008, n_bars))
        
        df["high"] = df[["open", "close"]].max(axis=1) * (1 + high_spread)
        df["low"] = df[["open", "close"]].min(axis=1) * (1 - low_spread)
        df["volume"] = np.random.randint(1000, 50000, n_bars)
        
        return df.reset_index(drop=True)

    def run(self, symbol: str = "NIFTY", timeframe: str = "15m") -> Dict[str, Any]:
        """
        Executes historical backtest.
        """
        # 1. Load data
        df = self.generate_synthetic_data(symbol, timeframe)
        
        # 2. Add indicators
        df = self.strategy.calculate_indicators(df)
        
        # 3. Simulate Loop
        active_position: Optional[Dict[str, Any]] = None
        current_equity = self.capital
        self.equity_curve.append({"time": df.iloc[0]["time"].isoformat(), "equity": current_equity})
        
        for idx in range(len(df)):
            row = df.iloc[idx]
            sub_df = df.iloc[:idx+1]
            
            # Check exit first if in a position
            if active_position is not None:
                should_exit, reason = self.strategy.check_exit(active_position, row)
                if should_exit:
                    # Close trade
                    exit_price = row["close"]
                    # Apply slippage
                    mult = 1 if active_position["direction"] == "BUY" else -1
                    actual_exit_price = exit_price - (self.slippage * mult)
                    
                    pnl = (actual_exit_price - active_position["entry_price"]) * active_position["qty"] * mult
                    # Subtract flat broker charges
                    pnl -= self.brokerage
                    
                    current_equity += pnl
                    
                    # Store trade logs
                    trade_record = {
                        "id": f"T_{len(self.trades) + 1}",
                        "symbol": symbol,
                        "direction": active_position["direction"],
                        "qty": active_position["qty"],
                        "entry_time": active_position["entry_time"].isoformat(),
                        "exit_time": row["time"].isoformat(),
                        "entry_price": active_position["entry_price"],
                        "exit_price": actual_exit_price,
                        "pnl": round(pnl, 2),
                        "exit_reason": reason,
                        "capital_after": round(current_equity, 2)
                    }
                    self.trades.append(trade_record)
                    active_position = None
                    self.equity_curve.append({"time": row["time"].isoformat(), "equity": round(current_equity, 2)})
                    continue

            # Check entry if no active position
            if active_position is None:
                signal, message = self.strategy.on_candle(sub_df)
                if signal in ["BUY", "SELL"]:
                    # Determine position sizing (lot multiplier)
                    qty = int(self.strategy.position_size * 50)  # assume lot size 50
                    entry_price = row["close"]
                    # Apply entry slippage
                    mult = 1 if signal == "BUY" else -1
                    actual_entry_price = entry_price + (self.slippage * mult)
                    
                    active_position = {
                        "direction": signal,
                        "qty": qty,
                        "entry_price": actual_entry_price,
                        "entry_time": row["time"]
                    }
                    
            # Record current equity at end of bar
            if idx % 10 == 0 or idx == len(df) - 1:
                self.equity_curve.append({"time": row["time"].isoformat(), "equity": round(current_equity, 2)})

        # Compute summary metrics
        metrics = self.compute_metrics(initial_capital=self.capital, final_equity=current_equity)
        
        return {
            "strategy": self.strategy_name,
            "metrics": metrics,
            "trades": self.trades,
            "equity_curve": self.equity_curve
        }

    def compute_metrics(self, initial_capital: float, final_equity: float) -> Dict[str, Any]:
        """
        Calculate Sortino, Sharpe, Calmar, Max Drawdown, Profit Factors, and expectancies.
        """
        pnl_values = [t["pnl"] for t in self.trades]
        n_trades = len(pnl_values)
        
        if n_trades == 0:
            return {
                "net_profit": 0.0,
                "win_rate": 0.0,
                "drawdown": 0.0,
                "profit_factor": 0.0,
                "sharpe": 0.0,
                "sortino": 0.0,
                "calmar": 0.0,
                "expectancy": 0.0,
                "trade_count": 0
            }
            
        win_trades = [p for p in pnl_values if p > 0]
        loss_trades = [p for p in pnl_values if p <= 0]
        
        win_count = len(win_trades)
        win_rate = (win_count / n_trades) * 100
        
        gross_profit = sum(win_trades)
        gross_loss = abs(sum(loss_trades))
        profit_factor = gross_profit / (gross_loss + 1e-9)
        
        avg_win = np.mean(win_trades) if win_count > 0 else 0.0
        avg_loss = np.mean(loss_trades) if len(loss_trades) > 0 else 0.0
        expectancy = (win_rate / 100 * avg_win) + ((100 - win_rate) / 100 * avg_loss)
        
        # Calculate Drawdowns
        equity_series = [initial_capital]
        curr = initial_capital
        for p in pnl_values:
            curr += p
            equity_series.append(curr)
            
        peaks = np.maximum.accumulate(equity_series)
        drawdowns = (peaks - equity_series) / (peaks + 1e-9) * 100
        max_drawdown = float(np.max(drawdowns))
        
        # Returns standard deviations for Sharpe / Sortino
        returns = np.diff(equity_series) / equity_series[:-1]
        mean_return = np.mean(returns) if len(returns) > 0 else 0.0
        std_return = np.std(returns) if len(returns) > 1 else 1e-9
        
        # Annualized values (assumes 252 trading sessions)
        sharpe = (mean_return / (std_return + 1e-9)) * np.sqrt(252)
        
        neg_returns = returns[returns < 0]
        std_neg_return = np.std(neg_returns) if len(neg_returns) > 1 else 1e-9
        sortino = (mean_return / (std_neg_return + 1e-9)) * np.sqrt(252)
        
        calmar = (mean_return * 252) / (max_drawdown / 100 + 1e-9)
        
        # Streaks
        win_streaks = []
        loss_streaks = []
        curr_win = 0
        curr_loss = 0
        for p in pnl_values:
            if p > 0:
                curr_win += 1
                if curr_loss > 0:
                    loss_streaks.append(curr_loss)
                    curr_loss = 0
            else:
                curr_loss += 1
                if curr_win > 0:
                    win_streaks.append(curr_win)
                    curr_win = 0
        if curr_win > 0: win_streaks.append(curr_win)
        if curr_loss > 0: loss_streaks.append(curr_loss)
        
        longest_win_streak = max(win_streaks) if win_streaks else 0
        longest_loss_streak = max(loss_streaks) if loss_streaks else 0

        return {
            "net_profit": round(final_equity - initial_capital, 2),
            "win_rate": round(win_rate, 2),
            "drawdown": round(max_drawdown, 2),
            "profit_factor": round(profit_factor, 2),
            "sharpe": round(sharpe, 2),
            "sortino": round(sortino, 2),
            "calmar": round(calmar, 2),
            "expectancy": round(expectancy, 2),
            "trade_count": n_trades,
            "avg_win": round(avg_win, 2),
            "avg_loss": round(avg_loss, 2),
            "longest_win_streak": longest_win_streak,
            "longest_loss_streak": longest_loss_streak
        }
# Simple CLI entry support to run backtests directly
if __name__ == "__main__":
    # Test execution
    engine = BacktestEngine("ASTRA", {}, "2026-07-01", "2026-07-15")
    res = engine.run()
    print("Test run completed. Metrics:")
    print(res["metrics"])
