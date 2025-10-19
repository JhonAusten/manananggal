// Wave Buff class
class WaveBuff {
    constructor() {
        this.x = Math.random() * (window.innerWidth - 100) + 50;
        this.y = Math.random() * (window.innerHeight - 100) + 50;
        this.element = this.createElement();
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        gameArea.appendChild(this.element);
        
        // Apply sprite-loaded class if wave buff sprite is available
        if (window.assetStatus && window.assetStatus['Wave Buff']) {
            this.element.classList.add('sprite-loaded');
        }
    }

    createElement() {
        const buff = document.createElement('div');
        buff.className = 'wave-buff';
        if (!window.assetStatus || !window.assetStatus['Wave Buff']) {
            buff.innerHTML = '';
        }
        return buff;
    }

    checkCollision() {
        const characterCenterX = gameState.character.x + 31;
        const characterCenterY = gameState.character.y + 65;
        const dx = this.x - characterCenterX;
        const dy = this.y - characterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 80;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Sword Wave class - projectile fired by player
class SwordWave {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 8;
        this.range = 1000;
        this.distanceTraveled = 0;
        this.element = this.createElement();
        gameArea.appendChild(this.element);
        
        // Apply sprite-loaded class if sword wave sprite is available
        if (window.assetStatus && window.assetStatus['Sword Wave']) {
            this.element.classList.add('sprite-loaded');
        }
    }

    createElement() {
        const wave = document.createElement('div');
        wave.className = 'sword-wave';
        return wave;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.distanceTraveled += this.speed;

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        const rotationDegrees = (this.angle * 180 / Math.PI);
        this.element.style.transform = `rotate(${rotationDegrees}deg)`;

        return this.distanceTraveled < this.range;
    }

    checkCollision(manananggal) {
        const dx = this.x - (manananggal.x + 30);
        const dy = this.y - (manananggal.y + 35);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 60;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Wave system manager
const waveSystem = {
    bullets: 0,
    maxBullets: 5,
    swordWaves: [],
    lastShotTime: 0,
    shotCooldown: 200, // milliseconds between shots

    addBullets(amount = 5) {
        this.bullets = Math.min(this.bullets + amount, this.maxBullets);
        this.updateBulletDisplay();
    },

    canShoot() {
        return this.bullets > 0 && (Date.now() - this.lastShotTime) > this.shotCooldown;
    },

    shoot(x, y, angle) {
        if (!this.canShoot()) return false;

        const wave = new SwordWave(x, y, angle);
        this.swordWaves.push(wave);
        this.bullets--;
        this.lastShotTime = Date.now();
        this.updateBulletDisplay();

        audioManager.play('shockwave');
        return true;
    },

    updateWaves() {
        for (let i = this.swordWaves.length - 1; i >= 0; i--) {
            const wave = this.swordWaves[i];
            const isActive = wave.update();

            if (!isActive) {
                wave.destroy();
                this.swordWaves.splice(i, 1);
                continue;
            }

            // Check collision with manananggals
            for (let mIndex = gameState.manananggals.length - 1; mIndex >= 0; mIndex--) {
                const manananggal = gameState.manananggals[mIndex];
                if (wave.checkCollision(manananggal)) {
                    audioManager.play('monsterDeath');
                    manananggal.destroy();
                    gameState.manananggals.splice(mIndex, 1);
                    gameState.kills++;
                    gameState.score += 15;
                }
            }
        }
    },

    updateBulletDisplay() {
        const bulletElement = document.getElementById('waveAmmo');
        if (bulletElement) {
            bulletElement.textContent = this.bullets;
        }
    },

    reset() {
        this.bullets = 0;
        this.swordWaves.forEach(wave => wave.destroy());
        this.swordWaves = [];
        this.updateBulletDisplay();
    }
};