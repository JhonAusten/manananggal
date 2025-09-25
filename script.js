// Google Sheets integration system
const scoreManager = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwdcgNR7cBl1EaMUqIT_Ke8nOVu4-OYGJTo_nxrTnlaV4IcuQu5DM-21CxmRSrCb7fX/exec',
    
    async submitScore(scoreData) {
        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });
            
            console.log('Score submitted successfully!');
            return true;
        } catch (error) {
            console.error('Failed to submit score:', error);
            return false;
        }
    },

    async getLeaderboard(limit = 10) {
        try {
            const response = await fetch(`${this.scriptUrl}?action=leaderboard&limit=${limit}`);
            const data = await response.json();
            
            if (data.success) {
                return data.leaderboard;
            } else {
                console.error('Failed to fetch leaderboard:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            return [];
        }
    },

    formatSurvivalTime(startTime) {
        if (!startTime) return '0:00';
        
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};

// Audio management system
const audioManager = {
    sounds: {},
    initialized: false,
    volume: {
        effects: 0.7,
        music: 0.3
    },

    init() {
        this.sounds = {
            macheteHit: document.getElementById('macheteHit'),
            monsterDeath: document.getElementById('monsterDeath'),
            powerupCollect: document.getElementById('powerupCollect'),
            backgroundMusic: document.getElementById('backgroundMusic')
        };
        
        // Set volumes
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.volume = this.volume.music;
        }
        
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'backgroundMusic' && this.sounds[key]) {
                this.sounds[key].volume = this.volume.effects;
            }
        });
        
        this.initialized = true;
        console.log('Audio system initialized');
    },

    play(soundName, volume = null) {
        if (!this.initialized) this.init();
        
        if (this.sounds[soundName]) {
            try {
                const sound = this.sounds[soundName];
                if (volume !== null) sound.volume = volume;
                sound.currentTime = 0;
                sound.play().catch(e => {
                    console.log(`Could not play ${soundName}:`, e.message);
                });
            } catch (e) {
                console.log(`Sound ${soundName} not available:`, e);
            }
        }
    },

    startBackgroundMusic() {
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.play().catch(e => {
                console.log('Background music autoplay blocked:', e.message);
            });
        }
    },

    stopBackgroundMusic() {
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.pause();
        }
    }
};

// Asset loading and verification system
const assetChecker = {
    assets: {
        'Character Idle': 'assets/images/characters/character-idle.png',
        'Character Walk': 'assets/images/characters/character-walk.png',
        'Character Run': 'assets/images/characters/character-run.png',
        'Manananggal': 'assets/images/monsters/manananggal.png',
        'Machete': 'assets/images/weapons/machete.png',
        'Background': 'assets/images/backgrounds/night-sky.png',
        'HUD Panel': 'assets/images/ui/hud-panel.png',
        'Power Buff': 'assets/images/ui/power-buff.png',
        'Machete Buff': 'assets/images/ui/machete-buff.png'
    },

    checkImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve(true);
            };
            img.onerror = () => {
                resolve(false);
            };
            img.src = src;
            // Timeout after 3 seconds
            setTimeout(() => resolve(false), 3000);
        });
    },

    async checkAssets() {
        const statusElement = document.getElementById('assetStatus');
        const loadingElement = document.getElementById('loadingIndicator');
        
        if (loadingElement) loadingElement.style.display = 'block';
        
        const status = {};
        let loadedCount = 0;
        const totalAssets = Object.keys(this.assets).length;

        for (const [name, path] of Object.entries(this.assets)) {
            status[name] = await this.checkImage(path);
            if (status[name]) loadedCount++;
            
            // Update status display
            this.updateDebugInfo(status, loadedCount, totalAssets);
        }

        // Apply sprite-loaded classes to elements with successful sprites
        this.applySpriteClasses(status);
        
        if (loadingElement) loadingElement.style.display = 'none';
        
        console.log(`Assets loaded: ${loadedCount}/${totalAssets}`);
        return status;
    },

    applySpriteClasses(status) {
        // Apply sprite-loaded class to character if sprite loaded
        const character = document.getElementById('character');
        if (status['Character Idle'] && character) {
            character.classList.add('sprite-loaded');
        }

        // Apply to machetes when they're created
        window.assetStatus = status;
    },

    updateDebugInfo(status, loadedCount = null, totalAssets = null) {
        const debugElement = document.getElementById('assetStatus');
        if (debugElement) {
            let statusText = '';
            if (loadedCount !== null && totalAssets !== null) {
                statusText += `Loaded: ${loadedCount}/${totalAssets}<br><br>`;
            }
            
            statusText += Object.entries(status)
                .map(([name, loaded]) => {
                    const shortName = name.replace(/^(Character|Manananggal|Machete|Background|HUD|Power|UI)\s*/i, '');
                    return `${shortName}: ${loaded ? '✅' : '❌'}`;
                })
                .join('<br>');
            debugElement.innerHTML = statusText;
        }
    }
};

