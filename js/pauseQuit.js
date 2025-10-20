// Pause and Quit System
const pauseMenu = {
    isPaused: false,

    init() {
        // Create pause menu HTML
        const pauseMenuDiv = document.createElement('div');
        pauseMenuDiv.id = 'pauseMenu';
        pauseMenuDiv.className = 'pause-menu';
        pauseMenuDiv.style.display = 'none';
        pauseMenuDiv.innerHTML = `
            <div class="pause-container">
                <div class="pause-title">PAUSED</div>
                <div class="menu-controls">
                    <h3>How to Play</h3>
                    <ul>
                        <li>WASD / Arrow Keys - Move</li>
                        <li>Shift - Run</li>
                        <li>Left Mouse Click - Shoot Wave Attack</li>
                        <li>ESC - Pause</li>
                        <li>Avoid the Manananggal!</li>
                    </ul>
                </div>
                <div class="pause-buttons">
                    <button class="pause-btn resume-btn" onclick="pauseMenu.resume()">RESUME</button>
                    <button class="pause-btn quit-btn" onclick="pauseMenu.confirmQuit()">QUIT</button>
                </div>
            </div>
        `;
        document.body.appendChild(pauseMenuDiv);

        // Create quit confirmation dialog
        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'quitConfirm';
        confirmDiv.className = 'quit-confirm';
        confirmDiv.style.display = 'none';
        confirmDiv.innerHTML = `
            <div class="confirm-container">
                <div class="confirm-title">Quit Game?</div>
                <div class="confirm-message">Your progress will be lost!</div>
                <div class="confirm-buttons">
                    <button class="confirm-btn yes-btn" onclick="pauseMenu.quit()">YES, QUIT</button>
                    <button class="confirm-btn no-btn" onclick="pauseMenu.resume()">NO, CONTINUE</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmDiv);

        // Add keyboard shortcut for pause
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && gameState.gameRunning && !pauseMenu.isPaused) {
                pauseMenu.pause();
            }
        });

        console.log('Pause menu initialized');
    },

    pause() {
        if (!gameState.gameRunning || pauseMenu.isPaused) return;

        pauseMenu.isPaused = true;
        gameState.gameRunning = false;
        audioManager.stopBackgroundMusic();

        document.getElementById('pauseMenu').style.display = 'flex';
        console.log('Game paused');
    },

    resume() {
        if (!pauseMenu.isPaused) return;

        pauseMenu.isPaused = false;
        gameState.gameRunning = true;
        audioManager.startBackgroundMusic();

        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('quitConfirm').style.display = 'none';
        console.log('Game resumed');
    },

    confirmQuit() {
        document.getElementById('quitConfirm').style.display = 'flex';
    },

    quit() {
        // Trigger game over (surrender)
        pauseMenu.isPaused = false;
        gameState.gameRunning = false;
        audioManager.stopBackgroundMusic();

        // Hide pause menus
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('quitConfirm').style.display = 'none';

        // Show game over screen
        gameOver();

        console.log('Player surrendered');
    }
};

// Expose to global scope
window.pauseMenu = pauseMenu;