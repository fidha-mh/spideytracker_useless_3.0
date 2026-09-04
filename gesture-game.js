// gesture-game.js
const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('gestureCanvas');
const canvasCtx = canvasElement.getContext('2d');

let gestureTargets = [];
let targetsDestroyed = 0;
let gestureGameActive = false;
let gestureWinCallback = null;
let cooldown = 0;

function spawnTarget() {
    gestureTargets.push({
        x: Math.random() * (canvasElement.width - 100) + 50,
        y: Math.random() * (canvasElement.height - 100) + 50,
        radius: 30,
        color: ['#00ff00', '#ffeb3b', '#e23636'][Math.floor(Math.random() * 3)]
    });
}

function onResults(results) {
    if (!gestureGameActive) return;

    // Draw the webcam feed onto the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Draw targets
    gestureTargets.forEach(target => {
        canvasCtx.beginPath();
        canvasCtx.arc(target.x, target.y, target.radius, 0, 2 * Math.PI);
        canvasCtx.fillStyle = target.color;
        canvasCtx.fill();
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = "white";
        canvasCtx.stroke();
    });

    // Check for hands and the "Thwip" gesture
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // MediaPipe Landmarks: 8 (Index Tip), 6 (Index Knuckle), 20 (Pinky Tip), 18 (Pinky Knuckle)
        // 12 (Middle Tip), 10 (Middle Knuckle), 16 (Ring Tip), 14 (Ring Knuckle)
        const isIndexUp = landmarks[8].y < landmarks[6].y;
        const isPinkyUp = landmarks[20].y < landmarks[18].y;
        const isMiddleDown = landmarks[12].y > landmarks[10].y;
        const isRingDown = landmarks[16].y > landmarks[14].y;

        // If Thwip gesture is detected
        if (isIndexUp && isPinkyUp && isMiddleDown && isRingDown && cooldown === 0) {
            // Destroy the oldest target
            if (gestureTargets.length > 0) {
                gestureTargets.shift(); 
                targetsDestroyed++;
                cooldown = 15; // Prevent spamming
                if (typeof playCrazyVoice === "function") playCrazyVoice(); // Play funny voice!
            }
        }
    }

    if (cooldown > 0) cooldown--;

    // Draw Score
    canvasCtx.fillStyle = "white";
    canvasCtx.font = "24px Courier New";
    canvasCtx.fillText(`Targets Destroyed: ${targetsDestroyed} / 5`, 20, 40);
    canvasCtx.restore();

    // Win Condition
    if (targetsDestroyed >= 5) {
        gestureGameActive = false;
        if (gestureWinCallback) gestureWinCallback();
    }
}

// Setup MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});
hands.onResults(onResults);

// Setup Camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});

function startGestureGame(onWinCallback) {
    gestureGameActive = true;
    gestureWinCallback = onWinCallback;
    targetsDestroyed = 0;
    gestureTargets = [];
    
    // Spawn 5 targets over time
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnTarget, i * 1000);
    }
    
    // Start camera (browser will ask for permission)
    camera.start();
}