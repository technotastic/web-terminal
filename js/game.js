// --- START FILE: js/game.js --- (COMPLETE CORRECT VERSION - Feb 29)
const game = (() => {
    let gameState = {}; // Will hold player location, inventory, flags, points etc.

    // --- Game Data ---
    const gameData = {
        rooms: {
            'entrance': {
                id: 'entrance',
                name: "Observatory Entrance",
                desc: "You stand before the imposing, weathered oak doors of an old observatory. They seem firmly <span class='game-item'>locked</span>. Dust motes dance in the faint moonlight filtering through the grimy arch <span class='game-item'>window</span> above. A faint, cold <span class='game-item'>draft</span> slips from beneath the doors. One <span class='game-item'>stone</span> near the base of the right door looks slightly loose. To the <span class='game-exit'>south</span>, a path leads back the way you came, into the woods.", // Added stone clue
                exits: { south: 'outside' }, // 'outside' represents ending the game prematurely here
                items: [],
                details: {
                    'doors': "Massive oak doors, reinforced with iron bands. There's no visible handle or keyhole from here, but they feel solid.", // Updated description
                    'lock': "There's no traditional lock visible on the outside.", // Changed lock description
                    'window': "The arch window is high up and covered in grime. You can't reach it easily.",
                    'draft': "A cold draft seeps from under the main doors. There might be a gap.",
                    'stone': "A weathered stone set into the ground near the right door. It definitely looks looser than the others around it.", // Detail for loose stone
                    'button': "A small, smooth button hidden in the recess behind the loose stone." // Detail for hidden button (revealed later)
                },
                onEnter: null, // Function to run when entering room
                // North is initially blocked, requires button press
                lockedExits: { } // Let 'go' logic handle the block based on puzzle state
            },
            'mainhall': {
                id: 'mainhall',
                name: "Main Hall",
                 desc: "You are in the grand main hall of the observatory. A high, domed ceiling arches overhead, painted with faded constellations. Dust covers everything. Moonlight streams weakly from dirty skylights. Passages lead <span class='game-exit'>north</span> (Library), <span class='game-exit'>east</span> (Workshop), and <span class='game-exit'>west</span> (Stairs Up). The main <span class='game-exit'>south</span> doors lead back outside.", // Removed 'slammed shut' initially
                exits: { north: 'library', east: 'workshop', west: 'stairs_up', south: 'entrance' }, // South exit back works now
                items: [ { id: 'note', name: 'crumpled note', description: "A hastily scribbled note.", takeable: true, detail: "The note reads: 'The mechanism jams... requires alignment. Seek the missing eye and consult the charts. The path opens when heavens align. - E.A.'"} ],
                details: {
                    'ceiling': "Painted with constellations, now faded and peeling. Was this place beautiful once?",
                    'skylights': "Covered in decades of dirt. Only faint light gets through.",
                    'constellations': "You recognize Orion and Ursa Major, but many are obscured or unfamiliar.",
                    'doors': "The heavy oak doors that lead south. They look like they could be opened from this side." // Updated detail
                },
                onEnter: (firstTime) => {
                    if (firstTime) {
                         // No longer trapped immediately
                        updatePoints(5); // Points for getting inside
                    }
                },
                lockedExits: {} // No locked exits initially from here
            },
            'library': {
                id: 'library',
                name: "Library",
                desc: "This dusty library is filled with towering bookshelves, many now leaning precariously. Loose pages and decaying <span class='game-item'>books</span> litter the floor. A large mahogany <span class='game-item'>desk</span> sits near the back wall. The air smells of mold and old paper. The only exit is <span class='game-exit'>south</span> back to the Main Hall.",
                exits: { south: 'mainhall' },
                items: [ { id: 'book_astronomy', name: 'heavy astronomy book', description: "A large, leather-bound tome titled 'Celestial Mechanics'.", takeable: true, detail: "Most pages are stuck together, but one section details planetary alignments and mentions a 'Guiding Star' important to ancient navigators. It seems to be missing some diagrams."} ],
                details: {
                    'bookshelves': "Packed with decaying books on astronomy, physics, and some surprisingly esoteric topics.",
                    'books': "Most are ruined by damp and time. One <span class='game-item'>heavy astronomy book</span> looks slightly better preserved.",
                    'desk': "Covered in dust. The drawers are stuck fast, except one which contains only dried ink residue.",
                    'pages': "Scattered pages show complex equations and star charts.",
                },
                onEnter: null,
                 lockedExits: {}
            },
            'workshop': {
                id: 'workshop',
                name: "Workshop",
                desc: "This room was clearly a workshop. Tools hang rusting on the walls, and a sturdy <span class='game-item'>workbench</span> is covered in strange metal parts and wires. Gears and lenses are scattered about. There's a strange <span class='game-item'>metal panel</span> set into the north wall. Exits lead <span class='game-exit'>west</span> to the Main Hall.",
                exits: { west: 'mainhall' },
                items: [
                    { id: 'gear', name: 'small brass gear', description: "A small, intricate gear.", takeable: true, detail: "It looks like it might fit into some kind of mechanism."},
                    { id: 'key', name: 'crescent key', description: "A brass key shaped like a crescent moon.", takeable: true, detail: "This looks like it might fit *something*, but not the main doors...", hidden: true } // Changed detail, still hidden
                ],
                details: {
                    'workbench': "Cluttered with tools, half-finished devices, and dust. Searching it might reveal something.",
                    'tools': "Mostly rusted wrenches, screwdrivers, and stranger implements you don't recognize.",
                    'panel': "A smooth metal panel with no obvious handles or seams. There's a small slot near the bottom.",
                    'parts': "Various bits of metal, wires, and broken lenses.",
                    'gears': "Several gears of different sizes are scattered on the workbench and floor. One <span class='game-item'>small brass gear</span> looks particularly well-made.",
                    'lenses': "Cracked or chipped lenses, perhaps for telescopes or other instruments."
                },
                 onEnter: null,
                 lockedExits: {}
            },
             'stairs_up': {
                id: 'stairs_up',
                name: "Spiral Staircase",
                desc: "A narrow, wrought-iron spiral staircase winds upwards into darkness. Dust hangs thick in the air. You can go <span class='game-exit'>up</span> to the Dome landing or <span class='game-exit'>down</span> back to the Main Hall.",
                exits: { up: 'dome_landing', down: 'mainhall' },
                items: [],
                details: {
                    'staircase': "Seems sturdy enough, despite the rust.",
                    'darkness': "It's quite dark upwards. You can barely make out the landing above.",
                    'iron': "The wrought iron is cold and slightly damp."
                },
                 onEnter: null,
                 lockedExits: {}
            },
            'dome_landing': {
                id: 'dome_landing',
                name: "Dome Landing",
                desc: "You are on a landing outside the main telescope dome. A heavy, circular <span class='game-item'>metal door</span> blocks the way <span class='game-exit'>north</span> into the dome itself. It has no handle, only a complex <span class='game-item'>mechanism</span> beside it. The staircase leads <span class='game-exit'>down</span>.",
                exits: { down: 'stairs_up' },
                items: [],
                details: {
                    'door': "The dome door is thick steel. It looks soundproof and very secure.",
                    'mechanism': "A complex array of slots, sockets, and pressure plates. A large lever socket is conspicuously empty, and a smaller slot looks gear-shaped. It seems designed to control the door.",
                },
                onEnter: null,
                lockedExits: { 'north': 'dome' } // Dome door is locked by the mechanism
            },
            'dome': {
                id: 'dome',
                name: "Telescope Dome",
                desc: "You are inside the observatory dome! A massive <span class='game-item'>telescope</span> dominates the center of the room, pointing towards the slit in the domed ceiling. Control panels and <span class='game-item'>star charts</span> line the walls. A cool breeze flows from the ceiling slit. The only exit is <span class='game-exit'>south</span> through the now open door.",
                exits: { south: 'dome_landing' },
                items: [
                    { id: 'chart', name: 'star chart', description: "A detailed chart showing constellations and celestial coordinates.", takeable: true, detail: "It seems focused on a specific sector of the night sky. A handwritten note marks a faint nebula: 'Nebula Cygni X-1 - The Key?'"},
                    { id: 'lens', name: 'telescope lens', description: "A large, precisely ground glass lens.", takeable: true, detail: "It looks like it belongs in the main telescope eyepiece assembly.", hidden: true } // Initially hidden
                ],
                details: {
                    'telescope': "An enormous brass and steel telescope. The main eyepiece assembly looks incomplete - it's missing a <span class='game-item'>lens</span>. Searching the base might be useful.",
                    'ceiling': "The dome ceiling has a large slit that can likely open to the night sky.",
                    'panels': "Covered in buttons, dials, and gauges, all dark and lifeless.",
                    'charts': "Several star charts are pinned to the walls. One large, rolled-up <span class='game-item'>star chart</span> seems particularly important.",
                    'breeze': "A surprisingly fresh, cool breeze wafts down from the ceiling slit."
                },
                onEnter: (firstTime) => {
                    if (firstTime) {
                        updatePoints(15); // Points for entering the dome
                    }
                },
                 lockedExits: {}
            },
            // --- Add more rooms as needed ---
            'outside': { // A pseudo-room for ending the game
                id: 'outside',
                name: "Forest Path",
                desc: "You are back on the path in the woods. The observatory looms behind you. You decided not to face its mysteries today.",
                exits: {},
                items: [],
                details: {},
                onEnter: () => {
                    displayOutput("You turn your back on the observatory and walk away.", 'game-story');
                    endGame(false); // End game, not successfully
                },
                 lockedExits: {}
            },
            'roof': { // The final escape room (initially inaccessible)
                 id: 'roof',
                 name: "Observatory Roof",
                 desc: "You've emerged onto the flat roof surrounding the dome! The night air is crisp and cold. Stars blanket the sky. You see a sturdy <span class='game-item'>ladder</span> bolted to the side of the dome, leading down to the ground far below. Freedom!",
                 exits: { 'down': 'freedom' }, // Escape!
                 items: [],
                 details: {
                     'stars': "A breathtaking view of the night sky, unobscured by city lights.",
                     'ladder': "Looks safe enough. It's your way out!",
                     'dome': "From here, you can see the slit in the dome is slightly open, letting out the breeze you felt inside."
                 },
                 onEnter: (firstTime) => {
                    if (firstTime) {
                         updatePoints(25); // Points for reaching the roof
                    }
                 },
                 lockedExits: {}
             },
             'freedom': { // Final pseudo-room
                 id: 'freedom',
                 name: "Freedom!",
                 desc: "You climb down the ladder under the starlight, leaving the secrets of the observatory behind.",
                 exits: {},
                 items: [],
                 details: {},
                 onEnter: () => {
                     endGame(true); // End game successfully!
                 },
                 lockedExits: {}
             }
        },
        items: { // Define items properties here if they need more than name/desc/takeable
            'note': { score: 5 },
            'key': { score: 10 }, // Key might be for something else inside now?
            'book_astronomy': { score: 5 },
            'gear': { score: 5 },
            'chart': { score: 10 },
            'lens': { score: 10 }
        },
        puzzles: {
             'entrance_button': {
                location: 'entrance',
                target: 'button',
                solved: false,
                successMsg: "*Click* You hear a mechanism unlock within the heavy doors.",
                points: 10
             },
            'dome_mechanism': {
                 solved: false,
                 location: 'dome_landing',
                 target: 'mechanism',
                 successMsg: "With the gear in place, the mechanism whirs softly. The heavy dome door slides open!",
                 points: 20
            },
            'telescope_setup': {
                 solved: false,
                 location: 'dome',
                 target: 'telescope',
                 successMsg: "You carefully slot the telescope lens into the eyepiece assembly. It fits perfectly.",
                 points: 15
            },
            'final_alignment': {
                solved: false,
                location: 'dome',
                target: 'telescope',
                points: 30,
                successMsg: "As you align the telescope using the coordinates from the chart, focusing on Nebula Cygni X-1, a low hum fills the dome. A section of the wall beside the control panels slides open, revealing a hidden passage upwards!",
                unlocksRoom: 'roof'
            }
            // Maybe add a puzzle for the crescent key later if desired
        },
        hints: [ // Updated hints for the new first puzzle
            { id: 'start', text: "The main doors seem locked tight. Is there anything unusual around the entrance? Maybe examine the area closely, like the <span class='game-item'>stone</span>work?", triggeredByLocation: 'entrance', condition: () => !gameState.flags.foundButton },
            { id: 'found_stone', text: "You found a loose stone! What can you do with it? Try interacting with it (e.g., 'pull stone', 'push stone').", triggeredByLocation: 'entrance', condition: () => gameState.flags.examinedLooseStone && !gameState.flags.foundButton },
            { id: 'found_button', text: "There's a button hidden behind the stone. Try pushing it!", triggeredByLocation: 'entrance', condition: () => gameState.flags.foundButton && !gameState.puzzleStates.entranceDoorUnlocked },
            { id: 'inside', text: "You're inside! Look around the main hall carefully. Did you find anything interesting, like a note?", triggeredByLocation: 'mainhall', condition: () => !playerHas('note') },
            { id: 'note_clue', text: "The note mentioned a 'mechanism', 'missing eye' (perhaps a lens?), and 'charts'. Where might you find items like these? Maybe check the workshop or library?", condition: () => playerHas('note') && (!playerHas('lens') || !playerHas('chart') || !playerHas('gear'))},
            { id: 'workshop_search', text: "Workshops often have hidden things. Have you tried searching the workbench specifically?", triggeredByLocation: 'workshop', condition: () => !playerHas('key') && !gameState.flags.searchedWorkbench }, // Key might be irrelevant now, but keep for now
            { id: 'library_search', text: "That heavy astronomy book seems important. Have you tried reading it carefully?", triggeredByLocation: 'library', condition: () => playerHas('book_astronomy') && !gameState.flags.readBook },
            { id: 'gear_hunt', text: "Have you found a small gear yet? Check the workshop again.", condition: () => !playerHas('gear') && gameState.player.location !== 'workshop'},
            { id: 'dome_mech_stuck', text: "The mechanism on the dome landing looks like it needs something small and mechanical. Have you found a gear?", triggeredByLocation: 'dome_landing', condition: () => !gameState.puzzleStates.domeDoorOpen && !playerHas('gear')},
            { id: 'dome_mech_use_gear', text: "You have the gear. Try using it *on* the mechanism.", triggeredByLocation: 'dome_landing', condition: () => !gameState.puzzleStates.domeDoorOpen && playerHas('gear')},
            { id: 'lens_hunt', text: "The note mentioned a 'missing eye'. The telescope needs a lens. Have you searched the dome room thoroughly, especially near the telescope base?", triggeredByLocation: 'dome', condition: () => !playerHas('lens') && !gameState.flags.searchedTelescopeBase},
            { id: 'telescope_use_lens', text: "You have the lens. Try using it on the telescope.", triggeredByLocation: 'dome', condition: () => playerHas('lens') && !gameState.puzzleStates.telescopeReady},
            { id: 'final_puzzle', text: "The telescope is ready and you have the chart. The note mentioned 'when heavens align'. Try using the chart *with* the telescope, perhaps focusing on the nebula mentioned?", triggeredByLocation: 'dome', condition: () => gameState.puzzleStates.telescopeReady && playerHas('chart') && !gameState.puzzleStates.finalPuzzleSolved }
        ]
    };

    // --- Game State ---
    function resetGameState() {
        gameState = {
            player: {
                location: 'entrance', // Starting room ID
                inventory: [],
                score: 0,
            },
            puzzleStates: { // Track puzzle progression
                entranceDoorUnlocked: false, // NEW: Tracks if button unlocked door
                domeDoorOpen: false, // Set true when gear used on mechanism
                telescopeReady: false, // Lens installed
                finalPuzzleSolved: false, // Roof access opened
            },
            flags: { // General game flags
                examinedLooseStone: false, // NEW: Track if player looked at the stone
                foundButton: false,        // NEW: Track if player revealed the button
                searchedWorkbench: false,
                searchedTelescopeBase: false,
                readBook: false,
                visited_rooms: {'entrance': true}, // Track visited rooms for points/hints
            },
            hintsUsed: 0,
            maxHints: 7, // Increased hint count
            isActive: false,
            confirmQuit: false // Flag for quit confirmation
        };
    }

    // --- Core Game Functions ---

    function start() {
        resetGameState();
        gameState.isActive = true;
        displayOutput("\nInitializing Adventure: The Abandoned Observatory...", "game-story");
        displayOutput("Type 'gamehelp' for a list of commands.", "game-info");
        // Update prompt
        const promptElement = document.getElementById('prompt');
        if(promptElement) promptElement.textContent = ">> "; // Change prompt for game mode
        look(); // Show the starting room description
    }

    function endGame(success = false) {
        if (!gameState.isActive) return; // Prevent double-ending

        if (success) {
            displayOutput("\n*************************************", "game-points");
            displayOutput("*** CONGRATULATIONS! ***".padStart(28), "game-points");
            displayOutput("You've escaped the Abandoned Observatory!".padStart(37), "game-points");
            displayOutput("*************************************", "game-points");
            displayOutput(`\nFinal Score: ${gameState.player.score} points!`, "game-points");
        } else {
            displayOutput("\n--- GAME OVER ---", "error-line");
            displayOutput(`You scored ${gameState.player.score} points.`, "game-points");
        }
        gameState.isActive = false;
         // Restore prompt
        const promptElement = document.getElementById('prompt');
        if(promptElement) promptElement.textContent = "guest@web-term:~$";
        // Ensure input focus is returned or handled appropriately if needed
        const inputElement = document.getElementById('input');
        if(inputElement) inputElement.focus();
    }

    function updatePoints(points) {
        gameState.player.score += points;
        displayOutput(`[+${points} points! Total: ${gameState.player.score}]`, 'game-points');
    }

    function getCurrentRoom() {
        return gameData.rooms[gameState.player.location];
    }

    function playerHas(itemId) {
        return gameState.player.inventory.some(item => item.id === itemId);
    }

    function getItemFromRoom(itemIdOrName, room) {
         // Prioritize exact ID match, then partial name match
         let item = room.items.find(i => i.id === itemIdOrName);
         if (!item) {
             // Make partial matching case-insensitive and handle potential null itemIdOrName
             const lowerItemName = itemIdOrName ? itemIdOrName.toLowerCase() : '';
             if (lowerItemName) {
                item = room.items.find(i => i.name.toLowerCase().includes(lowerItemName));
             }
         }
         return item;
    }

    function getItemFromInventory(itemIdOrName) {
         let item = gameState.player.inventory.find(i => i.id === itemIdOrName);
         if (!item) {
              const lowerItemName = itemIdOrName ? itemIdOrName.toLowerCase() : '';
              if(lowerItemName) {
                 item = gameState.player.inventory.find(i => i.name.toLowerCase().includes(lowerItemName));
              }
         }
        return item;
    }

     function removeItemFromRoom(itemId, room) {
        room.items = room.items.filter(item => item.id !== itemId );
    }

    function removeItemFromInventory(itemId) {
        gameState.player.inventory = gameState.player.inventory.filter(item => item.id !== itemId);
    }

    // --- Command Parsers / Handlers ---

    function parseCommand(command) {
        // Reset quit confirmation if any other command is typed
        if (command.toLowerCase() !== 'yes' && command.toLowerCase() !== 'no') {
            gameState.confirmQuit = false;
        }

        const parts = command.toLowerCase().trim().split(/\s+/);
        let verb = parts[0];
        let noun = null;
        let target = null;

        // Simple parsing: verb [noun] [preposition] [target]
        const prepositions = ['on', 'at', 'with', 'to', 'in', 'under', 'using', 'behind']; // Added 'behind'
        let prepIndex = -1;
        for (let i = 1; i < parts.length; i++) {
            if (prepositions.includes(parts[i])) {
                prepIndex = i;
                break;
            }
        }

        if (prepIndex !== -1) {
            verb = parts[0];
            noun = parts.slice(1, prepIndex).join(' ');
            target = parts.slice(prepIndex + 1).join(' ');
        } else {
            verb = parts[0];
            noun = parts.length > 1 ? parts.slice(1).join(' ') : null;
        }

        // Handle shorthand directions as verbs
        const directionMap = { n: 'north', s: 'south', e: 'east', w: 'west', u: 'up', d: 'down' };
        if (directionMap[verb]) {
            noun = directionMap[verb]; // The direction becomes the noun
            verb = 'go'; // The verb is always 'go'
        }


        console.log(`Parsed: verb='${verb}', noun='${noun}', target='${target}'`); // Debugging

        // Add verbs for interacting with the stone/button
        switch (verb) {
            case 'look': case 'l': look(noun); break;
            case 'go': case 'move': case 'walk': go(noun); break;
            case 'take': case 'get': case 'pickup': take(noun); break;
            case 'drop': case 'leave': drop(noun); break;
            case 'inventory': case 'inv': case 'i': inventory(); break;
            case 'use': use(noun, target); break;
            case 'examine': case 'x': case 'read': case 'inspect': examine(noun); break;
            case 'search': search(noun); break;
            case 'hint': case 'ask': giveHint(); break;
            case 'score': case 'points': displayOutput(`Current Score: ${gameState.player.score}`, 'game-points'); break;
            case 'gamehelp': case 'commands': showGameHelp(); break;
            case 'quitgame': case 'quit': gameState.confirmQuit = true; displayOutput("Are you sure you want to quit? (yes/no)", "game-info"); break;
            case 'yes': if (gameState.confirmQuit) endGame(false); else displayOutput("Yes to what?", "error-line"); gameState.confirmQuit = false; break;
            case 'no': if (gameState.confirmQuit) displayOutput("Okay, continuing the game.", "game-info"); else displayOutput("No to what?", "error-line"); gameState.confirmQuit = false; break;
            // NEW VERBS:
            case 'pull':
            case 'move': // Allow 'move stone'
            case 'push': // Allow 'push stone' or 'push button'
                handlePushPull(verb, noun);
                break;
            default:
                // Basic check for direction words used alone
                if (Object.values(directionMap).includes(verb)) {
                    go(verb); // Allow typing just 'north'/'south'/etc.
                } else {
                    displayOutput(`I don't understand how to "${command}". Try 'gamehelp'.`, 'error-line');
                }
        }
    }

    function showGameHelp() {
        displayOutput(
`--- Adventure Game Commands ---
Movement:
  go [direction]  (north, south, east, west, up, down)
  n, s, e, w, u, d (shorthand for directions)
  [direction]     (e.g., just type 'north')

Interaction:
  look / l        (Describe the room and items)
  look [item]     (Synonym for examine)
  examine [item] / x [item] (Look closely at something)
  read [item]     (Read text on an item like a note or book)
  search          (Search the current room)
  search [item/area] (Search a specific area like 'workbench')
  take [item] / get [item] (Pick up an item)
  drop [item]     (Leave an item behind)
  inventory / i   (See what you are carrying)
  use [item]      (Use an item you are carrying)
  use [item] on [target] (Use an item on something else)
  push [item]     (Push something, like a button or stone)
  pull [item]     (Pull something, like a stone)
  move [item]     (Move something, like a stone)


Game Meta:
  hint / ask      (Get a hint if you're stuck)
  score / points  (Check your current score)
  gamehelp / commands (Show this help message)
  quitgame / quit (Exit the adventure)
---`, 'game-info');
    }


    function look(targetName) {
        const room = getCurrentRoom();
        if (targetName) {
            examine(targetName); // If a target is specified, just examine it
            return;
        }

        displayOutput(`\n--- ${room.name} ---`, 'game-room-desc');
        displayOutput(room.desc, 'game-room-desc');

        // List visible items
        const visibleItems = room.items.filter(item => !item.hidden);
        if (visibleItems.length > 0) {
            displayOutput("You see here: " + visibleItems.map(item => `<span class='game-item'>${item.name}</span>`).join(', '), 'game-info');
        }

        // List exits (This was the part causing HTML issues, fixed in utils.js)
        const exitNames = Object.keys(room.exits);
        const lockedExitNames = Object.keys(room.lockedExits).filter(dir => {
            // Don't show locked exits if they've been permanently unlocked/removed
            // Example: if (room.id === 'entrance' && dir === 'north' && gameState.puzzleStates.entranceDoorUnlocked) return false;
            if (room.id === 'dome_landing' && dir === 'north' && gameState.puzzleStates.domeDoorOpen) return false;
            return true;
        });

        // Special check for entrance 'north' exit based on puzzle state
        let exitString = "Obvious exits: ";
        let availableExits = [...exitNames];
        let blockedExits = [...lockedExitNames];

        if (room.id === 'entrance') {
            if (gameState.puzzleStates.entranceDoorUnlocked) {
                availableExits.push('north'); // Add north if unlocked
            } else {
                blockedExits.push('north'); // Otherwise, it's blocked
            }
            // Ensure 'north' isn't listed twice if it was accidentally in lockedExits
            blockedExits = blockedExits.filter(e => e !== 'north');
        }


        if (availableExits.length > 0) {
             exitString += availableExits.map(e => `<span class='game-exit'>${e}</span>`).join(', ');
        } else {
             exitString += "None";
        }
        // Only show blocked exits if there are any *actually* blocked currently
        if (blockedExits.length > 0) {
            exitString += ". Blocked: " + blockedExits.map(e => `<span class='game-exit'>${e}</span>`).join(', ');
        }
        displayOutput(exitString, 'game-info');
    }

    function take(itemName) {
        if (!itemName) {
            displayOutput("Take what?", "error-line");
            return;
        }
        const room = getCurrentRoom();
        const item = getItemFromRoom(itemName, room);

        if (item && !item.hidden) {
            if (item.takeable) {
                gameState.player.inventory.push(item);
                removeItemFromRoom(item.id, room);
                displayOutput(`You take the ${item.name}.`, 'game-info');
                if (gameData.items[item.id] && gameData.items[item.id].score) {
                    updatePoints(gameData.items[item.id].score);
                }
            } else {
                displayOutput(`You can't take the ${item.name}.`, 'error-line');
            }
        } else {
             if (room.details && Object.keys(room.details).some(key => key.includes(itemName))) {
                 displayOutput(`You can't take the ${itemName}.`, 'error-line');
             } else {
                 displayOutput(`You don't see "${itemName}" here.`, 'error-line');
             }
        }
    }

     function drop(itemName) {
        if (!itemName) {
            displayOutput("Drop what?", "error-line");
            return;
        }
        const item = getItemFromInventory(itemName);

        if (item) {
            const room = getCurrentRoom();
            room.items.push(item); // Add item to room
            removeItemFromInventory(item.id); // Remove from inventory
            displayOutput(`You drop the ${item.name}.`, 'game-info');
        } else {
            displayOutput(`You aren't carrying "${itemName}".`, 'error-line');
        }
    }

    function inventory() {
        if (gameState.player.inventory.length === 0) {
            displayOutput("You are not carrying anything.", 'game-info');
        } else {
            displayOutput("You are carrying:", 'game-info');
            gameState.player.inventory.forEach(item => {
                displayOutput(`- ${item.name}`, 'game-item');
            });
        }
    }

    function examine(targetName) {
        if (!targetName) {
            look(); // Default 'examine' to 'look'
            return;
        }

        const room = getCurrentRoom();
        const lowerTarget = targetName.toLowerCase(); // Use lower case for matching

        // 1. Check inventory
        let item = getItemFromInventory(lowerTarget);
        if (item) {
            displayOutput(item.detail || item.description || `It's a ${item.name}.`, 'game-info');
            if (item.id === 'book_astronomy') gameState.flags.readBook = true;
            return;
        }

        // 2. Check items in the room (visible)
        item = getItemFromRoom(lowerTarget, room);
         if (item && !item.hidden) {
            displayOutput(item.detail || item.description || `You see a ${item.name}.`, 'game-info');
            if (item.id === 'book_astronomy') gameState.flags.readBook = true;
            return;
        }

        // 3. Check room details map (case-insensitive check)
        const detailKey = Object.keys(room.details).find(key => key.toLowerCase().includes(lowerTarget));
        if (detailKey) {
            displayOutput(room.details[detailKey], 'game-room-desc');
            // Specific logic for examining the loose stone
            if (room.id === 'entrance' && detailKey === 'stone') {
                 gameState.flags.examinedLooseStone = true; // Set flag when examined
                 if (gameState.flags.foundButton) {
                      displayOutput("The stone is pivoted inward, revealing a small recess with a <span class='game-item'>button</span>.", 'game-room-desc');
                 }
            }
            // Specific logic for examining the button (only if found)
             else if (room.id === 'entrance' && detailKey === 'button' && gameState.flags.foundButton) {
                  // displayOutput(room.details[detailKey], 'game-room-desc'); // Already displayed above
             } else if (room.id === 'entrance' && detailKey === 'button' && !gameState.flags.foundButton) {
                  displayOutput("You don't see any button here.", 'error-line'); // Can't examine button if not found
             }
            return;
        }

        // 4. Check common nouns (floor, ceiling, wall etc) - case-insensitive
        if (lowerTarget === 'wall' || lowerTarget === 'walls') {
             let wallDesc = "The walls are damp and covered in peeling paint or wallpaper.";
             if(room.id === 'workshop') {
                 wallDesc += " The north wall has a smooth <span class='game-item'>metal panel</span> set into it.";
             }
            displayOutput(wallDesc, 'game-room-desc');
            return;
        }
         if (lowerTarget === 'floor') {
            let floorDesc = "The floor is dusty stone or wood, covered in debris in places.";
            if (room.id === 'library') {
                 floorDesc += " Loose <span class='game-item'>pages</span> and decaying <span class='game-item'>books</span> litter the floor here.";
            }
            displayOutput(floorDesc, 'game-room-desc');
            return;
        }
         if (lowerTarget === 'ceiling') {
            let ceilDesc = "The ceiling is high above.";
             if (room.id === 'mainhall' && room.details['ceiling']) {
                 ceilDesc = room.details['ceiling'];
             } else if (room.id === 'dome' && room.details['ceiling']) {
                  ceilDesc = room.details['ceiling'];
             }
             displayOutput(ceilDesc, 'game-room-desc');
            return;
         }

        // 5. Not found
        displayOutput(`You don't see anything special about "${targetName}" here.`, 'error-line');
    }

     function search(targetName) {
         const room = getCurrentRoom();
         const lowerTarget = targetName ? targetName.toLowerCase() : null;

         if (!lowerTarget || lowerTarget === 'room' || lowerTarget === 'area') {
              displayOutput(`You search the ${room.name}...`, "game-info");
              const visibleItems = room.items.filter(item => !item.hidden);
               if (visibleItems.length > 0) {
                   displayOutput("You notice: " + visibleItems.map(item => `<span class='game-item'>${item.name}</span>`).join(', '), 'game-info');
               } else {
                   displayOutput("You find nothing of interest just lying around.", "game-info");
               }
              // Add checks for specific room searches here if needed
              // e.g., if (room.id === 'library' && !playerHas('something')) { reveal something }
              return;
         }

         // Specific search actions (case-insensitive)
         if (room.id === 'workshop' && lowerTarget.includes('workbench')) {
             if (!gameState.flags.searchedWorkbench) {
                 displayOutput("You rummage through the tools and parts on the workbench...", "game-info");
                 gameState.flags.searchedWorkbench = true;
                 const key = gameData.rooms.workshop.items.find(i => i.id === 'key');
                 if (key && key.hidden) {
                     key.hidden = false; // Make the key visible
                     displayOutput("Tucked under some oily rags, you find a <span class='game-item'>crescent key</span>!", "game-item");
                     updatePoints(5);
                 } else {
                     displayOutput("You find nothing else of interest.", "game-info");
                 }
             } else {
                 displayOutput("You've already searched the workbench thoroughly.", "game-info");
             }
             return;
         }
         if (room.id === 'dome' && lowerTarget.includes('telescope')) {
             if (!gameState.flags.searchedTelescopeBase) {
                  displayOutput("You search around the base of the massive telescope...", "game-info");
                  gameState.flags.searchedTelescopeBase = true;
                  const lens = gameData.rooms.dome.items.find(i => i.id === 'lens');
                  if (lens && lens.hidden) {
                      lens.hidden = false;
                      displayOutput("Wedged in a crack near the floor, you find a large <span class='game-item'>telescope lens</span>!", "game-item");
                      updatePoints(5);
                  } else {
                       displayOutput("You find only dust and some small, unidentifiable metal shavings.", "game-info");
                  }
             } else {
                 displayOutput("You've already searched around the telescope base.", "game-info");
             }
             return;
         }

         // Generic search failure
         displayOutput(`You search the ${targetName}, but find nothing unusual.`, "game-info");
     }

    function handlePushPull(verb, noun) {
        const room = getCurrentRoom();
         if (!noun) {
             displayOutput(`${verb} what?`, 'error-line');
             return;
         }
         const lowerNoun = noun.toLowerCase();

        if (room.id !== 'entrance') {
             displayOutput(`You can't ${verb} that here.`, 'error-line');
             return;
        }

        if (lowerNoun.includes('stone')) {
             if (gameState.flags.examinedLooseStone) { // Require examining first
                  if (!gameState.flags.foundButton) {
                       displayOutput(`You ${verb} the loose stone. It pivots inward, revealing a small, hidden <span class='game-item'>button</span>!`, 'game-info');
                       gameState.flags.foundButton = true;
                       updatePoints(5); // Points for finding the button
                  } else {
                       displayOutput("The stone is already moved aside.", 'game-info');
                  }
             } else {
                   // If they haven't examined the specific loose stone
                   displayOutput("Which stone? Only one looks loose.", 'error-line');
             }
        } else if (lowerNoun.includes('button')) {
            if (gameState.flags.foundButton) {
                if (verb === 'push') {
                     if (!gameState.puzzleStates.entranceDoorUnlocked) {
                          const puzzle = gameData.puzzles.entrance_button;
                          displayOutput(puzzle.successMsg, 'game-info');
                          updatePoints(puzzle.points);
                          gameState.puzzleStates.entranceDoorUnlocked = true;
                          displayOutput("The way <span class='game-exit'>north</span> might be open now.", "game-info");
                     } else {
                           displayOutput("You push the button again, but nothing else happens.", 'game-info');
                     }
                } else { // Trying to pull/move button
                     displayOutput(`You can't ${verb} the button. Try pushing it.`, 'error-line');
                }
            } else {
                 displayOutput("What button?", 'error-line'); // Button isn't visible yet
            }
        } else {
             displayOutput(`You can't ${verb} the ${noun}.`, 'error-line');
        }
    }


    function go(direction) {
        if (!direction) {
            displayOutput("Go where?", "error-line");
            return;
        }
        const room = getCurrentRoom();
        let destinationId = null;
        let moveAllowed = false;
         const lowerDirection = direction.toLowerCase();

        // Check standard exits first
        if (room.exits[lowerDirection]) {
            destinationId = room.exits[lowerDirection];
            moveAllowed = true;
        }
        // Check if trying to go north from entrance (special case)
        else if (room.id === 'entrance' && lowerDirection === 'north') {
             if (gameState.puzzleStates.entranceDoorUnlocked) {
                  moveAllowed = true;
                  destinationId = 'mainhall'; // Explicit destination
             } else {
                   displayOutput("The main doors are locked.", 'error-line');
                   return; // Stop here, door is locked
             }
        }
        // Check other locked exits (dome door, future puzzles)
        else if (room.lockedExits && room.lockedExits[lowerDirection]) {
             const lockedDest = room.lockedExits[lowerDirection];
             if (room.id === 'dome_landing' && lowerDirection === 'north' && gameState.puzzleStates.domeDoorOpen) {
                  moveAllowed = true; destinationId = lockedDest;
             }
             // Check for the dynamically added roof exit from the dome
             else if (room.id === 'dome' && lowerDirection === 'up' && gameState.puzzleStates.finalPuzzleSolved) {
                  moveAllowed = true; destinationId = 'roof';
             }

             if (!moveAllowed) {
                 // Give specific locked message if possible
                 if (room.id === 'dome_landing' && lowerDirection === 'north') {
                     displayOutput("The heavy metal door to the dome is sealed shut.", 'error-line');
                 } else {
                    displayOutput(`The way ${lowerDirection} is blocked.`, 'error-line');
                 }
                 return;
             }
        }
        // No valid exit found
        else {
             displayOutput(`You can't go ${lowerDirection} from here.`, 'error-line');
             return;
        }

        // --- Move Player ---
        if (moveAllowed && destinationId) {
            const previousLocation = gameState.player.location;
            gameState.player.location = destinationId;
            const newRoom = getCurrentRoom();
            const firstTimeEntering = !gameState.flags.visited_rooms[destinationId];
            gameState.flags.visited_rooms[destinationId] = true;

            if (newRoom.onEnter) {
                newRoom.onEnter(firstTimeEntering);
            }

             if (gameState.isActive) {
                 look(); // Show description of the new room
                 if (firstTimeEntering && newRoom.id !== 'entrance' && newRoom.id !== 'outside' && newRoom.id !== 'freedom') {
                      updatePoints(2); // Small points for exploring new rooms
                 }
             }
        } else {
             console.error("Move failed unexpectedly. Direction:", lowerDirection, "Room:", room.id);
             displayOutput("Something went wrong with moving.", "error-line");
        }
    }


    function use(itemName, targetName) {
        if (!itemName) {
            displayOutput("Use what?", "error-line");
            return;
        }
        const item = getItemFromInventory(itemName); // Already checks lower case
        if (!item) {
            displayOutput(`You don't have "${itemName}".`, "error-line");
            return;
        }
        const room = getCurrentRoom();
        const lowerTarget = targetName ? targetName.toLowerCase() : null;

        // --- Puzzle Logic ---

        // Puzzle 2: Dome Mechanism
        if (item.id === 'gear' && room.id === 'dome_landing' && (lowerTarget === 'mechanism' || lowerTarget === 'panel' || lowerTarget === 'slot')) {
            if (!gameState.puzzleStates.domeDoorOpen) {
                if (!gameState.flags.gearPlaced) {
                     displayOutput("You carefully fit the <span class='game-item'>small brass gear</span> into a matching slot on the mechanism. It clicks into place.", 'game-info');
                     gameState.flags.gearPlaced = true;
                     removeItemFromInventory('gear');
                     updatePoints(5);
                     displayOutput(gameData.puzzles.dome_mechanism.successMsg, 'game-story');
                     gameState.puzzleStates.domeDoorOpen = true;
                     updatePoints(gameData.puzzles.dome_mechanism.points);
                 } else {
                      displayOutput("You've already placed the gear.", 'game-info'); // Should not happen if door isn't open
                 }
            } else {
                 displayOutput("The dome door is already open.", 'game-info');
            }
             return;
        }

        // Puzzle 3: Telescope Setup
        if (item.id === 'lens' && room.id === 'dome' && (lowerTarget === 'telescope' || lowerTarget === 'eyepiece')) {
            if (!gameState.puzzleStates.telescopeReady) {
                 displayOutput(gameData.puzzles.telescope_setup.successMsg, 'game-info');
                 gameState.puzzleStates.telescopeReady = true;
                 removeItemFromInventory('lens');
                 updatePoints(gameData.puzzles.telescope_setup.points);
                 displayOutput("The telescope looks ready for use now.", 'game-info');
            } else {
                 displayOutput("The telescope already has its lens.", 'game-info');
            }
            return;
        }

        // Puzzle 4: Final Alignment
         if (item.id === 'chart' && room.id === 'dome' && (lowerTarget === 'telescope' || !lowerTarget)) { // Allow 'use chart' or 'use chart on telescope'
            if (!gameState.puzzleStates.telescopeReady) {
                 displayOutput("You need to fix the telescope first (perhaps it needs a <span class='game-item'>lens</span>?).", 'error-line');
                 return;
            }
            if (!gameState.puzzleStates.finalPuzzleSolved) {
                 displayOutput(gameData.puzzles.final_alignment.successMsg, 'game-story');
                 gameState.puzzleStates.finalPuzzleSolved = true;
                 updatePoints(gameData.puzzles.final_alignment.points);
                 // Add hidden exit UP to the roof dynamically
                 gameData.rooms.dome.exits.up = 'roof';
                 displayOutput("A passage <span class='game-exit'>up</span> has opened!", "game-info");
            } else {
                 displayOutput("You've already used the chart to find the hidden passage.", 'game-info');
            }
            return;
        }

        // --- Add logic for crescent key if needed ---
        // Example: if (item.id === 'key' && room.id === 'workshop' && lowerTarget === 'panel') { ... }

        // Default "use" behavior if no specific puzzle matched
        if (!targetName) {
            displayOutput(`How do you want to use the ${item.name}? (Try 'use ${item.name} on [something]')`, 'error-line');
        } else {
            displayOutput(`You can't use the ${item.name} on the ${targetName}.`, 'error-line');
        }
    }

     function giveHint() {
         if (gameState.hintsUsed >= gameState.maxHints) {
             displayOutput("You've already used all your available hints!", 'error-line');
             return;
         }

         let providedHint = false;
         // Filter out hints for already solved puzzles/flags first
         const relevantHints = gameData.hints.filter(hint => {
              if (hint.id === 'start' && gameState.flags.foundButton) return false;
              if (hint.id === 'found_stone' && gameState.flags.foundButton) return false;
              if (hint.id === 'found_button' && gameState.puzzleStates.entranceDoorUnlocked) return false;
              if (hint.id === 'inside' && playerHas('note')) return false;
              if (hint.id === 'workshop_search' && gameState.flags.searchedWorkbench) return false;
              if (hint.id === 'gear_hunt' && playerHas('gear')) return false;
              if (hint.id === 'dome_mech_use_gear' && gameState.puzzleStates.domeDoorOpen) return false;
              if (hint.id === 'lens_hunt' && playerHas('lens')) return false;
              if (hint.id === 'telescope_use_lens' && gameState.puzzleStates.telescopeReady) return false;
              if (hint.id === 'final_puzzle' && gameState.puzzleStates.finalPuzzleSolved) return false;
              // Add more conditions for other hints if needed
              return true; // Keep hint if no solved condition met
         });


         // Try to find a hint matching current location and condition
         for (const hint of relevantHints) {
             let locationMatch = !hint.triggeredByLocation || hint.triggeredByLocation === gameState.player.location;
             let conditionMatch = !hint.condition || hint.condition();

             if (locationMatch && conditionMatch) {
                 displayOutput(`Hint (${gameState.hintsUsed + 1}/${gameState.maxHints}): ${hint.text}`, 'game-hint');
                 gameState.hintsUsed++;
                 providedHint = true;
                 break;
             }
         }

          // If no location-specific hint found, try condition-only hints from remaining relevant ones
          if (!providedHint) {
              for (const hint of relevantHints) {
                  let conditionMatch = !hint.condition || hint.condition();
                   if (!hint.triggeredByLocation && conditionMatch) { // Only condition based hints
                       displayOutput(`Hint (${gameState.hintsUsed + 1}/${gameState.maxHints}): ${hint.text}`, 'game-hint');
                       gameState.hintsUsed++;
                       providedHint = true;
                       break;
                   }
              }
          }


         if (!providedHint) {
             displayOutput("I don't have a specific hint for you right now. Try exploring, examining things you haven't looked at, or searching areas.", 'game-info');
         }
     }


    // --- Public Interface ---
    return {
        start: start,
        processCommand: parseCommand,
        isActive: () => gameState.isActive
    };
})(); // Immediately Invoked Function Expression (IIFE) to create the module

// --- Debug log to confirm execution ---
console.log("Game.js finished executing. Typeof game:", typeof game, game);
// --- END FILE: js/game.js --- (COMPLETE CORRECT VERSION - Feb 29)
