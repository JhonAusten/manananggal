// Character animation system
const characterAnimator = {
    currentFrame: 0,
    frameWidth: 88,
    frameHeight: 130,
    totalFrames: {
        idle: 6,
        walking: 10,
        running: 10
    },
    animationSpeed: 10,
    frameCounter: 0,
    currentState: 'idle',
    facingRight: true,

    updateAnimation(character, state, facingRight = true) {
        if (!window.assetStatus) return;

        this.currentState = state;
        this.facingRight = facingRight;
        const maxFrames = this.totalFrames[state] || 10;

        this.frameCounter++;
        
        if (this.frameCounter >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % maxFrames;
            this.frameCounter = 0;
        }

        const xOffset = -this.currentFrame * this.frameWidth;
        
        if (state === 'running' && window.assetStatus['Character Run']) {
            character.style.backgroundImage = "url('assets/images/characters/character-run.png')";
            character.style.backgroundPosition = `${xOffset}px 0px`;
            character.style.backgroundSize = `${this.frameWidth * this.totalFrames.running}px ${this.frameHeight}px`;
        } else if (state === 'walking' && window.assetStatus['Character Walk']) {
            character.style.backgroundImage = "url('assets/images/characters/character-walk.png')";
            character.style.backgroundPosition = `${xOffset}px 0px`;
            character.style.backgroundSize = `${this.frameWidth * this.totalFrames.walking}px ${this.frameHeight}px`;
        } else if (state === 'idle' && window.assetStatus['Character Idle']) {
            character.style.backgroundImage = "url('assets/images/characters/character-idle.png')";
            character.style.backgroundPosition = `${xOffset}px 0px`;
            character.style.backgroundSize = `${this.frameWidth * this.totalFrames.idle}px ${this.frameHeight}px`;
        }

        // Apply horizontal flip if facing left
        if (!facingRight) {
            character.style.transform = 'scaleX(-1)';
        } else {
            character.style.transform = 'scaleX(1)';
        }
    },

    resetAnimation() {
        this.currentFrame = 0;
        this.frameCounter = 0;
    }
};