document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const promptElement = document.querySelector('.prompt');

    let commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: () => `Available commands:\n${Object.keys(commands).join(', ')}`,
        clear: () => { output.innerHTML = ''; return ''; },
        date: () => new Date().toString(),
        echo: (args) => args.join(' '),
        whoami: () => 'guest',
        motd: () => `
   _____ __          __        _______ __            __
  / ___// /_  ____ _/ /_      / ____(_) /___  ____ _/ /_
  \\__ \\/ __ \\/ __ \`/ __/_____/ /   / / / __ \\/ __ \`/ __/
 ___/ / / / / /_/ / /_/_____/ /___/ / / / / / /_/ / /_
/____/_/ /_/\\__,_/\\__/      \\____/_/_/_/ /_/\\__,_/\\__/
Welcome to WebTerm! Type 'help' for available commands.
`,
        neofetch: () => `
        .--.        guest@web-term
       |o_o |       ------------
       |:_/ |       OS: Browser Runtime Environment
      //   \\ \\      Host: Your Device
     (|     | )     Kernel: ${navigator.userAgentData?.platform || navigator.platform}
    /'\\_   _/ \`\\    Uptime: ${Math.floor(performance.now() / 1000)}s
    \\___)=(___/    Shell: WebTerm v0.1
                    Resolution: ${window.screen.width}x${window.screen.height}
                    Theme: ${document.body.classList.contains('light-theme') ? 'light' : 'dark'}
                    CPU: ${navigator.hardwareConcurrency || 'N/A'} Cores
                    Memory: ${navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'N/A'}
                    GPU: ${getGpuInfo() || 'N/A'}

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
        }
    };

    // Try to get GPU info (experimental, might not work everywhere)
    function getGpuInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (e) {
            // Ignore errors
        }
        return null;
    }


    const displayOutput = (text, type = 'output-line') => {
        const line = document.createElement('div');
        line.className = type;
        // Simple sanitization: replace < and > to prevent HTML injection from echo etc.
        // For MOTD/neofetch with intended formatting, handle separately if needed
        if (type !== 'motd' && type !== 'neofetch-output') { // Allow basic html/whitespace for specific commands
             line.textContent = text;
        } else {
            line.innerHTML = text; // Use innerHTML cautiously for formatted output
        }

        output.appendChild(line);
        scrollToBottom();
    };

    const displayCommandEcho = (command) => {
        const line = document.createElement('div');
        line.className = 'command-echo';
        line.innerHTML = `<span class="prompt">${promptElement.textContent}</span> ${command.replace(/</g, "<").replace(/>/g, ">")}`; // Sanitize displayed command
        output.appendChild(line);
    }

    const processCommand = (command) => {
        if (command.trim() === '') return;

        commandHistory.unshift(command); // Add to history
        historyIndex = -1; // Reset history index

        displayCommandEcho(command);

        const parts = command.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (commands[cmd]) {
            try {
                const result = commands[cmd](args);
                // Special handling for commands that format their own output type
                 if (cmd === 'motd') {
                     displayOutput(result, 'motd');
                 } else if (cmd === 'neofetch') {
                    displayOutput(result, 'neofetch-output'); // Could use a different class if needed
                 } else if (result) {
                    displayOutput(result);
                 }
            } catch (error) {
                console.error("Command error:", error);
                displayOutput(`Error executing command: ${cmd}`, 'error-line');
            }
        } else {
            displayOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error-line');
        }

        input.value = '';
        scrollToBottom();
    };

    const scrollToBottom = () => {
        terminal.scrollTop = terminal.scrollHeight;
    };

    input.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Enter':
                processCommand(input.value);
                break;
            case 'ArrowUp':
                e.preventDefault(); // Prevent cursor moving to beginning
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                    input.setSelectionRange(input.value.length, input.value.length); // Move cursor to end
                }
                break;
            case 'ArrowDown':
                e.preventDefault(); // Prevent cursor moving to end
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex];
                     input.setSelectionRange(input.value.length, input.value.length); // Move cursor to end
                } else {
                    historyIndex = -1;
                    input.value = '';
                }
                break;
        }
    });

    // Focus input when clicking anywhere in the terminal
    terminal.addEventListener('click', () => {
        input.focus();
    });

    // Initial setup
    displayOutput(commands.motd(), 'motd'); // Show MOTD on load
    input.focus(); // Ensure focus on load
});
