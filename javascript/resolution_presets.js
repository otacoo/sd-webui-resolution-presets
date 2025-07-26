function getResPresets() {
    return document.querySelector('gradio-app')?.shadowRoot || document;
}

function injectStyledSaveButton() {
    const switchBtn = getResPresets().getElementById("txt2img_res_switch_btn");
    if (!switchBtn) return;

    // Avoid duplicate
    if (getResPresets().getElementById("txt2img_save_res_preset_btn")) return;

    // Clone the switch button to get all Svelte/Gradio classes
    const saveBtn = switchBtn.cloneNode(true);
    saveBtn.id = "txt2img_save_res_preset_btn";
    saveBtn.title = "Save this resolution as preset";
    saveBtn.textContent = "💾";

    // Insert after the switch button
    switchBtn.parentElement.appendChild(saveBtn);

    saveBtn.onclick = function () {
        console.log("Save button clicked!");

        // Get width input
        const widthInput = getResPresets().querySelector('#txt2img_width input[data-testid="number-input"]');
        // Get height input
        const heightInput = getResPresets().querySelector('#txt2img_height input[data-testid="number-input"]');

        console.log("Width input:", widthInput);
        console.log("Height input:", heightInput);

        if (!widthInput || !heightInput) {
            console.log("Width or height input not found.");
            return;
        }

        // Get their values
        const width = widthInput.value || widthInput.getAttribute("value");
        const height = heightInput.value || heightInput.getAttribute("value");

        console.log("Width:", width, "Height:", height);

        if (!width || !height) {
            console.log("Width or height is missing.");
            return;
        }
        saveResolutionPreset(width, height);
    };
}

// Function to save resolution preset using localStorage
function saveResolutionPreset(width, height) {
    console.log(`Saving resolution preset: ${width}x${height}`);
    
    // Get existing presets from localStorage
    let presets = [];
    try {
        const savedPresets = localStorage.getItem('sd-resolution-presets');
        if (savedPresets) {
            presets = JSON.parse(savedPresets);
        }
    } catch (e) {
        console.error("Error loading presets from localStorage:", e);
    }
    
    // Add new preset if it doesn't exist
    const newPreset = {width: parseInt(width), height: parseInt(height)};
    const exists = presets.some(p => p.width === newPreset.width && p.height === newPreset.height);
    
    if (!exists) {
        // Limit to 10 presets - remove oldest if needed
        if (presets.length >= 10) {
            const oldestPreset = presets.shift(); // Remove the oldest preset (first in array)
            
            // Also remove the oldest button from the UI
            if (oldestPreset) {
                const oldestPresetId = `preset_${oldestPreset.width}x${oldestPreset.height}`;
                const oldestButton = getResPresets().getElementById(oldestPresetId);
                if (oldestButton) {
                    oldestButton.remove();
                }
            }
        }
        
        presets.push(newPreset);
        localStorage.setItem('sd-resolution-presets', JSON.stringify(presets));
        console.log("Preset saved to localStorage:", presets);
        
        // Update the UI to show the new preset
        addPresetButton(width, height);
    } else {
        console.log("Preset already exists");
    }
}

