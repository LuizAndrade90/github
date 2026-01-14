// Apple Health Integration Module
class HealthDataManager {
    constructor() {
        this.mcpEndpoint = null;
        this.connected = false;
        this.lastSync = null;
    }

    async initialize(endpoint) {
        this.mcpEndpoint = endpoint;
        if (endpoint) {
            try {
                await this.testConnection();
                this.connected = true;
                return true;
            } catch (error) {
                console.error('Failed to connect to MCP server:', error);
                this.connected = false;
                return false;
            }
        }
        return false;
    }

    async testConnection() {
        if (!this.mcpEndpoint) {
            throw new Error('MCP endpoint not configured');
        }

        const response = await fetch(`${this.mcpEndpoint}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('MCP server not responding');
        }

        return await response.json();
    }

    async fetchHealthData(dataType, startDate, endDate) {
        if (!this.connected) {
            throw new Error('Not connected to Apple Health');
        }

        try {
            const response = await fetch(`${this.mcpEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: dataType,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch health data');
            }

            const data = await response.json();
            this.lastSync = new Date();

            // Save to local database
            if (data.records) {
                for (const record of data.records) {
                    await db.saveHealthData({
                        type: dataType,
                        date: record.date,
                        value: record.value,
                        unit: record.unit,
                        source: 'apple-health'
                    });
                }
            }

            return data;
        } catch (error) {
            console.error('Error fetching health data:', error);
            throw error;
        }
    }

    async getStepCount(date = new Date()) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        if (this.connected) {
            try {
                const data = await this.fetchHealthData('steps', startDate, endDate);
                return data.total || 0;
            } catch (error) {
                console.error('Error getting step count:', error);
            }
        }

        // Fallback to local data
        const localData = await db.getHealthDataByDate(date.toISOString().split('T')[0]);
        const steps = localData.filter(d => d.type === 'steps');
        return steps.reduce((sum, s) => sum + (s.value || 0), 0);
    }

    async getWorkoutMinutes(date = new Date()) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        if (this.connected) {
            try {
                const data = await this.fetchHealthData('workout', startDate, endDate);
                return data.totalMinutes || 0;
            } catch (error) {
                console.error('Error getting workout minutes:', error);
            }
        }

        // Fallback to local data
        const localData = await db.getHealthDataByDate(date.toISOString().split('T')[0]);
        const workouts = localData.filter(d => d.type === 'workout');
        return workouts.reduce((sum, w) => sum + (w.value || 0), 0);
    }

    async getActiveCalories(date = new Date()) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        if (this.connected) {
            try {
                const data = await this.fetchHealthData('activeCalories', startDate, endDate);
                return data.total || 0;
            } catch (error) {
                console.error('Error getting active calories:', error);
            }
        }

        // Fallback to local data
        const localData = await db.getHealthDataByDate(date.toISOString().split('T')[0]);
        const calories = localData.filter(d => d.type === 'activeCalories');
        return calories.reduce((sum, c) => sum + (c.value || 0), 0);
    }

    async getHeartRate(date = new Date()) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        if (this.connected) {
            try {
                const data = await this.fetchHealthData('heartRate', startDate, endDate);
                return data.average || 0;
            } catch (error) {
                console.error('Error getting heart rate:', error);
            }
        }

        // Fallback to local data
        const localData = await db.getHealthDataByDate(date.toISOString().split('T')[0]);
        const heartRates = localData.filter(d => d.type === 'heartRate');
        if (heartRates.length === 0) return 0;
        const sum = heartRates.reduce((sum, hr) => sum + (hr.value || 0), 0);
        return Math.round(sum / heartRates.length);
    }

    async syncWeeklyData() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const dataTypes = ['steps', 'workout', 'activeCalories', 'heartRate'];
        const results = {};

        for (const type of dataTypes) {
            try {
                results[type] = await this.fetchHealthData(type, startDate, endDate);
            } catch (error) {
                console.error(`Error syncing ${type}:`, error);
                results[type] = null;
            }
        }

        return results;
    }

    async getWeeklySummary() {
        const summary = {
            totalSteps: 0,
            totalWorkoutMinutes: 0,
            totalActiveCalories: 0,
            averageHeartRate: 0,
            activeDays: 0
        };

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const steps = await this.getStepCount(date);
            const workoutMinutes = await this.getWorkoutMinutes(date);
            const calories = await this.getActiveCalories(date);

            summary.totalSteps += steps;
            summary.totalWorkoutMinutes += workoutMinutes;
            summary.totalActiveCalories += calories;

            if (steps > 1000 || workoutMinutes > 0) {
                summary.activeDays++;
            }
        }

        // Get average heart rate
        const heartRates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const hr = await this.getHeartRate(date);
            if (hr > 0) heartRates.push(hr);
        }

        if (heartRates.length > 0) {
            summary.averageHeartRate = Math.round(
                heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
            );
        }

        return summary;
    }

    // Manual data entry for when MCP is not available
    async addManualHealthData(type, date, value, unit) {
        return await db.saveHealthData({
            type,
            date: date.toISOString(),
            value,
            unit,
            source: 'manual'
        });
    }

    // Match health data to goals
    async matchHealthDataToGoals(goals) {
        const matches = [];

        for (const goal of goals) {
            if (!goal.healthSync) continue;

            const categoryMapping = {
                'fitness': ['steps', 'workout', 'activeCalories'],
                'health': ['heartRate', 'sleep', 'water'],
                'mindfulness': ['mindfulMinutes']
            };

            const dataTypes = categoryMapping[goal.category] || [];

            for (const type of dataTypes) {
                try {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);

                    const data = await this.fetchHealthData(type, startDate, endDate);

                    if (data && data.records) {
                        matches.push({
                            goalId: goal.id,
                            goalTitle: goal.title,
                            dataType: type,
                            records: data.records
                        });

                        // Automatically update goal progress based on health data
                        await this.updateGoalFromHealthData(goal, data.records);
                    }
                } catch (error) {
                    console.error(`Error matching health data for goal ${goal.id}:`, error);
                }
            }
        }

        return matches;
    }

    async updateGoalFromHealthData(goal, records) {
        // Add activities based on health records
        for (const record of records) {
            const existingActivities = await db.getActivitiesByDate(record.date);
            const hasActivity = existingActivities.some(a => a.goalId === goal.id);

            if (!hasActivity) {
                // Check if record meets goal criteria
                const meetsGoal = this.checkGoalCriteria(goal, record);

                if (meetsGoal) {
                    await db.addActivity({
                        goalId: goal.id,
                        date: record.date,
                        value: record.value,
                        source: 'apple-health',
                        notes: `Auto-synced from Apple Health: ${record.value} ${record.unit}`
                    });
                }
            }
        }
    }

    checkGoalCriteria(goal, record) {
        // Define criteria for different goal types
        const criteria = {
            'steps': 8000,  // Minimum steps
            'workout': 30,  // Minimum workout minutes
            'activeCalories': 300  // Minimum active calories
        };

        const threshold = criteria[record.type] || 0;
        return record.value >= threshold;
    }

    disconnect() {
        this.connected = false;
        this.mcpEndpoint = null;
    }

    getConnectionStatus() {
        return {
            connected: this.connected,
            lastSync: this.lastSync,
            endpoint: this.mcpEndpoint
        };
    }
}

// Create global health data manager instance
const healthManager = new HealthDataManager();
