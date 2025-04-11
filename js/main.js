// --- START FILE: js/main.js --- (Correct version, same as before)
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    // These are needed by utils.js, but good practice to have them locally if needed
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const promptElement = document.getElementById('prompt');

    let commandHistory = [];
    let historyIndex = -1;

    const processInput = (inputValue) => {
        const commandStr = inputValue.trim();
        // No need to process if empty
        // if (commandStr === '') return; // Keep this commented if you want Enter to redraw prompt

        // Add to history only if it's different from the last command or history is empty
        if (commandHistory.length === 0 || commandHistory[0] !== commandStr) {
             if (commandStr !== '') { // Don't add empty strings to history
                commandHistory.unshift(commandStr);
             }
        }
         // Limit history size (optional)
        if (commandHistory.length > 50) {
             commandHistory.pop();
        }
        historyIndex = -1; // Reset history index after enter

        const currentPrompt = promptElement.textContent;
        // Only display echo for non-empty commands
        if (commandStr !== '') {
             // Use displayCommandEcho from utils.js
             displayCommandEcho(commandStr, currentPrompt);
        }

        // Clear input
        input.value = '';

        // --- Command Dispatch ---
        // Ensure game object and handleStandardCommand function exist before calling
        if (typeof game !== 'undefined' && game.isActive()) {
            // If game is active, pass command to game module
            if (commandStr !== '') { // Don't process empty commands in game either
                 game.processCommand(commandStr);
            } else {
                 // Optional: redraw prompt or do nothing on empty enter in game
                 scrollToBottom(); // Use scrollToBottom from utils.js
            }
        } else {
            // Otherwise, process standard commands
            if (commandStr !== '') {
                const parts = commandStr.split(/\s+/);
                const command = parts[0].toLowerCase();
                const args = parts.slice(1);
                 // Ensure handleStandardCommand exists before calling
                 if (typeof handleStandardCommand === 'function') {
                    handleStandardCommand(command, args); // Call function from commands.js
                 } else {
                     console.error("handleStandardCommand is not defined!");
                     displayOutput("Error: Command handler not loaded.", "error-line");
                 }
            } else {
                 // Redraw empty prompt line if needed, or just scroll
                 scrollToBottom(); // Use scrollToBottom from utils.js
            }
        }

         // Ensure scroll happens even on empty Enter if desired behaviour includes prompt redraw
         if (commandStr === '') {
             // If you want Enter to create space, add a blank line echo or similar
             // displayCommandEcho('', currentPrompt); // Uncomment to show empty prompt on enter
             scrollToBottom(); // Use scrollToBottom from utils.js
         }

    };

    input.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Enter':
                 // Process the command immediately on Enter
                processInput(input.value);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                    // Move cursor to end of input after setting value
                    input.setSelectionRange(input.value.length, input.value.length);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex];
                     // Move cursor to end of input after setting value
                    input.setSelectionRange(input.value.length, input.value.length);
                } else {
                    // Reached end of history or top, clear input
                    historyIndex = -1;
                    input.value = '';
                }
                break;
             case 'Tab':
                 e.preventDefault(); // Prevent focus change, implement autocomplete later if desired
                 // Autocomplete logic could go here
                 displayOutput("Autocomplete not implemented yet.", "output-line");
                 break;
            // Add Ctrl+L for clear
             case 'l':
                 if(e.ctrlKey) {
                      e.preventDefault(); // Prevent browser's default Ctrl+L action (focus address bar)
                      // Simulate 'clear' command using the handler
                      if (typeof handleStandardCommand === 'function') {
                           handleStandardCommand('clear', []);
                      }
                 }
                 break;
             // Optional: Add Ctrl+C basic handling
             case 'c':
                 if (e.ctrlKey) {
                      e.preventDefault(); // Prevent default copy (though might not work reliably everywhere)
                      // If game active, maybe interrupt current action? (More complex)
                      // For now, just echo ^C and clear input line
                      input.value = '';
                      displayOutput('^C', 'output-line'); // Display ^C
                      historyIndex = -1; // Reset history navigation
                 }
                 break;
        }
    });

    // Focus input when clicking anywhere in the terminal
    terminal.addEventListener('click', (event) => {
        // Only focus if the click wasn't on the input itself or a link/button etc.
        // and ensure text selection isn't happening
        if (event.target !== input && window.getSelection().toString() === '') {
             input.focus();
        }
    });

    // --- Initial Setup ---
    // Use the handleStandardCommand to display MOTD after DOM is ready
     if (typeof handleStandardCommand === 'function') {
        handleStandardCommand('motd', []);
     } else {
         console.error("handleStandardCommand not loaded for initial MOTD.");
         // Fallback or display error message in output
         if(typeof displayOutput === 'function') {
             displayOutput("Error loading initial message.", "error-line");
         }
     }
    input.focus();
    // Initial scroll might be slightly off, call after a tiny delay sometimes helps
    setTimeout(scrollToBottom, 10); // Use scrollToBottom from utils.js
});

// --- Debug log to confirm execution ---
console.log("Main.js finished executing initial setup within DOMContentLoaded.");
// --- END FILE: js/main.js ---
