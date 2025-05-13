# SD WebUI Resolution Presets

A very simple extension for Stable Diffusion WebUI that adds buttons to save and load resolution presets.


![capture](https://github.com/user-attachments/assets/c7fd1712-c38e-4711-bdd8-1bd608c7647e)


## Features

- Save the current resolution as a preset with a single click
- Automatically **saves up to 8** most recent presets
- Presets are displayed as buttons below the width/height sliders
- Click a preset button to instantly apply that resolution
- Presets are saved in your browser's localStorage

## Installation

1. Clone this repository into your SD WebUI `extensions` folder:

 `git clone https://github.com/otacoo/sd-webui-resolution-presets`

2. Restart SD WebUI

## Usage

1. Set your desired width and height in the txt2img tab
2. Click the 💾 button next to the width/height sliders to save the current resolution
3. Your saved presets will appear as buttons below the sliders
4. Click any preset button to apply that resolution

## Notes

- Presets are saved in your browser's localStorage, not on the server
- A maximum of 8 presets are saved (oldest ones are removed automatically)
- Presets are specific to the browser you're using
