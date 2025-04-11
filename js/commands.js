// --- START FILE: js/commands.js --- (Add neofetch, ensure others are present)
// Note: Assumes 'game' object is globally available from game.js
// Note: Assumes 'displayOutput' is globally available from utils.js

const standardCommands = {
    help: () => {
        const availableStdCmds = Object.keys(standardCommands)
                                      .filter(cmd => cmd !== 'startgame') // Don't list startgame twice
                                      .sort()
                                      .join(', ');
        let helpText = `Standard Commands:\n  ${availableStdCmds}\n\n`;
        if (game.isActive()) {
             helpText += "Game is active. Type 'gamehelp' for adventure commands.";
        } else {
             helpText += "Type 'startgame' to begin the adventure.";
        }
        return helpText;
    },
    clear: () => {
        // Ensure outputElement is accessible (it should be global via utils.js)
        if (typeof outputElement !== 'undefined') {
            outputElement.innerHTML = '';
        } else {
            console.error("Output element not found for clear command.");
        }
        return ''; // No output message for clear
    },
    date: () => new Date().toString(),
    echo: (args) => args.join(' '),
    whoami: () => 'guest',
        motd: () => `
██╗    ██╗███████╗██████╗       ████████╗███████╗███████╗███╗   ███╗
██║    ██║██╔════╝██╔══██╗      ╚══██╔══╝██╔════╝██╔══██║████╗ ████║
██║ █╗ ██║█████╗  ██████╔╝         ██║   █████╗  ██████╔╝██╔████╔██║
██║███╗██║██╔══╝  ██╔══██╗         ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
╚███╔███╔╝███████╗██████╔╝         ██║   ███████╗██║  ██╗██║ ╚═╝ ██║
 ╚══╝╚══╝ ╚══════╝╚═════╝          ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝

Welcome to WebTerm Adventure!
Type 'help' for standard commands.
Type 'startgame' to begin your adventure...
`,
    theme: (args) => {
        const themeName = args[0]?.toLowerCase();
        if (themeName === 'light') {
            document.body.classList.add('light-theme');
            return 'Theme set to light.';
        } else if (themeName === 'dark') {
            document.body.classList.remove('light-theme');
            return 'Theme set to dark.';
        } else if (themeName === 'toggle') {
            document.body.classList.toggle('light-theme');
            return `Theme toggled to ${document.body.classList.contains('light-theme') ? 'light' : 'dark'}.`;
        } else {
             return `Usage: theme [light|dark|toggle]\nCurrent theme: ${document.body.classList.contains('light-theme') ? 'light' : 'dark'}`;
        }
    },

    // --- ADDING NEOFETCH BACK ---
    neofetch: () => {
        // Use getGpuInfo from utils.js
        const gpu = typeof getGpuInfo === 'function' ? getGpuInfo() : 'N/A';
        // Basic uptime calculation
        const uptimeSeconds = Math.floor(performance.now() / 1000);
        const uptimeMinutes = Math.floor(uptimeSeconds / 60);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        const uptimeString = `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;

        // Use optional chaining for userAgentData
        const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown OS';
        const browserBrand = navigator.userAgentData?.brands?.find(b => b.brand !== "Not A;Brand")?.brand || 'Unknown Browser';
        const browserVersion = navigator.userAgentData?.brands?.find(b => b.brand !== "Not A;Brand")?.version || '';

        // Use optional chaining for memory
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'N/A';

        // Get theme dynamically
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';

        // ASCII Art (Simple Terminal Icon)
        const ascii = `
        .--.
       |o_o |
       |:_/ |
      //   \\ \\
     (|     | )
    /'\\_   _/ \`\\
    \\___)=(___/
        `;

        // Combine info - use pre-wrap for formatting in displayOutput
        const info = `
${''.padStart(16)} <span style="color: var(--prompt-color);">guest@web-term</span>
${''.padStart(16)} <span style="color: var(--output-color);">------------</span>
${'OS:'.padStart(15)} ${platform} (${browserBrand} ${browserVersion})
${'Host:'.padStart(15)} Your Device
${'Kernel:'.padStart(15)} Browser Runtime Environment
${'Uptime:'.padStart(15)} ${uptimeString}
${'Shell:'.padStart(15)} WebTerm Adventure
${'Resolution:'.padStart(15)} ${window.screen.width}x${window.screen.height}
${'Theme:'.padStart(15)} ${currentTheme}
${'CPU:'.padStart(15)} ${navigator.hardwareConcurrency || 'N/A'} Cores
${'Memory:'.padStart(15)} ${memory}
${'GPU:'.padStart(15)} ${gpu || 'N/A'}
        `;

        // Combine ASCII and info side-by-side (requires careful formatting)
        const asciiLines = ascii.trim().split('\n');
        const infoLines = info.trim().split('\n');
        const maxLines = Math.max(asciiLines.length, infoLines.length);
        let combinedOutput = "";

        for (let i = 0; i < maxLines; i++) {
            const asciiLine = (asciiLines[i] || '').padEnd(18); // Adjust padding as needed
            const infoLine = infoLines[i] || '';
            combinedOutput += `${asciiLine} ${infoLine}\n`;
        }

        // Return the combined string, utils.js will handle displaying it with HTML
        return combinedOutput;
    },


    // --- Game Control Command ---
    startgame: () => {
        // Ensure game object is available
        if (typeof game === 'undefined' || !game) {
            console.error("Game object not found when trying to start game.");
            return "Error: Game module not loaded correctly.";
        }
        if (game.isActive()) {
            return "You are already in the game! Type 'quitgame' to exit.";
        }
        game.start(); // Initialize and start the game defined in game.js
        // Game start message is handled by game.start() itself
        return ""; // Return empty as game.start() handles its own output
    },

}; // End of standardCommands object


// This function will be called by main.js to process standard commands
function handleStandardCommand(command, args) {
    const cmd = command.toLowerCase(); // Ensure command is lower case for lookup

    if (standardCommands[cmd]) {
        try {
            const result = standardCommands[cmd](args);

            if (result !== undefined && result !== null && result !== '') { // Check if there is meaningful output
                // Special handling for commands that return pre-formatted HTML/text
                 if (cmd === 'motd') {
                     displayOutput(result, 'motd'); // Use motd class
                 } else if (cmd === 'neofetch') {
                     displayOutput(result, 'neofetch-output'); // Use specific class for potential pre-wrap
                 }
                  else {
                    // Default output for simple string results
                    displayOutput(result);
                 }
            }
            // If result is empty/null/undefined, do nothing (like 'clear')

        } catch (error) {
            console.error(`Error executing command "${cmd}":`, error);
            // Use displayOutput for user feedback
            displayOutput(`Error executing command: ${cmd}. Check console (F12) for details.`, 'error-line');
        }
    } else {
        // Use displayOutput for user feedback
        displayOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error-line');
    }
}

// --- Debug log to confirm execution ---
console.log("Commands.js finished executing.");
// --- END FILE: js/commands.js ---
