// Mobile Controls System
const mobileControls = {
    joystick: null,
    joystickBase: null,
    joystickHandle: null,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    maxDistance: 50,

    init() {
        if (!this.isMobile()) return;

        // Create control container
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'mobileControls';
        controlsDiv.className = 'mobile-controls';
        controlsDiv.innerHTML = `
            <div class="joystick-container">
                <div class="joystick-base" id="joystickBase">
                    <div class="joystick-handle" id="joystickHandle"></div>
                </div>
            </div>
            <div class="mobile-buttons">
                <button class="mobile-btn pause-mobile-btn" id="pauseMobileBtn">⏸</button>
                <button class="mobile-btn fire-btn" id="fireBtn">🔥</button>
            </div>
        `;
        document.body.appendChild(controlsDiv);

        // Get references
        this.joystickBase = document.getElementById('joystickBase');
        this.joystickHandle = document.getElementById('joystickHandle');

        // Setup joystick events
        this.setupJoystick();
        this.setupButtons();

        // Force landscape orientation prompt
        this.checkOrientation();
        window.addEventListener('resize', () => this.checkOrientation());

        console.log('Mobile controls initialized');
    },

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || window.innerWidth <= 768;
    },

    setupJoystick() {
        // Touch start
        this.joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            const rect = this.joystickBase.getBoundingClientRect();
            this.startX = rect.left + rect.width / 2;
            this.startY = rect.top + rect.height / 2;
        });

        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const touch = e.touches[0];
            const deltaX = touch.clientX - this.startX;
            const deltaY = touch.clientY - this.startY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const limitedDistance = Math.min(distance, this.maxDistance);

            if (distance > 0) {
                this.currentX = (deltaX / distance) * limitedDistance;
                this.currentY = (deltaY / distance) * limitedDistance;
            }

            // Update handle position
            this.joystickHandle.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;

            // Update game state keys
            this.updateGameKeys();
        });

        // Touch end
        document.addEventListener('touchend', (e) => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            this.currentX = 0;
            this.currentY = 0;

            // Reset handle position
            this.joystickHandle.style.transform = 'translate(0, 0)';

            // Clear all movement keys
            gameState.keys['w'] = false;
            gameState.keys['a'] = false;
            gameState.keys['s'] = false;
            gameState.keys['d'] = false;
        });
    },

    updateGameKeys() {
        const threshold = 15;

        // Reset all keys
        gameState.keys['w'] = false;
        gameState.keys['a'] = false;
        gameState.keys['s'] = false;
        gameState.keys['d'] = false;

        // Set keys based on joystick position
        if (this.currentY < -threshold) gameState.keys['w'] = true;
        if (this.currentY > threshold) gameState.keys['s'] = true;
        if (this.currentX < -threshold) gameState.keys['a'] = true;
        if (this.currentX > threshold) gameState.keys['d'] = true;
    },

    setupButtons() {
        // Fire button
        const fireBtn = document.getElementById('fireBtn');
        fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            if (!gameState.gameRunning) return;

            // Fire in the direction character is facing or towards center
            const characterCenterX = gameState.character.x + 31;
            const characterCenterY = gameState.character.y + 65;
            const targetX = window.innerWidth / 2;
            const targetY = window.innerHeight / 2;
            
            const dx = targetX - characterCenterX;
            const dy = targetY - characterCenterY;
            const angle = Math.atan2(dy, dx);
            
            waveSystem.shoot(characterCenterX, characterCenterY, angle);
        });

        // Pause button
        const pauseBtn = document.getElementById('pauseMobileBtn');
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameState.gameRunning && !pauseMenu.isPaused) {
                pauseMenu.pause();
            } else if (pauseMenu.isPaused) {
                pauseMenu.resume();
            }
        });
    },

    checkOrientation() {
        const orientationWarning = document.getElementById('orientationWarning');
        
        if (this.isMobile()) {
            if (window.innerHeight > window.innerWidth) {
                // Portrait mode - show warning
                if (!orientationWarning) {
                    const warning = document.createElement('div');
                    warning.id = 'orientationWarning';
                    warning.className = 'orientation-warning';
                    warning.innerHTML = `
                        <div class="orientation-content">
                            <div class="rotate-icon">📱 ↻</div>
                            <h2>Please Rotate Your Device</h2>
                            <p>This game is best played in landscape mode</p>
                        </div>
                    `;
                    document.body.appendChild(warning);
                }
            } else {
                // Landscape mode - hide warning
                if (orientationWarning) {
                    orientationWarning.remove();
                }
            }
        }
    },

    hide() {
        const controls = document.getElementById('mobileControls');
        if (controls) controls.style.display = 'none';
    },

    show() {
        const controls = document.getElementById('mobileControls');
        if (controls) controls.style.display = 'flex';
    }
};

// Expose to global scope
window.mobileControls = mobileControls;