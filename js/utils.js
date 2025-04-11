// --- START FILE: js/utils.js --- (Updated allowedHtmlClasses AGAIN)
const outputElement = document.getElementById('output');
const terminalElement = document.getElementById('terminal');

/**
 * Displays a message in the terminal output area.
 * @param {string} text - The text to display.
 * @param {string} [className='output-line'] - The CSS class to apply to the line.
 */
function displayOutput(text, className = 'output-line') {
    const line = document.createElement('div');
    line.className = className;

    // Basic sanitization - prevent direct HTML injection
    // We allow specific classes to use innerHTML for intended formatting
    // ADDED 'game-item' to this list
    const allowedHtmlClasses = ['game-room-desc', 'game-story', 'motd', 'neofetch-output', 'game-info', 'game-item'];
    if (allowedHtmlClasses.includes(className)) {
        // Very basic sanitation for allowed HTML (replace script tags)
        line.innerHTML = text.replace(/<script.*?>.*?<\/script>/gi, '');
    } else {
        line.textContent = text;
    }

    // Check if outputElement exists before appending
    if (outputElement) {
        outputElement.appendChild(line);
        scrollToBottom();
    } else {
        console.error("Cannot display output, outputElement not found.");
    }
}

/**
 * Displays the command echo in the terminal.
 * @param {string} command - The command that was entered.
 * @param {string} currentPrompt - The prompt string at the time.
 */
function displayCommandEcho(command, currentPrompt) {
    const line = document.createElement('div');
    line.className = 'command-echo';
    // Sanitize displayed command
    const sanitizedCommand = command.replace(/</g, "<").replace(/>/g, ">"); // Use proper entities
    line.innerHTML = `<span class="prompt">${currentPrompt}</span> ${sanitizedCommand}`;
    if (outputElement) {
        outputElement.appendChild(line);
    } else {
        console.error("Cannot display echo, outputElement not found.");
    }
}


/**
 * Scrolls the terminal view to the bottom.
 */
function scrollToBottom() {
    // Check if terminalElement exists
    if (terminalElement) {
        terminalElement.scrollTop = terminalElement.scrollHeight;
    } else {
        console.error("Cannot scroll, terminalElement not found.");
    }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Tries to get GPU information using WebGL. Experimental.
 * @returns {string | null} GPU renderer string or null.
 */
function getGpuInfo() {
    try {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px';
        document.body.appendChild(canvas);

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        let gpuInfo = null;
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
        document.body.removeChild(canvas);
        return gpuInfo;
    } catch (e) {
         console.warn("Could not get GPU info:", e);
    }
    return null;
}
// --- END FILE: js/utils.js ---
