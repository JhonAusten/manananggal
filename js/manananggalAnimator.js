// Manananggal animation system
const manananggalAnimator = {
    frameWidth: 125,
    frameHeight: 126,
    totalFrames: 17,
    animationSpeed: 8,
    
    // Track animation state for each manananggal instance
    animations: new WeakMap(),

    initializeAnimation(manananggalElement) {
        if (!this.animations.has(manananggalElement)) {
            this.animations.set(manananggalElement, {
                currentFrame: 0,
                frameCounter: 0
            });
        }
    },

    updateAnimation(manananggalElement, facingRight = true) {
        if (!window.assetStatus || !window.assetStatus['Manananggal']) return;

        this.initializeAnimation(manananggalElement);
        const state = this.animations.get(manananggalElement);

        state.frameCounter++;
        
        if (state.frameCounter >= this.animationSpeed) {
            state.currentFrame = (state.currentFrame + 1) % this.totalFrames;
            state.frameCounter = 0;
        }

        const xOffset = -state.currentFrame * this.frameWidth;
        
        manananggalElement.style.backgroundImage = "url('assets/images/monsters/manananggal.png')";
        manananggalElement.style.backgroundPosition = `${xOffset}px 0px`;
        manananggalElement.style.backgroundSize = `${this.frameWidth * this.totalFrames}px ${this.frameHeight}px`;
        manananggalElement.style.backgroundRepeat = 'no-repeat';

        // Apply horizontal flip if facing left
        if (!facingRight) {
            manananggalElement.style.transform = 'scaleX(-1)';
        } else {
            manananggalElement.style.transform = 'scaleX(1)';
        }
    },

    resetAnimation(manananggalElement) {
        if (this.animations.has(manananggalElement)) {
            const state = this.animations.get(manananggalElement);
            state.currentFrame = 0;
            state.frameCounter = 0;
        }
    }
};