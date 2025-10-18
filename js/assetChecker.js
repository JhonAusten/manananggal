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
            
            this.updateDebugInfo(status, loadedCount, totalAssets);
        }

        this.applySpriteClasses(status);
        
        if (loadingElement) loadingElement.style.display = 'none';
        
        console.log(`Assets loaded: ${loadedCount}/${totalAssets}`);
        return status;
    },

    applySpriteClasses(status) {
        const character = document.getElementById('character');
        if (status['Character Idle'] && character) {
            character.classList.add('sprite-loaded');
        }

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
                    return `${shortName}: ${loaded ? '✔' : '✗'}`;
                })
                .join('<br>');
            debugElement.innerHTML = statusText;
        }
    }
};