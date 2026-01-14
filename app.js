// Main Application
class GoalDashboardApp {
    constructor() {
        this.currentUser = 'user1';
        this.currentGoalId = null;
        this.editingGoalId = null;
    }

    async init() {
        try {
            // Initialize database
            await db.init();
            console.log('Database initialized');

            // Load settings
            await this.loadSettings();

            // Initialize charts
            chartManager.init();
            console.log('Charts initialized');

            // Setup event listeners
            this.setupEventListeners();

            // Load and display data
            await this.loadGoals();

            // Setup notifications
            const notificationsEnabled = await db.getSetting('notificationsEnabled');
            if (notificationsEnabled) {
                await notificationManager.requestPermission();
            }

            // Generate welcome message
            this.showWelcomeMessage();

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            alert('Error initializing application. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // User selection
        document.getElementById('user1Btn').addEventListener('click', () => this.switchUser('user1'));
        document.getElementById('user2Btn').addEventListener('click', () => this.switchUser('user2'));
        document.getElementById('bothUsersBtn').addEventListener('click', () => this.switchUser('both'));

        // Header actions
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('notificationBtn').addEventListener('click', () => this.showNotifications());

        // Goal actions
        document.getElementById('addGoalBtn').addEventListener('click', () => this.openGoalModal());
        document.getElementById('aiSuggestBtn').addEventListener('click', () => this.openAIModal());

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Goal form
        document.getElementById('goalForm').addEventListener('submit', (e) => this.saveGoal(e));

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());

        // AI
        document.getElementById('generateSuggestionsBtn').addEventListener('click', () => this.generateAISuggestions());

        // Health
        document.getElementById('syncHealthBtn').addEventListener('click', () => this.syncHealthData());
        document.getElementById('connectHealthBtn').addEventListener('click', () => this.connectHealth());
    }

    async switchUser(user) {
        this.currentUser = user;

        // Update UI
        document.querySelectorAll('.user-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.user === user) {
                btn.classList.add('active');
            }
        });