// Character animation system
const characterAnimator = {
    currentFrame: 0,
    frameWidth: 62,
    frameHeight: 130,
    totalFrames: 10,
    animationSpeed: 10, // frames per animation cycle
    frameCounter: 0,

    updateAnimation(character, state) {
        if (!window.assetStatus) return;

        this.frameCounter++;
        
        // Update frame based on animation speed
        if (this.frameCounter >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.frameCounter = 0;
        }

        // Calculate background position for sprite sheet
        const xOffset = -this.currentFrame * this.frameWidth;
        
        // Set appropriate sprite sheet and animation
        if (state === 'running' && window.assetStatus['Character Run']) {
            character.style.backgroundImage = "url('assets/images/characters/character-run.png')";
            character.style.backgroundPosition = `${xOffset}px 0px`;
            character.style.backgroundSize = `${this.frameWidth * this.totalFrames}px ${this.frameHeight}px`;
        } else if (state === 'walking' && window.assetStatus['Character Walk']) {
            character.style.backgroundImage = "url('assets/images/characters/character-walk.png')";
            character.style.backgroundPosition = `${xOffset}px 0px`;
            character.style.backgroundSize = `${this.frameWidth * this.totalFrames}px ${this.frameHeight}px`;
        } else if (state === 'idle' && window.assetStatus['Character Idle']) {
            // For idle, we might want a slower animation or static frame
            character.style.backgroundImage = "url('assets/images/characters/character-idle.png')";
            character.style.backgroundPosition = `${xOffset}px 0px`;
            character.style.backgroundSize = `${this.frameWidth * 6}px ${this.frameHeight}px`;
        }
    },

    resetAnimation() {
        this.currentFrame = 0;
        this.frameCounter = 0;
    }
};

// Game state management
let gameState = {
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
    gameStartTime: null,
    playerName: ''
};

const character = document.getElementById('character');
const gameArea = document.getElementById('gameArea');

// Initialize character position
character.style.left = gameState.character.x + 'px';
character.style.top = gameState.character.y + 'px';

// Enhanced Machete class with better rotation matching character size
class Machete {
    constructor(x, y, angle, durability = 100) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.radius = 65; // Adjusted to better match character size
        this.speed = 0.08;
        this.durability = durability;
        this.element = this.createElement();
        gameArea.appendChild(this.element);
        