// Function to add a preset button to the UI
function addPresetButton(width, height) {
    // Find or create the container for preset buttons
    let container = getResPresets().getElementById("txt2img_resolution_presets_container");
    
    if (!container) {
        // Create container if it doesn't exist
        container = document.createElement("div");
        container.id = "txt2img_resolution_presets_container";
        container.className = "resolution-presets-container";
        container.style.display = "flex";
        container.style.flexWrap = "wrap";
        container.style.gap = "5px";
        container.style.marginTop = "8px";
        container.style.marginBottom = "8px";
        container.style.width = "100%";
        
        // Find a good place to insert it - after the row with width/height sliders
        const row = getResPresets().querySelector("#txt2img_column_size")?.closest(".gradio-row");
        if (row) {
            row.parentNode.insertBefore(container, row.nextSibling);
        } else {
            // If we can't find the right place, don't add the button yet
            console.log("Could not find proper location for preset buttons container");
            return;
        }
    }
    
    // Check if this preset button already exists
    const buttonId = `preset_${width}x${height}`;
    if (getResPresets().getElementById(buttonId)) {
        return; // Button already exists
    }
    
    // Find an existing Svelte button to clone its style
    const templateBtn = getResPresets().querySelector(".gradio-button.tool.svelte-cmf5ev");
    
    // Create the preset button
    const btn = document.createElement("button");
    btn.id = buttonId;
    
    // If we found a template button with Svelte classes, copy its classes
    if (templateBtn) {
        btn.className = templateBtn.className;
    } else {
        // Fallback styling
        btn.className = "lg secondary gradio-button tool";
    }
    
    btn.textContent = `${width}x${height}`;
    
    // Apply proper button styling to ensure text fits
    btn.style.margin = "2px";
    btn.style.minWidth = "fit-content"; // Ensure button fits text
    btn.style.padding = "0 10px";       // Add padding for better appearance
    btn.style.flexGrow = "1";           // Allow button to grow
    btn.style.flexBasis = "0";          // Equal width distribution
    btn.style.maxWidth = "100px";       // Limit maximum width
    btn.style.textAlign = "center";     // Center the text
    btn.style.whiteSpace = "nowrap";    // Prevent text wrapping
    
    // Add click handler to apply this resolution
    btn.onclick = function() {
        const widthInput = getResPresets().querySelector('#txt2img_width input[data-testid="number-input"]');
        const heightInput = getResPresets().querySelector('#txt2img_height input[data-testid="number-input"]');
        
        if (widthInput && heightInput) {
            widthInput.value = width;
            heightInput.value = height;
            
            // Trigger change events
            widthInput.dispatchEvent(new Event('input', { bubbles: true }));
            heightInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
    
    // Add to container
    container.appendChild(btn);
}

// Load saved presets from localStorage
function loadSavedPresets() {
    try {
        const savedPresets = localStorage.getItem('sd-resolution-presets');
        if (savedPresets) {
            const presets = JSON.parse(savedPresets);
            
            // Limit to most recent 8 presets
            const recentPresets = presets.slice(-8);
            
            // If we had to trim, update localStorage
            if (recentPresets.length < presets.length) {
                localStorage.setItem('sd-resolution-presets', JSON.stringify(recentPresets));
            }
            
            // Check if we can add buttons now
            const columnSize = getResPresets().querySelector("#txt2img_column_size");
            if (!columnSize) {
                // We're probably not on the txt2img tab, so don't try to add buttons yet
                console.log("Not on txt2img tab, will add preset buttons when tab is active");
                return;
            }
            
            recentPresets.forEach(preset => {
                addPresetButton(preset.width, preset.height);
            });
        }
    } catch (e) {
        console.error("Error loading presets from localStorage:", e);
    }
}

// Safely try to initialize UI elements
function safeInitialize() {
    try {
        injectStyledSaveButton();
        
        // Only try to load presets if we're on the txt2img tab
        if (getResPresets().querySelector("#txt2img_column_size")) {
            loadSavedPresets();
        }
    } catch (e) {
        console.log("Resolution presets initialization deferred:", e);
    }
}

// Observe DOM changes to handle tab switches and UI reloads
const observer = new MutationObserver((mutations) => {
    // Look for changes that might indicate tab switching
    const relevantChanges = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
            return node.id === "txt2img_column_size" || 
                  (node.querySelector && node.querySelector("#txt2img_column_size"));
        });
    });
    
    if (relevantChanges) {
        // Wait a bit for the DOM to stabilize after tab switch
        setTimeout(safeInitialize, 100);
    } else {
        // Always try to inject the save button
        injectStyledSaveButton();
    }
});

// Use a more targeted observation strategy
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// Initial setup with retry mechanism
let retryCount = 0;
const maxRetries = 10;

function initWithRetry() {
    if (retryCount >= maxRetries) return;
    
    try {
        safeInitialize();
    } catch (e) {
        console.log(`Resolution presets initialization attempt ${retryCount + 1} failed:`, e);
        retryCount++;
        setTimeout(initWithRetry, 500); // Retry after 500ms
    }
}

// Start initialization when DOM is ready
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initWithRetry);
} else {
    // DOM already loaded
    initWithRetry();
}

// Also try again when the window is fully loaded
window.addEventListener("load", safeInitialize);
