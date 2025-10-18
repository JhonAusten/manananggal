// Input handling with audio initialization and running state
let userInteracted = false;

function initializeAudioOnInteraction() {
    if (!userInteracted) {
        audioManager.init();
        audioManager.startBackgroundMusic();
        userInteracted = true;
        console.log('User interaction detected, audio enabled');
    }
}

document.addEventListener('keydown', (e) => {
    initializeAudioOnInteraction();
    
    gameState.keys[e.key.toLowerCase()] = true;
    
    if (e.shiftKey && !gameState.isRunning) {
        gameState.moveSpeed = 7;
        gameState.isRunning = true;
        characterAnimator.resetAnimation();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key.toLowerCase()] = false;
    
    if (!e.shiftKey && gameState.isRunning) {
        gameState.moveSpeed = 4;
        gameState.isRunning = false;
        characterAnimator.resetAnimation();
    }
});
document.addEventListener('click', (e) => {
    initializeAudioOnInteraction();
    
    if (!gameState.gameRunning) return;
    
    // Calculate angle from character to mouse
    const characterCenterX = gameState.character.x + 31;
    const characterCenterY = gameState.character.y + 65;
    const dx = e.clientX - characterCenterX;
    const dy = e.clientY - characterCenterY;
    const angle = Math.atan2(dy, dx);
    
    waveSystem.shoot(characterCenterX, characterCenterY, angle);
});

document.addEventListener('click', initializeAudioOnInteraction);
document.addEventListener('touchstart', initializeAudioOnInteraction);