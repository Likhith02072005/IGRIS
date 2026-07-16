from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import pandas as pd
from app.brokers import get_broker_adapter
from app.backtest.engine import BacktestEngine
from app.analytics.metrics import AnalyticsEngine
from app.ai.regime import MarketRegimeDetector
from app.core.config import settings

# Enterprise extensions
from app.core.event_bus import event_bus
from app.core.plugin_manager import plugin_manager
from app.core.strategy_loader import StrategySandboxLoader
from app.risk.engine import risk_engine
from app.analytics.portfolio_optimizer import PortfolioOptimizer
from app.backtest.validation import WalkForwardValidator
from app.backtest.monte_carlo import MonteCarloSimulator
from app.ai.copilot import AICopilot
from app.core.warehouse import data_warehouse
from app.core.notifications import NotificationEngine
from app.market_data.service import market_data_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="IGRIS Algorithmic Execution and Quant Engine.",
    version="1.1.0"
)

# Startup event triggers background tasks
@app.on_event("startup")
def startup_event():
    market_data_service.start()

@app.on_event("shutdown")
def shutdown_event():
    market_data_service.stop()

# Request Models
class ConnectRequest(BaseModel):
    broker: str
    credentials: Dict[str, Any]

class OrderRequest(BaseModel):
    broker: str
    credentials: Dict[str, Any]
    symbol: str
    direction: str = Field(..., description="BUY or SELL")
    qty: int = Field(..., gt=0)
    order_type: str = Field(..., description="MARKET, LIMIT, SL-M, SL-L")
    price: Optional[float] = None
    trigger_price: Optional[float] = None

class CancelRequest(BaseModel):
    broker: str
    credentials: Dict[str, Any]
    order_id: str

class BacktestRequest(BaseModel):
    strategy_name: str
    params: Dict[str, Any] = Field(default_factory=dict)
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: str = Field(..., description="YYYY-MM-DD")
    initial_capital: float = 100000.0
    slippage: float = 0.5
    brokerage: float = 20.0
    symbol: str = "NIFTY"
    timeframe: str = "15m"

class MonteCarloRequest(BaseModel):
    trades_pnl: List[float]
    simulations: int = 1000
    capital: float = 100000.0

class HeatmapRequest(BaseModel):
    trades: List[Dict[str, Any]]

class RegimeRequest(BaseModel):
    symbol: str = "NIFTY"
    timeframe: str = "15m"
    start_date: str = "2026-07-01"
    end_date: str = "2026-07-15"

class OptimizeRequest(BaseModel):
    returns: Dict[str, List[float]]
    capital: float = 100000.0

class CopilotRequest(BaseModel):
    query: str

class InstallPluginRequest(BaseModel):
    category: str
    name: str
    files: Dict[str, str]
    metadata: Dict[str, Any]

# Endpoints
@app.get("/health")
def health_check():
    return {
        "status": "online", 
        "engine": settings.PROJECT_NAME, 
        "version": "1.1.0",
        "kill_switch": risk_engine.kill_switch_active
    }

@app.post("/broker/connect")
def connect_broker(req: ConnectRequest):
    try:
        adapter = get_broker_adapter(req.broker)
        success = adapter.connect(req.credentials)
        if success:
            event_bus.publish("BrokerReconnected", {"broker": req.broker})
            # Hook websocket connection as well
            market_data_service.connect_broker_feed(req.broker, req.credentials, ["NIFTY26JUL24300CE"])
            return {"status": "CONNECTED", "broker": req.broker}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to authenticate with {req.broker}.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/order")
def place_broker_order(req: OrderRequest):
    try:
        # Pre-execution Risk Check
        risk_res = risk_engine.validate_order(
            order={"qty": req.qty, "margin_required": req.qty * 100},
            risk_profile={"max_daily_loss": 5000.0, "max_portfolio_heat": 70.0, "max_position_qty": 1000},
            stats={"daily_loss": 0, "portfolio_heat": 20.0, "available_capital": 100000.0}
        )
        if not risk_res["approved"]:
            event_bus.publish("OrderRejected", {"symbol": req.symbol, "reason": risk_res["reason"]})
            return {"status": "REJECTED_BY_RISK", "reason": risk_res["reason"]}

        event_bus.publish("OrderPlaced", {"symbol": req.symbol, "direction": req.direction, "qty": req.qty})
        
        adapter = get_broker_adapter(req.broker)
        if not adapter.connect(req.credentials):
            raise HTTPException(status_code=401, detail="Broker connection failed during order execution.")
        
        res = adapter.place_order(
            symbol=req.symbol,
            direction=req.direction,
            qty=req.qty,
            order_type=req.order_type,
            price=req.price,
            trigger_price=req.trigger_price
        )
        
        event_bus.publish("OrderFilled", {"symbol": req.symbol, "order_id": res.get("order_id")})
        # Log to warehouse
        data_warehouse.log_record("OrderExecution", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/engine/backtest")
def run_backtest(req: BacktestRequest):
    try:
        engine = BacktestEngine(
            strategy_name=req.strategy_name,
            params=req.params,
            start_date=req.start_date,
            end_date=req.end_date,
            initial_capital=req.initial_capital,
            slippage=req.slippage,
            brokerage=req.brokerage
        )
        results = engine.run(symbol=req.symbol, timeframe=req.timeframe)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/engine/analytics/monte-carlo")
def run_monte_carlo_analysis(req: MonteCarloRequest):
    try:
        results = MonteCarloSimulator.run_simulations(
            trades_pnl=req.trades_pnl,
            initial_capital=req.capital
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/engine/analytics/portfolio-optimize")
def run_portfolio_optimization(req: OptimizeRequest):
    try:
        results = PortfolioOptimizer.optimize(req.returns, req.capital)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/engine/ai/copilot")
def query_ai_copilot(req: CopilotRequest):
    try:
        res = AICopilot.query(req.query)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/engine/plugins")
def list_plugins(category: Optional[str] = None):
    return {"plugins": plugin_manager.list_plugins(category)}

@app.post("/engine/plugins/install")
def install_plugin(req: InstallPluginRequest):
    success = plugin_manager.install_plugin(req.category, req.name, req.files, req.metadata)
    return {"success": success}

@app.post("/engine/risk/kill-switch")
def toggle_kill_switch():
    risk_engine.kill_switch_active = not risk_engine.kill_switch_active
    NotificationEngine.broadcast_alert("KILL_SWITCH_TOGGLED", {"active": risk_engine.kill_switch_active})
    return {"kill_switch_active": risk_engine.kill_switch_active}
