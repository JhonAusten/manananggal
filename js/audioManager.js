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