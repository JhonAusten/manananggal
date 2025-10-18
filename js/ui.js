// UI and Game Over functions
async function gameOver() {
    gameState.gameRunning = false;
    
    audioManager.stopBackgroundMusic();
    
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];
    
    const survivalTime = scoreManager.formatSurvivalTime(gameState.gameStartTime);
    
    document.getElementById('finalScore').textContent = Math.floor(gameState.score);
    document.getElementById('finalKills').textContent = gameState.kills;
    document.getElementById('finalMachetes').textContent = gameState.macheteCount;
    document.getElementById('finalSurvivalTime').textContent = survivalTime;
    
    document.getElementById('gameOver').style.display = 'block';
    
    console.log(`Game Over! Final Score: ${Math.floor(gameState.score)}, Kills: ${gameState.kills}, Machetes: ${gameState.macheteCount}`);
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
    const leaderboardContainer = document.getElementById('leaderboardList');
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
                    <span class="time">${entry.survivalTime}</span>
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
    gameState.machetes.forEach(machete => machete.destroy());
    gameState.manananggals.forEach(manananggal => manananggal.destroy());
    gameState.powerBuffs.forEach(buff => buff.destroy());
    gameState.macheteBuffs.forEach(buff => buff.destroy());
    
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));

    gameState = {
        character: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        machetes: [],
        manananggals: [],
        powerBuffs: [],
        macheteBuffs: [],
        macheteCount: 1,
        durability: 100,
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

    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
    
    characterAnimator.resetAnimation();
    characterAnimator.updateAnimation(character, 'idle');

    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('scoreSubmissionForm').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'none';
    
    const submitButton = document.getElementById('submitScoreBtn');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Score';
    }
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        playerNameInput.value = '';
    }

    if (userInteracted) {
        audioManager.startBackgroundMusic();
    }

    createInitialMachetes();
    startSpawning();
    
    console.log('Game restarted');
}

window.restartGame = restartGame;
window.submitScoreToSheet = submitScoreToSheet;
window.showLeaderboard = showLeaderboard;