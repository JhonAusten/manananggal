// UI and Game Over functions
async function gameOver() {
    gameState.gameRunning = false;
    audioManager.stopBackgroundMusic();
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];

    // Start death animation
    const character = document.getElementById('character');
    deathAnimation.start(character, () => {
        // Show game over screen after animation completes
        showGameOverScreen();
    });
}

function showGameOverScreen() {
    const survivalTime = scoreManager.formatSurvivalTime(gameState.gameStartTime);
    
    document.getElementById('finalScore').textContent = Math.floor(gameState.score);
    document.getElementById('finalKills').textContent = gameState.kills;
    document.getElementById('finalMachetes').textContent = gameState.macheteCount;
    document.getElementById('finalSurvivalTime').textContent = survivalTime;
    
    document.getElementById('gameOver').style.display = 'block';
    
    console.log(`Game Over! Final Score: ${Math.floor(gameState.score)}, Kills: ${gameState.kills}`);
}

async function submitScoreToSheet() {
    const playerNameInput = document.getElementById('playerNameInput');
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    
    const submitButton = document.getElementById('submitScoreBtn');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    try {
        const scoreData = {
            playerName: playerName,
            score: Math.floor(gameState.score),
            kills: gameState.kills,
            macheteCount: gameState.macheteCount,
            survivalTime: scoreManager.formatSurvivalTime(gameState.gameStartTime)
        };
        
        const success = await scoreManager.submitScore(scoreData);
        
        if (success) {
            showLeaderboard();
            document.getElementById('scoreSubmissionForm').style.display = 'none';
            document.getElementById('leaderboardSection').style.display = 'block';
        } else {
            alert('Failed to submit score. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Score';
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        alert('Failed to submit score. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Score';
    }
}

async function showLeaderboard() {
    const scoreForm = document.getElementById('scoreSubmissionForm');
    const leaderboardSection = document.getElementById('leaderboardSection');
    const leaderboardContainer = document.getElementById('leaderboardList');
    
    // Hide form, show leaderboard section
    scoreForm.style.display = 'none';
    leaderboardSection.style.display = 'block';
    
    leaderboardContainer.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    
    try {
        const leaderboard = await scoreManager.getLeaderboard(10);
        
        if (leaderboard.length === 0) {
            leaderboardContainer.innerHTML = '<div class="no-scores">No scores available yet.</div>';
            return;
        }
        
        let leaderboardHTML = '';
        leaderboard.forEach(entry => {
            const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
            leaderboardHTML += `
                <div class="leaderboard-entry rank-${entry.rank}">
                    <span class="rank">${medal}</span>
                    <span class="player-name">${entry.playerName}</span>
                    <span class="score">${entry.score}</span>
                    <span class="kills">${entry.kills} kills</span>
                    <span class="machetes">${entry.macheteCount} 🔪</span>
                    <span class="time"></span>
                </div>
            `;
        });
        
        leaderboardContainer.innerHTML = leaderboardHTML;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardContainer.innerHTML = '<div class="error">Failed to load leaderboard.</div>';
    }
}

function restartGame() {
    deathAnimation.stop();
    
    // COMPLETELY clear the game area of all DOM elements
    const gameArea = document.getElementById('gameArea');
    const allElements = gameArea.querySelectorAll('.machete, .manananggal, .power-buff, .machete-buff, .wave-buff, .sword-wave');
    allElements.forEach(el => el.remove());
    
    // Destroy all game entities (clear arrays)
    gameState.machetes = [];
    gameState.manananggals = [];
    gameState.powerBuffs = [];
    gameState.macheteBuffs = [];
    gameState.waveBufls = [];
    
    // Clear wave system
    if (typeof waveSystem !== 'undefined' && waveSystem.reset) {
        waveSystem.reset();
    }
    
    // Clear all spawn intervals
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];

    // Reset game state
    gameState = {
        character: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        machetes: [],
        manananggals: [],
        powerBuffs: [],
        macheteBuffs: [],
        waveBufls: [],
        macheteCount: 1,
        durability: 50,
        score: 0,
        kills: 0,
        gameRunning: true,
        keys: {},
        moveSpeed: 4,
        isMoving: false,
        isRunning: false,
        spawnIntervals: [],
        characterState: 'idle',
        gameStartTime: Date.now(),
        playerName: ''
    };

    // Reset character position
    const character = document.getElementById('character');
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
    character.style.backgroundImage = "url('assets/images/characters/character-idle.png')";
    
    characterAnimator.resetAnimation();
    characterAnimator.updateAnimation(character, 'idle', true);

    // Hide game over screen, show form
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('scoreSubmissionForm').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'none';
    
    // Reset form
    const submitButton = document.getElementById('submitScoreBtn');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Score';
    }
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        playerNameInput.value = '';
    }

    // Resume music
    if (typeof userInteracted !== 'undefined' && userInteracted) {
        audioManager.startBackgroundMusic();
    }

    // Restart spawning systems
    createInitialMachetes();
    startSpawning();
    
    console.log('Game restarted - all entities cleared');
}
function backToMenuFromGameOver() {
    // Clear all game intervals
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];

    // COMPLETELY clear the game area of all DOM elements
    const gameArea = document.getElementById('gameArea');
    const allElements = gameArea.querySelectorAll('.machete, .manananggal, .power-buff, .machete-buff, .wave-buff, .sword-wave');
    allElements.forEach(el => el.remove());

    // Destroy all entities (clear arrays)
    gameState.machetes = [];
    gameState.manananggals = [];
    gameState.powerBuffs = [];
    gameState.macheteBuffs = [];
    gameState.waveBufls = [];
    
    if (typeof waveSystem !== 'undefined' && waveSystem.reset) {
        waveSystem.reset();
    }

    // Reset game state completely
    gameState = {
        character: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        machetes: [],
        manananggals: [],
        powerBuffs: [],
        macheteBuffs: [],
        waveBufls: [],
        macheteCount: 1,
        durability: 50,
        score: 0,
        kills: 0,
        gameRunning: false,
        keys: {},
        moveSpeed: 4,
        isMoving: false,
        isRunning: false,
        spawnIntervals: [],
        characterState: 'idle',
        gameStartTime: null,
        playerName: ''
    };

    // Reset character
    const character = document.getElementById('character');
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
    character.style.backgroundImage = "url('assets/images/characters/character-idle.png')";
    characterAnimator.resetAnimation();

    gameState.gameRunning = false;
    audioManager.stopBackgroundMusic();

    // Hide game over, show menu
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'flex';

    // Reset menu to main screen
    if (typeof menuScreen !== 'undefined' && menuScreen.backToMenu) {
        menuScreen.backToMenu();
    }

    console.log('Returned to menu - all reset');
}

window.restartGame = restartGame;
window.submitScoreToSheet = submitScoreToSheet;
window.showLeaderboard = showLeaderboard;
window.backToMenuFromGameOver = backToMenuFromGameOver;
