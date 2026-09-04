// mini-games.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let animationId;
let frameCount = 0;
let spideyY = 200;
let velocity = 0;
const gravity = 0.6;
const obstacles = [];
const enemyTypes = ["Car", "Bird", "Monster"];
let jumpHandler; 

// Weather particles array
let particles = [];

function setupWeather(weatherType) {
    particles = [];
    let count = 50;
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: weatherType === 'Rain' ? Math.random() * 5 + 10 : Math.random() * 2 + 1,
            size: weatherType === 'Snow' ? Math.random() * 4 + 2 : 2
        });
    }
}

function drawWeather(weatherType) {
    ctx.fillStyle = weatherType === 'Rain' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    
    particles.forEach(p => {
        ctx.beginPath();
        if (weatherType === 'Rain') {
            ctx.fillRect(p.x, p.y, 2, 10); // Vertical raindrops
            p.y += p.speed;
            p.x -= 1;
        } else if (weatherType === 'Snow') {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // Snowflakes
            ctx.fill();
            p.y += p.speed;
            p.x += Math.sin(p.y / 20); // Gentle drift
        } else {
            // Clouds / Fog or default overlay
            ctx.fillStyle = 'rgba(200, 200, 200, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Reset particle to top if it goes off screen
        if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
        }
    });
}

function startMiniGame(onCrashCallback, weatherType) {
    window.gameActive = true;
    frameCount = 0;
    spideyY = 200;
    velocity = 0;
    obstacles.length = 0; 
    
    setupWeather(weatherType);
    
    // Jump mechanic when any key is pressed
    jumpHandler = () => {
        velocity = -8; 
    };
    window.addEventListener("keydown", jumpHandler);

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw Weather Effects based on API Data
        drawWeather(weatherType);

        // 2. Physics for Spider-Man (Red Square)
        velocity += gravity;
        spideyY += velocity;
        
        // Keep Spidey on screen
        if (spideyY > canvas.height - 30) spideyY = canvas.height - 30; 
        if (spideyY < 0) {
            spideyY = 0;
            velocity = 0;
        }
        
        // Draw Spidey
        ctx.fillStyle = "#e23636"; 
        ctx.fillRect(50, spideyY, 30, 30);
        
        // Generate random obstacles every 90 frames
        if (frameCount % 90 === 0) {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const height = Math.random() * 250 + 20;
            obstacles.push({ x: canvas.width, y: height, type: type, width: 40, height: 40 });
        }
        
        // Move and draw obstacles
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= (6 + frameCount / 500); 
            
            if (obs.type === "Car") {
                ctx.fillStyle = "#ffeb3b"; 
                obs.y = canvas.height - 40;
                ctx.fillRect(obs.x, obs.y, 60, 30);
                obs.width = 60; obs.height = 30;
            } else if (obs.type === "Bird") {
                ctx.fillStyle = "#0033cc"; 
                ctx.fillRect(obs.x, obs.y, 30, 20);
                obs.width = 30; obs.height = 20;
            } else {
                ctx.fillStyle = "#00ff00"; 
                ctx.fillRect(obs.x, obs.y, 40, 40);
            }
            
            // Collision Detection
            if (
                50 < obs.x + obs.width &&
                80 > obs.x &&
                spideyY < obs.y + obs.height &&
                spideyY + 30 > obs.y
            ) {
                window.gameActive = false;
                window.removeEventListener("keydown", jumpHandler);
                cancelAnimationFrame(animationId);
                onCrashCallback(); 
                return;
            }
        }
        
        // Draw Score and Weather UI
        ctx.fillStyle = "white";
        ctx.font = "16px Courier New";
        ctx.fillText(`Weather: ${weatherType} | Score: ${Math.floor(frameCount / 10)}`, 10, 30);
        
        frameCount++;
        animationId = requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}