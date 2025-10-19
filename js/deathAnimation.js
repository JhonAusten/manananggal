// Character death animation system
const deathAnimation = {
    isPlaying: false,
    currentFrame: 0,
    frameWidth: 88,
    frameHeight: 130,
    totalFrames: 7,
    animationSpeed: 16,
    frameCounter: 0,
    character: null,
    onComplete: null,

    start(character, callback) {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.character = character;
        this.onComplete = callback;
        
        // Play death sound
        audioManager.play('characterDeath');
        
        console.log('Death animation started');
    },

    update(character) {
        if (!this.isPlaying) return;

        this.frameCounter++;

        if (this.frameCounter >= this.animationSpeed) {
            this.currentFrame++;
            this.frameCounter = 0;

            // Animation complete
            if (this.currentFrame >= this.totalFrames) {
                this.isPlaying = false;
                if (this.onComplete) {
                    this.onComplete();
                }
                return;
            }
        }

        this.draw(character);
    },

    draw(character) {
        const xOffset = -this.currentFrame * this.frameWidth;
        const yOffset = 0; // Death animation is on row 0
        const scale = 1;
        const displayWidth = this.frameWidth * scale;
        const displayHeight = this.frameHeight * scale;

        character.style.backgroundImage = "url('assets/images/characters/character-death.png')";
        character.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
        character.style.backgroundSize = `${this.frameWidth * this.totalFrames}px ${this.frameHeight}px`;
        character.style.width = `${displayWidth}px`;
        character.style.height = `${displayHeight}px`;
        character.style.transform = 'scaleX(1)';
    },

    stop() {
        this.isPlaying = false;
        this.currentFrame = 0;
        this.frameCounter = 0;
    }
};