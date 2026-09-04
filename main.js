// main.js

let currentLevel = 1;

// 1. Initialize the map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

const spideyIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1090/1090806.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});

let spideyMarker = null;
let currentGameWeather = 'Clear'; 

// SECURE API CALL: Fetches weather through our own backend /api/weather route
async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        return data.weather ? data.weather[0].main : 'Clear';
    } catch (error) {
        console.error("Weather fetch failed, defaulting to Clear sky.", error);
        return 'Clear';
    }
}

// 2. Place Spidey and check the local weather via backend
async function placeSpidey() {
    // Lat bounds: 8.4 to 37.6, Lng bounds: 68.7 to 97.2
    const randomLat = Math.random() * (37.6 - 8.4) + 8.4;
    const randomLng = Math.random() * (97.2 - 68.7) + 68.7;

    if (spideyMarker) {
        spideyMarker.setLatLng([randomLat, randomLng]);
    } else {
        spideyMarker = L.marker([randomLat, randomLng], { icon: spideyIcon }).addTo(map);
        
        spideyMarker.on('click', () => {
            document.getElementById('map').classList.add('hidden');
            document.getElementById('ui-container').classList.add('hidden');
            
            if (currentLevel === 1) {
                document.getElementById('game-container').classList.remove('hidden');
                // Pass the real-world weather into our game!
                startMiniGame(resetToMap, currentGameWeather); 
            } else if (currentLevel === 2) {
                document.getElementById('gesture-container').classList.remove('hidden');
                startGestureGame(triggerFinale);
            }
        });
    }
    
    spideyMarker.bindPopup("<b>Hey web-head!</b><br>Hacking local weather satellites...").openPopup();
    map.setView([randomLat, randomLng], 5);
    
    // Trigger the secure backend fetch
    currentGameWeather = await fetchWeather(randomLat, randomLng);
    spideyMarker.setPopupContent(`<b>Hey web-head!</b><br>Current weather here: ${currentGameWeather}<br>Click to start!`);
}

placeSpidey();

// 3. Called when you crash in Level 1
function resetToMap() {
    currentLevel = 2; 
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('map').classList.remove('hidden');
    document.getElementById('ui-container').classList.remove('hidden');
    document.getElementById('instructions').innerText = "Spidey got away! Find his NEW location for the Webcam Game!";
    
    placeSpidey(); 
}

// 4. The Finale Animation
function triggerFinale() {
    document.getElementById('gesture-container').classList.add('hidden');
    document.getElementById('finale-container').classList.add('hidden');
    document.getElementById('finale-container').classList.remove('hidden');
    
    renderVirtualKeyboard();
    
    const spidey = document.getElementById('spidey-sprite');
    spidey.classList.remove('hidden');
    
    const keys = document.querySelectorAll('.key');
    if (keys.length === 0) return;

    let currentIndex = 0;
    
    setInterval(() => {
        keys.forEach(k => k.classList.remove('active'));
        
        const currentKey = keys[currentIndex];
        currentKey.classList.add('active');
        
        const keyRect = currentKey.getBoundingClientRect();
        const containerRect = document.getElementById('finale-container').getBoundingClientRect();
        
        spidey.style.left = (keyRect.left - containerRect.left + 15) + 'px';
        spidey.style.top = (keyRect.top - containerRect.top - 60) + 'px';
        
        if (typeof playCrazyVoice === "function") playCrazyVoice();
        
        currentIndex++;
        if (currentIndex >= keys.length) {
            currentIndex = 0; 
        }
    }, 600);
}