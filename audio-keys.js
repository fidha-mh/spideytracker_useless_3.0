// audio-keys.js

// Array to track all the keys you press during the game
const pressedKeysHistory = [];

// The crazy voice lines you requested
const funnySounds = ["fahhhhh", "haaaaa", "oh no", "thwip!", "smash", "boom", "gotcha"];

// Global flag to know when to start listening to keys
window.gameActive = false;

window.addEventListener("keydown", (e) => {
    // Only track keys and make sounds if the mini-game is active
    if (!window.gameActive) return;

    const key = e.key.toUpperCase();

    // Record the key if it is a standard letter or number
    if (key.length === 1 && key.match(/[A-Z0-9]/i)) {
        pressedKeysHistory.push(key);
    }

    // Play a crazy voice sound
    playCrazyVoice();
});

function playCrazyVoice() {
    // Pick a random funny word
    const randomWord = funnySounds[Math.floor(Math.random() * funnySounds.length)];
    
    // Use the browser's built-in Text-to-Speech API to say the word
    const utterance = new SpeechSynthesisUtterance(randomWord);
    
    // Make the voice sound crazy by randomizing pitch and speed
    utterance.pitch = Math.random() * 2;   // Ranges from deep to squeaky
    utterance.rate = 0.8 + Math.random();  // Ranges from slow to fast
    utterance.volume = 1;
    
    // Speak!
    window.speechSynthesis.speak(utterance);
}

// This function will be called during the finale to draw the keys you pressed
function renderVirtualKeyboard() {
    const kbContainer = document.getElementById("virtual-keyboard");
    kbContainer.innerHTML = ""; 
    
    // Filter out duplicates so we just have unique keys to jump on
    const uniqueKeys = [...new Set(pressedKeysHistory)];
    
    // Fallback just in case you won the game without pressing anything
    if (uniqueKeys.length === 0) {
        uniqueKeys.push("W", "E", "B", "S"); 
    }
    
    uniqueKeys.forEach(key => {
        const keyEl = document.createElement("div");
        keyEl.classList.add("key");
        keyEl.id = "key-" + key;
        keyEl.innerText = key;
        kbContainer.appendChild(keyEl);
    });
}