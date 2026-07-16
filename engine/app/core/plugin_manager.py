import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class PluginManager:
    """
    Enterprise Plugin manager registry.
    Handles installation, removal, and discovery of modules.
    """
    def __init__(self, plugins_dir: str = "/app/plugins"):
        if not os.path.exists(plugins_dir):
            self.plugins_dir = "/Users/likhith/.gemini/antigravity/scratch/astra-quant-lab/plugins"
        else:
            self.plugins_dir = plugins_dir
        
        self.registry: Dict[str, Dict[str, Any]] = {}
        self._initialize_directories()

    def _initialize_directories(self):
        os.makedirs(self.plugins_dir, exist_ok=True)
        # Scan and preload existing plugin files
        self.reload_registry()

    def reload_registry(self):
        self.registry.clear()
        if not os.path.exists(self.plugins_dir):
            return
            
        for category in ["strategies", "indicators", "risk", "brokers", "analytics", "ai"]:
            cat_path = os.path.join(self.plugins_dir, category)
            os.makedirs(cat_path, exist_ok=True)
            for plugin_name in os.listdir(cat_path):
                plugin_path = os.path.join(cat_path, plugin_name)
                if os.path.isdir(plugin_path):
                    meta_file = os.path.join(plugin_path, "metadata.json")
                    if os.path.exists(meta_file):
                        try:
                            with open(meta_file, "r") as f:
                                meta = json.load(f)
                            plugin_id = f"{category}:{plugin_name}"
                            self.registry[plugin_id] = {
                                "id": plugin_id,
                                "name": meta.get("name", plugin_name),
                                "category": category,
                                "version": meta.get("version", "1.0.0"),
                                "path": plugin_path,
                                "enabled": meta.get("enabled", True)
                            }
                        except Exception as e:
                            logger.error(f"Failed to read plugin metadata: {e}")

    def install_plugin(self, category: str, name: str, files: Dict[str, str], metadata: Dict[str, Any]) -> bool:
        """
        Installs a new plugin dynamically by writing files.
        """
        dest_dir = os.path.join(self.plugins_dir, category, name)
        os.makedirs(dest_dir, exist_ok=True)
        
        # Write metadata.json
        with open(os.path.join(dest_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=4)
            
        # Write source code files
        for filename, content in files.items():
            filepath = os.path.join(dest_dir, filename)
            with open(filepath, "w") as f:
                f.write(content)
                
        self.reload_registry()
        logger.info(f"Successfully installed plugin: {category}/{name}")
        return True

    def remove_plugin(self, category: str, name: str) -> bool:
        """Removes a plugin folder from filesystem."""
        dest_dir = os.path.join(self.plugins_dir, category, name)
        if os.path.exists(dest_dir):
            import shutil
            shutil.rmtree(dest_dir)
            self.reload_registry()
            logger.info(f"Removed plugin: {category}/{name}")
            return True
        return False

    def list_plugins(self, category: str = None) -> List[Dict[str, Any]]:
        self.reload_registry()
        plugins = list(self.registry.values())
        if category:
            return [p for p in plugins if p["category"] == category]
        return plugins

# Global PluginManager instance
plugin_manager = PluginManager()
