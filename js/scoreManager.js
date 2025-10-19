// Google Sheets integration system
const scoreManager = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwEBgzxSMKUvE4saoTUP59g5RbQAZwhAaJSnUsN0yjJhGmm4JTzjb2JLoYK5ew38l9_qg/exec',
    
    async submitScore(scoreData) {
        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });
            
            console.log('Score submitted successfully!');
            return true;
        } catch (error) {
            console.error('Failed to submit score:', error);
            return false;
        }
    },

    async getLeaderboard(limit = 10) {
        try {
            const response = await fetch(`${this.scriptUrl}?action=leaderboard&limit=${limit}`);
            const data = await response.json();
            
            if (data.success) {
                return data.leaderboard;
            } else {
                console.error('Failed to fetch leaderboard:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            return [];
        }
    },

    formatSurvivalTime(startTime) {
        if (!startTime) return '0:00';
        
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        console.log('Formatted survival time:', timeString);
        return timeString;
    }
};