import os
from pathlib import Path
from modules import script_callbacks
import gradio as gr

"""
SD WebUI Resolution Presets Extension
This extension adds a button to save and load resolution presets in Stable Diffusion WebUI.
All functionality is implemented in JavaScript using localStorage for persistence.
"""

def on_ui_settings():
    """
    Load the JavaScript file and inject into the UI.
    """
    # Get the path to the JavaScript file
    js_path = os.path.join(Path(__file__).parent, "javascript", "resolution_presets.js")
    
    try:
        if os.path.exists(js_path):
            print(f"SD WebUI Resolution Presets: Loading JS from: {js_path}")
            with open(js_path, "r", encoding="utf8") as f:
                js_code = f.read()
            return gr.HTML(f"<script>{js_code}</script>")
        else:
            print(f"SD WebUI Resolution Presets: Warning - JS file not found at {js_path}")
            return gr.HTML("")
    except Exception as e:
        print(f"SD WebUI Resolution Presets: Error loading JavaScript: {e}")
        return gr.HTML("")

# Register the callback to inject JavaScript
script_callbacks.on_ui_settings(on_ui_settings)