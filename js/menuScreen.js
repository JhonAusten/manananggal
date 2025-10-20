// Menu Screen System
const menuScreen = {
    isOpen: true,

    init() {
        const menuElement = document.getElementById('menuScreen');
        if (menuElement) {
            menuElement.style.display = 'flex';
        }
        console.log('Menu screen initialized');
    },

    startGame() {
        const menuElement = document.getElementById('menuScreen');
        if (menuElement) {
            menuElement.style.display = 'none';
        }
        this.isOpen = false;
        
        // Start the game initialization
        if (typeof initializeGame === 'function') {
            initializeGame();
        }
    },

    async viewLeaderboard() {
        const menuContent = document.querySelector('.menu-container');
        const originalContent = menuContent.innerHTML;
        
        menuContent.innerHTML = `
            <div class="menu-title">TOP SURVIVORS</div>
            <div id="menuLeaderboardList" class="menu-leaderboard-list">
                <div class="loading">Loading leaderboard...</div>
            </div>
            <button class="menu-btn back-btn" onclick="menuScreen.backToMenu()">BACK</button>
        `;

        try {
            const leaderboard = await scoreManager.getLeaderboard(10);
            const leaderboardContainer = document.getElementById('menuLeaderboardList');
            
            if (leaderboard.length === 0) {
                leaderboardContainer.innerHTML = '<div class="no-scores">No scores yet. Be the first!</div>';
                return;
            }

            let leaderboardHTML = '';
            leaderboard.forEach(entry => {
                const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
                leaderboardHTML += `
                    <div class="menu-leaderboard-entry rank-${entry.rank}">
                        <span class="rank">${medal}</span>
                        <span class="player-name">${entry.playerName}</span>
                        <span class="score">${entry.score}</span>
                        <span class="kills">${entry.kills}</span>
                        <span class="time">${entry.survivalTime}</span>
                    </div>
                `;
            });
            
            leaderboardContainer.innerHTML = leaderboardHTML;
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            document.getElementById('menuLeaderboardList').innerHTML = '<div class="error">Failed to load leaderboard.</div>';
        }
    },

    backToMenu() {
        const menuContainer = document.querySelector('.menu-container');
        menuContainer.innerHTML = `
            <div class="menu-title">MANANANGGAL SURVIVAL</div>
            
            <div class="menu-subtitle">Filipino Horror Game</div>
            
            <div class="menu-description">
                <p>Survive the attack of the Manananggal!</p>
                <p>Use your rotating machetes to defend yourself.</p>
                <p>Collect buffs to power up and stay alive.</p>
            </div>

            <div class="menu-controls">
                <h3>How to Play</h3>
                <ul>
                    <li>WASD / Arrow Keys - Move</li>
                    <li>Shift - Run</li>
                    <li>Left Mouse Click - Shoot Wave Attack</li>
                    <li>Avoid the Manananggal!</li>
                </ul>
            </div>

            <button class="menu-btn start-btn" onclick="menuScreen.startGame()">START GAME</button>
            <button class="menu-btn leaderboard-btn" onclick="menuScreen.viewLeaderboard()">LEADERBOARD</button>
        `;
    },

    closeMenu() {
        this.startGame();
    }
};

// Expose to global scope
window.menuScreen = menuScreen;