        // Apply sprite-loaded class if machete sprite is available
        if (window.assetStatus && window.assetStatus['Machete']) {
            this.element.classList.add('sprite-loaded');
        }
    }

    createElement() {
        const machete = document.createElement('div');
        machete.className = 'machete';
        return machete;
    }

    update() {
        this.angle += this.speed;
        
        // Center the machete rotation around character center (adjusted for character size)
        const characterCenterX = gameState.character.x + 31; // Half of 62px width
        const characterCenterY = gameState.character.y + 65; // Half of 130px height
        
        this.x = characterCenterX + Math.cos(this.angle) * this.radius;
        this.y = characterCenterY + Math.sin(this.angle) * this.radius;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Rotate machete to face outward from character
        const rotationDegrees = (this.angle * 180 / Math.PI) + 90; // +90 to align properly
        this.element.style.transform = `rotate(${rotationDegrees}deg)`;
    }

    checkCollision(manananggal) {
        const dx = this.x - (manananggal.x + 30);
        const dy = this.y - (manananggal.y + 35);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 35;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Enhanced Manananggal class with sprite integration
class Manananggal {
    constructor() {
        // Spawn from random edge of screen
        const side = Math.random();
        if (side < 0.25) {
            this.x = -70;
            this.y = Math.random() * window.innerHeight;
        } else if (side < 0.5) {
            this.x = window.innerWidth + 70;
            this.y = Math.random() * window.innerHeight;
        } else if (side < 0.75) {
            this.x = Math.random() * window.innerWidth;
            this.y = -70;
        } else {
            this.x = Math.random() * window.innerWidth;
            this.y = window.innerHeight + 70;
        }
        
        this.speed = 1.0 + Math.random() * 0.6;
        this.health = 1;
        this.element = this.createElement();
        gameArea.appendChild(this.element);
        
        // Apply sprite-loaded class if manananggal sprite is available
        if (window.assetStatus && window.assetStatus['Manananggal']) {
            this.element.classList.add('sprite-loaded');
        }
    }

    createElement() {
        const manananggal = document.createElement('div');
        manananggal.className = 'manananggal';
        manananggal.innerHTML = `
            <div class="manananggal-head">
                <div class="manananggal-eyes">
                    <div class="manananggal-eye left"></div>
                    <div class="manananggal-eye right"></div>
                </div>
                <div class="manananggal-mouth"></div>
            </div>
            <div class="manananggal-wing left"></div>
            <div class="manananggal-wing right"></div>
            <div class="manananggal-torso"></div>
            <div class="manananggal-intestines"></div>
        `;
        return manananggal;
    }

    update() {
        // Move toward character center
        const characterCenterX = gameState.character.x + 31;
        const characterCenterY = gameState.character.y + 65;
        const dx = characterCenterX - (this.x + 30);
        const dy = characterCenterY - (this.y + 35);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    checkCollisionWithCharacter() {
        const characterCenterX = gameState.character.x + 31;
        const characterCenterY = gameState.character.y + 65;
        const dx = (this.x + 30) - characterCenterX;
        const dy = (this.y + 35) - characterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 40;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Enhanced Power-up classes with sprite integration
class PowerBuff {
    constructor() {
        this.x = Math.random() * (window.innerWidth - 100) + 50;
        this.y = Math.random() * (window.innerHeight - 100) + 50;
        this.element = this.createElement();
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        gameArea.appendChild(this.element);
    }

    createElement() {
        const buff = document.createElement('div');
        buff.className = 'power-buff';
        // Show emoji fallback if sprite doesn't load
        if (!window.assetStatus || !window.assetStatus['Power Buff']) {
            buff.innerHTML = '⚡';
        }
        return buff;
    }

    checkCollision() {
        const characterCenterX = gameState.character.x + 31;
        const characterCenterY = gameState.character.y + 65;
        const dx = this.x - characterCenterX;
        const dy = this.y - characterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 30;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class MacheteBuff {
    constructor() {
        this.x = Math.random() * (window.innerWidth - 100) + 50;
        this.y = Math.random() * (window.innerHeight - 100) + 50;
        this.element = this.createElement();
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        gameArea.appendChild(this.element);
    }

    createElement() {
        const buff = document.createElement('div');
        buff.className = 'machete-buff';
        // Show emoji fallback if sprite doesn't load
        if (!window.assetStatus || !window.assetStatus['Machete Buff']) {
            buff.innerHTML = '+';
        }
        return buff;
    }

    checkCollision() {
        const characterCenterX = gameState.character.x + 31;
        const characterCenterY = gameState.character.y + 65;
        const dx = this.x - characterCenterX;
        const dy = this.y - characterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 30;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Game initialization functions
function createInitialMachetes() {
    for (let i = 0; i < gameState.macheteCount; i++) {
        const angle = (i / gameState.macheteCount) * Math.PI * 2;
        gameState.machetes.push(new Machete(gameState.character.x, gameState.character.y, angle, gameState.durability));
    }
}

// Spawn functions
function spawnManananggal() {
    if (gameState.gameRunning) {
        gameState.manananggals.push(new Manananggal());
    }
}

function spawnPowerBuff() {
    if (gameState.gameRunning && gameState.powerBuffs.length < 4) {
        gameState.powerBuffs.push(new PowerBuff());
    }
}

function spawnMacheteBuff() {
    if (gameState.gameRunning && gameState.macheteBuffs.length < 3) {
        gameState.macheteBuffs.push(new MacheteBuff());
    }
}

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
    
    // Handle shift key for running
    if (e.shiftKey && !gameState.isRunning) {
        gameState.moveSpeed = 7;
        gameState.isRunning = true;
        // Reset animation when switching states
        characterAnimator.resetAnimation();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key.toLowerCase()] = false;
    
    // Handle shift key release
    if (!e.shiftKey && gameState.isRunning) {
        gameState.moveSpeed = 4;
        gameState.isRunning = false;
        // Reset animation when switching states
        characterAnimator.resetAnimation();
    }
});

document.addEventListener('click', initializeAudioOnInteraction);
document.addEventListener('touchstart', initializeAudioOnInteraction);

// Enhanced character movement with sprite animation
function updateCharacter() {
    if (!gameState.gameRunning) return;

    let newX = gameState.character.x;
    let newY = gameState.character.y;
    let moving = false;

    if (gameState.keys['arrowup'] || gameState.keys['w']) {
        newY -= gameState.moveSpeed;
        moving = true;
    }
    if (gameState.keys['arrowdown'] || gameState.keys['s']) {
        newY += gameState.moveSpeed;
        moving = true;
    }
    if (gameState.keys['arrowleft'] || gameState.keys['a']) {
        newX -= gameState.moveSpeed;
        moving = true;
    }
    if (gameState.keys['arrowright'] || gameState.keys['d']) {
        newX += gameState.moveSpeed;
        moving = true;
    }

    // Boundary checking (adjusted for new character size)
    if (newX >= 0 && newX <= window.innerWidth - 62) gameState.character.x = newX;
    if (newY >= 0 && newY <= window.innerHeight - 130) gameState.character.y = newY;

    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';

    // Update character state and animation
    let newState = 'idle';
    if (moving) {
        newState = gameState.isRunning ? 'running' : 'walking';
    }

    // Update animation state
    if (newState !== gameState.characterState) {
        gameState.characterState = newState;
        characterAnimator.resetAnimation();
    }

    // Update character animation
    characterAnimator.updateAnimation(character, gameState.characterState);

    // Update moving state
    gameState.isMoving = moving;
}

// Enhanced game loop with comprehensive audio integration
function gameLoop() {
    if (!gameState.gameRunning) return;

    updateCharacter();

    // Update machetes
    gameState.machetes.forEach(machete => machete.update());

    // Update manananggals
    for (let mIndex = gameState.manananggals.length - 1; mIndex >= 0; mIndex--) {
        const manananggal = gameState.manananggals[mIndex];
        manananggal.update();

        // Check collision with character
        if (manananggal.checkCollisionWithCharacter()) {
            gameOver();
            return;
        }

        // Check collision with machetes
        for (let bIndex = gameState.machetes.length - 1; bIndex >= 0; bIndex--) {
            const machete = gameState.machetes[bIndex];
            if (machete.checkCollision(manananggal)) {
                // Play hit sound
                audioManager.play('macheteHit');
                
                // Reduce machete durability
                machete.durability -= 8;
                
                // Kill manananggal
                audioManager.play('monsterDeath');
                manananggal.destroy();
                gameState.manananggals.splice(mIndex, 1);
                gameState.kills++;
                gameState.score += 15;

                // Check if machete breaks
                if (machete.durability <= 0) {
                    machete.destroy();
                    gameState.machetes.splice(bIndex, 1);
                    gameState.macheteCount--;
                    
                    if (gameState.machetes.length === 0) {
                        gameOver();
                        return;
                    }
                }
                break; // Exit inner loop since manananggal is destroyed
            }
        }
    }

    // Check power buff collisions
    for (let index = gameState.powerBuffs.length - 1; index >= 0; index--) {
        const buff = gameState.powerBuffs[index];
        if (buff.checkCollision()) {
            // Play pickup sound
            audioManager.play('powerupCollect');
            
            buff.destroy();
            gameState.powerBuffs.splice(index, 1);
            
            // Restore durability to all machetes
            gameState.machetes.forEach(machete => {
                machete.durability = Math.min(machete.durability + 60, 100);
            });
            gameState.score += 8;
        }
    }

    // Check machete buff collisions
    for (let index = gameState.macheteBuffs.length - 1; index >= 0; index--) {
        const buff = gameState.macheteBuffs[index];
        if (buff.checkCollision()) {
            // Play pickup sound
            audioManager.play('powerupCollect');
            
            buff.destroy();
            gameState.macheteBuffs.splice(index, 1);
            
            // Add new machete
            const angle = Math.random() * Math.PI * 2;
            gameState.machetes.push(new Machete(gameState.character.x, gameState.character.y, angle, 100));
            gameState.macheteCount++;
            gameState.score += 20;
        }
    }

    // Update HUD
    updateHUD();

    // Increase score over time
    gameState.score += 0.15;
}

function updateHUD() {
    document.getElementById('macheteCount').textContent = gameState.macheteCount;
    const minDurability = gameState.machetes.length > 0 ? 
        Math.max(0, Math.floor(Math.min(...gameState.machetes.map(m => m.durability)))) : 0;
    document.getElementById('durability').textContent = minDurability;
    document.getElementById('score').textContent = Math.floor(gameState.score);
    document.getElementById('kills').textContent = gameState.kills;
}

async function gameOver() {
    gameState.gameRunning = false;
    
    // Stop background music
    audioManager.stopBackgroundMusic();
    
    // Clear all spawn intervals
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];
    
    // Calculate survival time
    const survivalTime = scoreManager.formatSurvivalTime(gameState.gameStartTime);
    
    // Update final stats display
    document.getElementById('finalScore').textContent = Math.floor(gameState.score);
    document.getElementById('finalKills').textContent = gameState.kills;
    document.getElementById('finalMachetes').textContent = gameState.macheteCount;
    document.getElementById('finalSurvivalTime').textContent = survivalTime;
    
    // Show game over screen with name input
    document.getElementById('gameOver').style.display = 'block';
    
    console.log(`Game Over! Final Score: ${Math.floor(gameState.score)}, Kills: ${gameState.kills}, Machetes: ${gameState.macheteCount}`);
}

async function submitScoreToSheet() {
    const playerNameInput = document.getElementById('playerNameInput');
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    
    // Disable submit button to prevent double submission
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
            // Show success message and load leaderboard
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
    // Clear all game objects
    gameState.machetes.forEach(machete => machete.destroy());
    gameState.manananggals.forEach(manananggal => manananggal.destroy());
    gameState.powerBuffs.forEach(buff => buff.destroy());
    gameState.macheteBuffs.forEach(buff => buff.destroy());
    
    // Clear spawn intervals
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));

    // Reset game state
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

    // Reset character position and sprite
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
    
    // Reset animation
    characterAnimator.resetAnimation();
    characterAnimator.updateAnimation(character, 'idle');

    // Hide game over screen and reset forms
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('scoreSubmissionForm').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'none';
    
    // Reset form elements
    const submitButton = document.getElementById('submitScoreBtn');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Score';
    }
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput) {
        playerNameInput.value = '';
    }

    // Resume background music if user has interacted
    if (userInteracted) {
        audioManager.startBackgroundMusic();
    }

    // Restart game
    createInitialMachetes();
    startSpawning();
    
    console.log('Game restarted');
}

function startSpawning() {
    // Clear any existing intervals first
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];

    // Spawn manananggals every 1.5-3 seconds
    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnManananggal();
        }
    }, 1500 + Math.random() * 1500));

    // Spawn power buffs every 6-10 seconds
    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnPowerBuff();
        }
    }, 6000 + Math.random() * 4000));

    // Spawn machete buffs every 12-18 seconds
    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnMacheteBuff();
        }
    }, 12000 + Math.random() * 6000));
    
    console.log('Spawning intervals started');
}

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust character position if out of bounds (updated for new character size)
    if (gameState.character.x > window.innerWidth - 62) {
        gameState.character.x = window.innerWidth - 62;
    }
    if (gameState.character.y > window.innerHeight - 130) {
        gameState.character.y = window.innerHeight - 130;
    }
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
});

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

// Expose functions globally
window.restartGame = restartGame;
window.submitScoreToSheet = submitScoreToSheet;
window.showLeaderboard = showLeaderboard;
