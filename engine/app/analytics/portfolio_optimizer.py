import numpy as np
import pandas as pd
from typing import Dict, Any, List

class PortfolioOptimizer:
    """
    Quantitative Portfolio Optimizer Service.
    Treats trading strategies as assets and optimizes allocation curves.
    """
    
    @staticmethod
    def optimize(returns_dict: Dict[str, List[float]], capital: float = 100000.0) -> Dict[str, Any]:
        """
        Calculates correlation matrices, efficient frontiers, and optimization allocations.
        """
        # Ensure we have at least 2 strategies and sufficient data
        strategy_names = list(returns_dict.keys())
        if len(strategy_names) < 2:
            return {
                "error": "INSUFFICIENT_ASSETS",
                "allocation": {name: 100.0 for name in strategy_names}
            }
            
        # 1. Convert returns to DataFrame and calculate Covariance / Correlation
        df = pd.DataFrame(returns_dict)
        corr_matrix = df.corr().fillna(0.0).to_dict()
        cov_matrix = df.cov().fillna(0.0).to_numpy()
        
        # Calculate mean annual returns and volatilities (assuming 252 trading days)
        mean_returns = df.mean().to_numpy() * 252
        volatilities = df.std().to_numpy() * np.sqrt(252)
        
        # 2. Monte Carlo Random Portfolio weight generation to solve Efficient Frontier
        n_portfolios = 1000
        n_assets = len(strategy_names)
        
        best_sharpe = -1.0
        min_vol = 999.0
        
        best_weights = np.ones(n_assets) / n_assets
        min_vol_weights = np.ones(n_assets) / n_assets
        
        for _ in range(n_portfolios):
            weights = np.random.random(n_assets)
            weights /= np.sum(weights)
            
            p_return = np.sum(mean_returns * weights)
            p_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))) * np.sqrt(252)
            
            # Risk free rate assumed to be 5%
            p_sharpe = (p_return - 0.05) / p_vol if p_vol > 0 else 0.0
            
            if p_sharpe > best_sharpe:
                best_sharpe = p_sharpe
                best_weights = weights
                
            if p_vol < min_vol:
                min_vol = p_vol
                min_vol_weights = weights
                
        # 3. Calculate Risk Contributions for Max Sharpe Portfolio
        portfolio_vol = np.sqrt(np.dot(best_weights.T, np.dot(cov_matrix, best_weights)))
        marginal_risk = np.dot(cov_matrix, best_weights) / portfolio_vol if portfolio_vol > 0 else np.zeros(n_assets)
        risk_contribution = (best_weights * marginal_risk) / portfolio_vol if portfolio_vol > 0 else np.zeros(n_assets)
        
        # Calculate Diversification Ratio
        weighted_vol = np.sum(volatilities * best_weights)
        div_score = weighted_vol / portfolio_vol if portfolio_vol > 0 else 1.0

        return {
            "correlation_matrix": corr_matrix,
            "diversification_score": round(float(div_score), 2),
            "max_sharpe_portfolio": {
                "return": round(float(np.sum(mean_returns * best_weights)), 4),
                "volatility": round(float(portfolio_vol), 4),
                "sharpe": round(float(best_sharpe), 2),
                "weights": {strategy_names[i]: round(float(best_weights[i]) * 100, 2) for i in range(n_assets)},
                "capital_allocation": {strategy_names[i]: round(float(best_weights[i]) * capital, 2) for i in range(n_assets)}
            },
            "minimum_variance_portfolio": {
                "return": round(float(np.sum(mean_returns * min_vol_weights)), 4),
                "volatility": round(float(min_vol), 4),
                "weights": {strategy_names[i]: round(float(min_vol_weights[i]) * 100, 2) for i in range(n_assets)},
                "capital_allocation": {strategy_names[i]: round(float(min_vol_weights[i]) * capital, 2) for i in range(n_assets)}
            },
            "risk_contribution": {strategy_names[i]: round(float(risk_contribution[i]) * 100, 2) for i in range(n_assets)}
        }
