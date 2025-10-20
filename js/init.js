async function initializeGame() {
    console.log('Initializing Enhanced Manananggal Survival Game...');
    
    // Check and load assets first
    await assetChecker.checkAssets();
    
    // Set game start time
    gameState.gameStartTime = Date.now();
    
    // Reset character element
    const character = document.getElementById('character');
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
    
    // Initialize game objects
    createInitialMachetes();
    startSpawning();
    
    // Initialize pause menu (only once)
    if (!window.pauseMenuInitialized) {
        pauseMenu.init();
        window.pauseMenuInitialized = true;
    }
    
    // Initialize mobile controls (only once)
    if (!window.mobileControlsInitialized) {
        mobileControls.init();
        window.mobileControlsInitialized = true;
    }
    
    // Start game loop (only once)
    if (!window.gameLoopStarted) {
        setInterval(gameLoop, 16); // 60fps
        window.gameLoopStarted = true;
    }
    
    // Set game running
    gameState.gameRunning = true;
    audioManager.startBackgroundMusic();
    
    // Show mobile controls if on mobile
    if (mobileControls.isMobile()) {
        mobileControls.show();
    }
    
    console.log('Game initialized successfully!');
}

function resumeGameFromMenu() {
    console.log('Resuming game from menu...');
    
    // Set game start time
    gameState.gameStartTime = Date.now();
    
    // Reset character element
    const character = document.getElementById('character');
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
    
    // Initialize game objects
    createInitialMachetes();
    startSpawning();
    
    // Set game running
    gameState.gameRunning = true;
    audioManager.startBackgroundMusic();
    
    // Show mobile controls if on mobile
    if (mobileControls.isMobile()) {
        mobileControls.show();
    }
    
    console.log('Game resumed from menu!');
}

// Initialize menu instead of game
window.addEventListener('load', () => {
    menuScreen.init();
});
