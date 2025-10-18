// Game state management
let gameState = {
    character: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    machetes: [],
    manananggals: [],
    powerBuffs: [],
    macheteBuffs: [],
    waveBufls: [],
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

character.style.left = gameState.character.x + 'px';
character.style.top = gameState.character.y + 'px';

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
function spawnWaveBuff() {
    if (gameState.gameRunning && gameState.waveBufls.length < 2) {
        gameState.waveBufls.push(new WaveBuff());
    }
}

// Enhanced character movement with sprite animation
function updateCharacter() {
    if (!gameState.gameRunning) return;

    let newX = gameState.character.x;
    let newY = gameState.character.y;
    let moving = false;
    let facingRight = true; // Track direction

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
        facingRight = false; // Facing left
    }
    if (gameState.keys['arrowright'] || gameState.keys['d']) {
        newX += gameState.moveSpeed;
        moving = true;
        facingRight = true; // Facing right
    }

    if (newX >= 0 && newX <= window.innerWidth - 62) gameState.character.x = newX;
    if (newY >= 0 && newY <= window.innerHeight - 130) gameState.character.y = newY;

    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';

    let newState = 'idle';
    if (moving) {
        newState = gameState.isRunning ? 'running' : 'walking';
    }

    if (newState !== gameState.characterState) {
        gameState.characterState = newState;
        characterAnimator.resetAnimation();
    }

    // Update character animation with direction
    characterAnimator.updateAnimation(character, gameState.characterState, facingRight);

    gameState.isMoving = moving;
}

// Enhanced game loop with comprehensive audio integration
function gameLoop() {
    if (!gameState.gameRunning) return;

    updateCharacter();

    gameState.machetes.forEach(machete => machete.update());

    for (let mIndex = gameState.manananggals.length - 1; mIndex >= 0; mIndex--) {
        const manananggal = gameState.manananggals[mIndex];
        manananggal.update();

        if (manananggal.checkCollisionWithCharacter()) {
            gameOver();
            return;
        }

        for (let bIndex = gameState.machetes.length - 1; bIndex >= 0; bIndex--) {
            const machete = gameState.machetes[bIndex];
            if (machete.checkCollision(manananggal)) {
                audioManager.play('macheteHit');
                
                machete.durability -= 8;
                
                audioManager.play('monsterDeath');
                manananggal.destroy();
                gameState.manananggals.splice(mIndex, 1);
                gameState.kills++;
                gameState.score += 15;

                if (machete.durability <= 0) {
                    machete.destroy();
                    gameState.machetes.splice(bIndex, 1);
                    gameState.macheteCount--;
                    
                    if (gameState.machetes.length === 0) {
                        gameOver();
                        return;
                    }
                }
                break;
            }
        }
    }

    for (let index = gameState.powerBuffs.length - 1; index >= 0; index--) {
        const buff = gameState.powerBuffs[index];
        if (buff.checkCollision()) {
            audioManager.play('powerupCollect');
            
            buff.destroy();
            gameState.powerBuffs.splice(index, 1);
            
            gameState.machetes.forEach(machete => {
                machete.durability = Math.min(machete.durability + 60, 100);
            });
            gameState.score += 8;
        }
    }

    for (let index = gameState.macheteBuffs.length - 1; index >= 0; index--) {
        const buff = gameState.macheteBuffs[index];
        if (buff.checkCollision()) {
            audioManager.play('powerupCollect');
            
            buff.destroy();
            gameState.macheteBuffs.splice(index, 1);
            
            const angle = Math.random() * Math.PI * 2;
            gameState.machetes.push(new Machete(gameState.character.x, gameState.character.y, angle, 100));
            gameState.macheteCount++;
            gameState.score += 20;
        }
    }
    // Check wave buff collisions
for (let index = gameState.powerBuffs.length - 1; index >= 0; index--) {
    const buff = gameState.powerBuffs[index];
    if (buff.checkCollision()) {
        audioManager.play('powerupCollect');
        buff.destroy();
        gameState.powerBuffs.splice(index, 1);
        gameState.score += 8;
    }
}

// Check wave buff collisions
for (let index = gameState.waveBufls.length - 1; index >= 0; index--) {
    const buff = gameState.waveBufls[index];
    if (buff.checkCollision()) {
        audioManager.play('powerupCollect');
        buff.destroy();
        gameState.waveBufls.splice(index, 1);
        waveSystem.addBullets(5);
        gameState.score += 25;
    }
}

// Update sword waves
waveSystem.updateWaves();

    updateHUD();
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

function startSpawning() {
    gameState.spawnIntervals.forEach(interval => clearInterval(interval));
    gameState.spawnIntervals = [];

    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnManananggal();
        }
    }, 1500 + Math.random() * 1500));

    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnPowerBuff();
        }
    }, 6000 + Math.random() * 4000));

    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnMacheteBuff();
        }
    }, 12000 + Math.random() * 6000));

    // Spawn wave buffs every 15-20 seconds
    gameState.spawnIntervals.push(setInterval(() => {
        if (gameState.gameRunning) {
            spawnWaveBuff();
        }
    }, 15000 + Math.random() * 5000));
    
    console.log('Spawning intervals started');
}

window.addEventListener('resize', () => {
    if (gameState.character.x > window.innerWidth - 62) {
        gameState.character.x = window.innerWidth - 62;
    }
    if (gameState.character.y > window.innerHeight - 130) {
        gameState.character.y = window.innerHeight - 130;
    }
    character.style.left = gameState.character.x + 'px';
    character.style.top = gameState.character.y + 'px';
});