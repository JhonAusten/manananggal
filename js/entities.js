// Enhanced Machete class with better rotation matching character size
class Machete {
    constructor(x, y, angle, durability = 100) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.radius = 90;
        this.speed = 0.08;
        this.durability = durability;
        this.element = this.createElement();
        gameArea.appendChild(this.element);
        
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
        
        const characterCenterX = gameState.character.x + 10;
        const characterCenterY = gameState.character.y + 33;
        
        this.x = characterCenterX + Math.cos(this.angle) * this.radius;
        this.y = characterCenterY + Math.sin(this.angle) * this.radius;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        const rotationDegrees = (this.angle * 180 / Math.PI) + 90;
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
        const characterCenterX = gameState.character.x + 10;
        const characterCenterY = gameState.character.y + 30;
        const dx = characterCenterX - (this.x + 30);
        const dy = characterCenterY - (this.y + 35);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let facingRight = dx >= 0; // Determine direction based on movement toward character

        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Update animation with direction
        manananggalAnimator.updateAnimation(this.element, facingRight);
    }

    checkCollisionWithCharacter() {
        const characterCenterX = gameState.character.x + 10;
        const characterCenterY = gameState.character.y + 30;
        const dx = (this.x + 30) - characterCenterX;
        const dy = (this.y + 35) - characterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 50;
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
        return distance < 80;
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
        return distance < 80;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}