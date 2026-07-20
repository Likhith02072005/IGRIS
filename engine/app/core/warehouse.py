import os
import json
import time
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class DataWarehouse:
    """
    Enterprise Data Warehouse Service.
    Asynchronously records ticks, signals, orders, and system logs to audit files.
    """
    def __init__(self, data_dir: str = "/app/warehouse"):
        if os.getenv("VERCEL") == "1":
            self.data_dir = "/tmp/warehouse"
        elif not os.path.exists(data_dir):
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
            self.data_dir = os.path.join(base_dir, "warehouse")
        else:
            self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.log_file = os.path.join(self.data_dir, "audit_trail.jsonl")

    def log_record(self, event_type: str, payload: Dict[str, Any]):
        """
        Appends an event record to the warehouse ledger.
        """
        record = {
            "timestamp": time.time(),
            "event_type": event_type,
            "payload": payload
        }
        try:
            with open(self.log_file, "a") as f:
                f.write(json.dumps(record) + "\n")
        except Exception as e:
            logger.error(f"Failed to write record to Data Warehouse: {e}")

# Global Warehouse instance
data_warehouse = DataWarehouse()