        // Reload goals
        await this.loadGoals();
    }

    async loadGoals() {
        try {
            const goals = await db.getAllGoals(this.currentUser);
            const activities = await db.getAllActivities();

            // Update goals with activity data
            for (const goal of goals) {
                const goalActivities = activities.filter(a => a.goalId === goal.id);
                goal.activities = goalActivities;

                // Calculate progress
                if (goal.target && goal.target > 0) {
                    const count = goalActivities.length;
                    goal.progress = Math.min((count / goal.target) * 100, 100);
                }
            }

            // Display goals
            this.displayGoals(goals);

            // Update charts
            chartManager.updateCompletionChart(goals);
            await chartManager.updateWeeklyChart(activities);

            // Update activity calendar
            await this.updateActivityCalendar(activities);

            return goals;
        } catch (error) {
            console.error('Error loading goals:', error);
            throw error;
        }
    }

    displayGoals(goals) {
        const goalsList = document.getElementById('goalsList');

        if (goals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <h3>No Goals Yet</h3>
                    <p>Start by adding your first goal or get AI suggestions!</p>
                </div>
            `;
            return;
        }

        goalsList.innerHTML = goals.map(goal => this.createGoalCard(goal)).join('');

        // Add event listeners to goal cards
        document.querySelectorAll('.goal-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const goalId = parseInt(btn.dataset.goalId);
                const action = btn.dataset.action;

                if (action === 'edit') {
                    this.editGoal(goalId);
                } else if (action === 'delete') {
                    this.deleteGoal(goalId);
                }
            });
        });

        document.querySelectorAll('.goal-check-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const goalId = parseInt(btn.dataset.goalId);
                await this.checkInGoal(goalId);
            });
        });
    }

    createGoalCard(goal) {
        const categoryEmojis = {
            fitness: '🏃',
            health: '💚',
            learning: '📚',
            habits: '🎯',
            nutrition: '🥗',
            mindfulness: '🧘',
            other: '📝'
        };

        const ownerNames = {
            user1: 'User 1',
            user2: 'User 2',
            both: 'Both'
        };

        return `
            <div class="goal-card">
                <div class="goal-card-header">
                    <span class="goal-category">${categoryEmojis[goal.category] || '📝'}</span>
                    <div class="goal-actions">
                        <button class="goal-action-btn" data-goal-id="${goal.id}" data-action="edit" title="Edit">✏️</button>
                        <button class="goal-action-btn" data-goal-id="${goal.id}" data-action="delete" title="Delete">🗑️</button>
                    </div>
                </div>
                <h3 class="goal-title">${this.escapeHtml(goal.title)}</h3>
                <p class="goal-description">${this.escapeHtml(goal.description || '')}</p>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${goal.activities?.length || 0} / ${goal.target} ${goal.frequency}</span>
                        <span>${Math.round(goal.progress)}%</span>
                    </div>
                </div>
                <div class="goal-footer">
                    <span class="goal-owner">${ownerNames[goal.owner]}</span>
                    <button class="goal-check-btn" data-goal-id="${goal.id}">✓ Check In</button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openGoalModal(goalId = null) {
        this.editingGoalId = goalId;
        const modal = document.getElementById('goalModal');
        const form = document.getElementById('goalForm');
        const title = document.getElementById('modalTitle');

        if (goalId) {
            title.textContent = 'Edit Goal';
            this.loadGoalIntoForm(goalId);
        } else {
            title.textContent = 'Add New Goal';
            form.reset();
            document.getElementById('goalOwner').value = this.currentUser;
        }

        modal.classList.add('active');
    }

    async loadGoalIntoForm(goalId) {
        const goal = await db.getGoal(goalId);
        if (!goal) return;

        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalDescription').value = goal.description || '';
        document.getElementById('goalCategory').value = goal.category;
        document.getElementById('goalTarget').value = goal.target;
        document.getElementById('goalFrequency').value = goal.frequency;
        document.getElementById('goalOwner').value = goal.owner;
        document.getElementById('goalNotifications').checked = goal.notifications || false;
        document.getElementById('goalHealthSync').checked = goal.healthSync || false;
    }

    async saveGoal(e) {
        e.preventDefault();

        const goalData = {
            title: document.getElementById('goalTitle').value,
            description: document.getElementById('goalDescription').value,
            category: document.getElementById('goalCategory').value,
            target: parseInt(document.getElementById('goalTarget').value),
            frequency: document.getElementById('goalFrequency').value,
            owner: document.getElementById('goalOwner').value,
            notifications: document.getElementById('goalNotifications').checked,
            healthSync: document.getElementById('goalHealthSync').checked
        };

        try {
            if (this.editingGoalId) {
                await db.updateGoal(this.editingGoalId, goalData);
            } else {
                await db.addGoal(goalData);
            }

            // Close modal
            document.getElementById('goalModal').classList.remove('active');

            // Reload goals
            await this.loadGoals();

            // Setup notifications if enabled
            if (goalData.notifications) {
                const goal = this.editingGoalId
                    ? await db.getGoal(this.editingGoalId)
                    : await db.getAllGoals();
                await notificationManager.scheduleNotificationsForGoal(goal);
            }
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Error saving goal. Please try again.');
        }
    }

    async editGoal(goalId) {
        this.openGoalModal(goalId);
    }

    async deleteGoal(goalId) {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            await db.deleteGoal(goalId);
            await this.loadGoals();
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('Error deleting goal. Please try again.');
        }
    }

    async checkInGoal(goalId) {
        try {
            const goal = await db.getGoal(goalId);
            const oldProgress = goal.progress;

            // Add activity
            await db.addActivity({
                goalId: goalId,
                date: new Date().toISOString(),
                notes: 'Manual check-in'
            });

            // Reload to update progress
            const goals = await this.loadGoals();
            const updatedGoal = goals.find(g => g.id === goalId);

            // Check for milestones
            if (updatedGoal) {
                notificationManager.checkMilestones(updatedGoal, oldProgress, updatedGoal.progress);
            }

            // Show success message
            this.showToast('Activity logged successfully! 🎉');
        } catch (error) {
            console.error('Error checking in goal:', error);
            alert('Error logging activity. Please try again.');
        }
    }

    async updateActivityCalendar(activities) {
        const calendarDiv = document.getElementById('activityCalendar');

        // Get current week
        const today = new Date();
        const days = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - today.getDay() + i + 1); // Monday to Sunday
            days.push(date);
        }

        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const calendarHtml = `
            <div class="calendar-grid">
                ${days.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dayActivities = activities.filter(a => a.date.startsWith(dateStr));
                    const isActive = dayActivities.length > 0;
                    const isToday = date.toDateString() === today.toDateString();

                    return `
                        <div class="calendar-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}"
                             data-date="${dateStr}">
                            <div class="day-name">${dayNames[i]}</div>
                            <div class="day-number">${date.getDate()}</div>
                            <div class="day-status">${isActive ? '✓' : ''}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        calendarDiv.innerHTML = calendarHtml;
    }

    async openSettings() {
        const modal = document.getElementById('settingsModal');

        // Load current settings
        const settings = await db.getAllSettings();

        document.getElementById('user1Name').value = settings.user1Name || '';
        document.getElementById('user2Name').value = settings.user2Name || '';
        document.getElementById('apiKey').value = settings.apiKey || '';
        document.getElementById('mcpEndpoint').value = settings.mcpEndpoint || '';
        document.getElementById('enableNotifications').checked = settings.notificationsEnabled || false;

        modal.classList.add('active');
    }

    async saveSettings() {
        try {
            const settings = {
                user1Name: document.getElementById('user1Name').value,
                user2Name: document.getElementById('user2Name').value,
                apiKey: document.getElementById('apiKey').value,
                mcpEndpoint: document.getElementById('mcpEndpoint').value,
                notificationsEnabled: document.getElementById('enableNotifications').checked
            };

            // Save to database
            for (const [key, value] of Object.entries(settings)) {
                await db.saveSetting(key, value);
            }

            // Update AI assistant
            if (settings.apiKey) {
                aiAssistant.setApiKey(settings.apiKey);
            }

            // Update health manager
            if (settings.mcpEndpoint) {
                await healthManager.initialize(settings.mcpEndpoint);
            }

            // Update notifications
            if (settings.notificationsEnabled) {
                await notificationManager.requestPermission();
            }

            // Update user button labels
            if (settings.user1Name) {
                document.getElementById('user1Btn').textContent = `👤 ${settings.user1Name}`;
            }
            if (settings.user2Name) {
                document.getElementById('user2Btn').textContent = `👤 ${settings.user2Name}`;
            }

            document.getElementById('settingsModal').classList.remove('active');
            this.showToast('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
    }

    async loadSettings() {
        const settings = await db.getAllSettings();

        if (settings.apiKey) {
            aiAssistant.setApiKey(settings.apiKey);
        }

        if (settings.mcpEndpoint) {
            await healthManager.initialize(settings.mcpEndpoint);
        }

        if (settings.user1Name) {
            document.getElementById('user1Btn').textContent = `👤 ${settings.user1Name}`;
        }

        if (settings.user2Name) {
            document.getElementById('user2Btn').textContent = `👤 ${settings.user2Name}`;
        }
    }

    async exportData() {
        try {
            const data = await db.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `goal-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showToast('Data exported successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const data = JSON.parse(text);

                if (confirm('This will replace all current data. Are you sure?')) {
                    await db.importData(data);
                    await this.loadGoals();
                    this.showToast('Data imported successfully!');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error importing data. Please check the file format.');
            }
        };

        input.click();
    }

    async openAIModal() {
        const modal = document.getElementById('aiModal');
        modal.classList.add('active');
    }

    async generateAISuggestions() {
        const btn = document.getElementById('generateSuggestionsBtn');
        const suggestionsDiv = document.getElementById('aiSuggestions');

        try {
            btn.disabled = true;
            btn.textContent = 'Generating...';

            suggestionsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Getting AI suggestions...</div>';

            const goals = await db.getAllGoals();
            const suggestions = await aiAssistant.generateGoalSuggestions(goals);

            let html = '';

            // New goals
            if (suggestions.newGoals && suggestions.newGoals.length > 0) {
                html += '<h3>New Goal Suggestions</h3>';
                suggestions.newGoals.forEach(goal => {
                    html += `
                        <div class="ai-suggestion-card">
                            <h4>${goal.title}</h4>
                            <p>${goal.description}</p>
                            <p><small><strong>Why:</strong> ${goal.reasoning}</small></p>
                            <div class="ai-suggestion-actions">
                                <button class="btn btn-primary" onclick="app.addSuggestedGoal(${JSON.stringify(goal).replace(/"/g, '&quot;')})">Add Goal</button>
                            </div>
                        </div>
                    `;
                });
            }

            // Improvements
            if (suggestions.improvements && suggestions.improvements.length > 0) {
                html += '<h3>Goal Improvements</h3>';
                suggestions.improvements.forEach(imp => {
                    html += `
                        <div class="ai-suggestion-card">
                            <h4>${imp.goalTitle}</h4>
                            <p>${imp.suggestion}</p>
                            <p><small><strong>Why:</strong> ${imp.reasoning}</small></p>
                        </div>
                    `;
                });
            }

            // Tips
            if (suggestions.tips && suggestions.tips.length > 0) {
                html += '<h3>Pro Tips</h3>';
                html += '<ul>';
                suggestions.tips.forEach(tip => {
                    html += `<li>${tip}</li>`;
                });
                html += '</ul>';
            }

            suggestionsDiv.innerHTML = html;

        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            suggestionsDiv.innerHTML = `<p class="info-text">Error: ${error.message}</p>`;
        } finally {
            btn.disabled = false;
            btn.textContent = 'Generate Suggestions';
        }
    }

    async addSuggestedGoal(goalData) {
        try {
            goalData.owner = this.currentUser;
            goalData.notifications = false;
            goalData.healthSync = false;

            await db.addGoal(goalData);
            await this.loadGoals();

            document.getElementById('aiModal').classList.remove('active');
            this.showToast('Goal added successfully!');
        } catch (error) {
            console.error('Error adding suggested goal:', error);
            alert('Error adding goal. Please try again.');
        }
    }

    async syncHealthData() {
        try {
            if (!healthManager.connected) {
                alert('Please connect Apple Health in settings first.');
                return;
            }

            const btn = document.getElementById('syncHealthBtn');
            btn.disabled = true;
            btn.textContent = '⏳ Syncing...';

            const data = await healthManager.syncWeeklyData();

            // Match with goals
            const goals = await db.getAllGoals();
            await healthManager.matchHealthDataToGoals(goals);

            // Reload
            await this.loadGoals();

            btn.textContent = '✓ Synced!';
            setTimeout(() => {
                btn.textContent = '🍎 Sync Apple Health';
                btn.disabled = false;
            }, 2000);

            this.showToast('Health data synced successfully!');
        } catch (error) {
            console.error('Error syncing health data:', error);
            alert(`Error syncing health data: ${error.message}`);
            document.getElementById('syncHealthBtn').disabled = false;
            document.getElementById('syncHealthBtn').textContent = '🍎 Sync Apple Health';
        }
    }

    async connectHealth() {
        const endpoint = await db.getSetting('mcpEndpoint');
        if (!endpoint) {
            alert('Please configure MCP endpoint in settings first.');
            this.openSettings();
            return;
        }

        try {
            const connected = await healthManager.initialize(endpoint);
            if (connected) {
                this.showToast('Connected to Apple Health!');
                await this.displayHealthStats();
            } else {
                alert('Failed to connect to Apple Health. Please check your MCP server.');
            }
        } catch (error) {
            console.error('Error connecting to health:', error);
            alert('Error connecting to Apple Health. Please check your settings.');
        }
    }

    async displayHealthStats() {
        const healthDiv = document.getElementById('healthData');
        const summary = await healthManager.getWeeklySummary();

        healthDiv.innerHTML = `
            <div class="health-stats">
                <div class="health-stat">
                    <div class="health-stat-value">${summary.totalSteps.toLocaleString()}</div>
                    <div class="health-stat-label">Total Steps</div>
                </div>
                <div class="health-stat">
                    <div class="health-stat-value">${summary.totalWorkoutMinutes}</div>
                    <div class="health-stat-label">Workout Minutes</div>
                </div>
                <div class="health-stat">
                    <div class="health-stat-value">${summary.totalActiveCalories}</div>
                    <div class="health-stat-label">Active Calories</div>
                </div>
                <div class="health-stat">
                    <div class="health-stat-value">${summary.activeDays}/7</div>
                    <div class="health-stat-label">Active Days</div>
                </div>
            </div>
        `;
    }

    showNotifications() {
        alert('Notifications panel - coming soon!');
    }

    async showWelcomeMessage() {
        const goals = await db.getAllGoals();
        if (goals.length === 0) {
            this.showToast('👋 Welcome! Start by adding your first goal or get AI suggestions.');
        }
    }

    showToast(message, duration = 3000) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Initialize app when DOM is ready
const app = new GoalDashboardApp();

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
