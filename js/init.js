// Game initialization sequence
async function initializeGame() {
    console.log('Initializing Enhanced Manananggal Survival Game...');
    
    // Check and load assets first
    await assetChecker.checkAssets();
    
    // Set game start time
    gameState.gameStartTime = Date.now();
    
    // Initialize game objects
    createInitialMachetes();
    startSpawning();
    
    // Start main game loop
    setInterval(gameLoop, 16); // 60fps
    
    console.log('Game initialized successfully!');
    console.log('GOOGLE SHEETS INTEGRATION:');
    console.log('========================');
    console.log('1. Create a Google Apps Script project');
    console.log('2. Copy the provided Google Apps Script code');
    console.log('3. Deploy as web app with permissions set to "Anyone"');
    console.log('4. Replace YOUR_SCRIPT_ID in the scoreManager.scriptUrl');
    console.log('5. Scores will be automatically saved to Google Sheets!');
    console.log('========================');
    console.log('ASSET INTEGRATION GUIDE:');
    console.log('========================');
    console.log('Place your assets in:');
    console.log('• assets/images/characters/ - character sprites (idle, walk, run)');
    console.log('  - Sprite sheets: 10 frames, 62px width x 130px height per frame');
    console.log('  - Total sheet size: 620px width x 130px height');
    console.log('• assets/images/monsters/ - manananggal sprites');
    console.log('• assets/images/weapons/ - machete sprites');
    console.log('• assets/images/ui/ - UI elements and power-ups');
    console.log('• assets/images/backgrounds/ - background images');
    console.log('• assets/audio/effects/ - sound effects (.mp3/.ogg)');
    console.log('• assets/audio/music/ - background music');
    console.log('========================');
    console.log('Controls:');
    console.log('• WASD/Arrow Keys - Move');
    console.log('• Hold Shift - Run (uses run sprite sheet)');
    console.log('========================');
    console.log('The game will automatically use sprites when available and fall back to CSS graphics when missing.');
    console.log('Check the debug panel (bottom-right) to see which assets loaded successfully.');
}

// Start the game when page loads
window.addEventListener('load', initializeGame);