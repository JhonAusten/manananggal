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
                        <span class="score">Score: ${entry.score}</span>
                        <span class="kills">Kills: ${entry.kills}</span>
                        <span class="time"></span>
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
        this.init();
    },

    closeMenu() {
        this.startGame();
    }
};

// Expose to global scope
window.menuScreen = menuScreen;