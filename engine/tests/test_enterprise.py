import unittest
import numpy as np
from app.core.event_bus import event_bus
from app.risk.engine import risk_engine
from app.analytics.portfolio_optimizer import PortfolioOptimizer
from app.backtest.validation import WalkForwardValidator
from app.backtest.monte_carlo import MonteCarloSimulator
from app.ai.copilot import AICopilot

class TestEnterprisePlatformExtensions(unittest.TestCase):
    """
    Test suite verifying the math correctness and event routing
    of the IGRIS enterprise modules.
    """

    def test_event_bus_publish(self):
        try:
            # Test publishing a mock tick event
            stream_id = event_bus.publish("MarketTick", {"symbol": "TEST_TICK", "ltp": 100.0})
            self.assertIsNotNone(stream_id)
        except Exception as e:
            self.skipTest(f"Redis connection refused or offline: {e}")

    def test_risk_engine_sizing_math(self):
        # 1. Test Kelly sizing
        # Win rate 60%, Avg Win 2, Avg Loss 1 -> Kelly fraction should be positive
        kelly_allocation = risk_engine.calculate_kelly_size(
            win_rate=0.6,
            avg_win=2.0,
            avg_loss=1.0,
            capital=100000.0
        )
        self.assertGreater(kelly_allocation, 0.0)
        self.assertLessEqual(kelly_allocation, 30000.0) # Scaled at half-kelly limit (max 30%)

        # 2. Test ATR sizing
        # Capital 100k, risk 1%, ATR 5, multiplier 2 -> Risk amount = 1000. Stop distance = 10. Qty = 100
        atr_qty = risk_engine.calculate_atr_size(
            atr=5.0,
            multiplier=2.0,
            capital=100000.0,
            risk_pct=1.0,
            point_value=1.0
        )
        self.assertEqual(atr_qty, 100)

    def test_portfolio_optimizer_frontier(self):
        # Mock 2 uncorrelated strategy returns series
        np.random.seed(42)
        returns = {
            "strategy_a": list(np.random.normal(0.001, 0.02, 100)),
            "strategy_b": list(np.random.normal(0.0008, 0.015, 100))
        }
        res = PortfolioOptimizer.optimize(returns, capital=100000.0)
        
        self.assertIn("correlation_matrix", res)
        self.assertIn("max_sharpe_portfolio", res)
        self.assertIn("minimum_variance_portfolio", res)
        self.assertGreater(res["diversification_score"], 0.0)

    def test_walk_forward_splits(self):
        import pandas as pd
        dates = pd.date_range(start="2026-07-01", periods=150, freq="h")
        df = pd.DataFrame({"close": np.random.normal(100, 2, 150)}, index=dates)
        
        splits = WalkForwardValidator.split_data(df, n_splits=3, train_ratio=0.7)
        self.assertEqual(len(splits), 3)
        self.assertGreater(len(splits[0]["train"]), 0)
        self.assertGreater(len(splits[0]["test"]), 0)

    def test_monte_carlo_confidence(self):
        # 10 win/loss trades
        trades = [100.0, -50.0, 150.0, -30.0, 200.0, -40.0, 120.0, -60.0, 80.0, -20.0]
        res = MonteCarloSimulator.run_simulations(trades, initial_capital=100000.0, n_simulations=100)
        
        self.assertIn("confidence_intervals", res)
        self.assertIn("drawdown_distribution", res)
        self.assertGreater(res["expected_return_pct"], -100.0)

    def test_ai_copilot_parser(self):
        res = AICopilot.query("Why did Igris lose today?")
        self.assertEqual(res["action"], "RECOMMENDED_FADE_OFFSET")
        self.assertIn("stop_loss_multiplier", res["parameters_suggested"])

if __name__ == "__main__":
    unittest.main()
