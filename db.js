// Database module for IndexedDB
class GoalDatabase {
    constructor() {
        this.dbName = 'GoalDashboardDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Goals store
                if (!db.objectStoreNames.contains('goals')) {
                    const goalsStore = db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
                    goalsStore.createIndex('owner', 'owner', { unique: false });
                    goalsStore.createIndex('category', 'category', { unique: false });
                }

                // Activities store
                if (!db.objectStoreNames.contains('activities')) {
                    const activitiesStore = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
                    activitiesStore.createIndex('goalId', 'goalId', { unique: false });
                    activitiesStore.createIndex('date', 'date', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Health data store
                if (!db.objectStoreNames.contains('healthData')) {
                    const healthStore = db.createObjectStore('healthData', { keyPath: 'id', autoIncrement: true });
                    healthStore.createIndex('date', 'date', { unique: false });
                    healthStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Goal operations
    async addGoal(goal) {
        const transaction = this.db.transaction(['goals'], 'readwrite');
        const store = transaction.objectStore('goals');
        goal.createdAt = new Date().toISOString();
        goal.updatedAt = new Date().toISOString();
        goal.progress = 0;
        goal.activities = [];
        return new Promise((resolve, reject) => {
            const request = store.add(goal);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateGoal(id, updates) {
        const goal = await this.getGoal(id);
        if (!goal) throw new Error('Goal not found');

        const updatedGoal = { ...goal, ...updates, updatedAt: new Date().toISOString() };
        const transaction = this.db.transaction(['goals'], 'readwrite');
        const store = transaction.objectStore('goals');

        return new Promise((resolve, reject) => {
            const request = store.put(updatedGoal);
            request.onsuccess = () => resolve(updatedGoal);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteGoal(id) {
        const transaction = this.db.transaction(['goals'], 'readwrite');
        const store = transaction.objectStore('goals');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getGoal(id) {
        const transaction = this.db.transaction(['goals'], 'readonly');
        const store = transaction.objectStore('goals');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllGoals(owner = null) {
        const transaction = this.db.transaction(['goals'], 'readonly');
        const store = transaction.objectStore('goals');

        return new Promise((resolve, reject) => {
            let request;
            if (owner && owner !== 'both') {
                const index = store.index('owner');
                request = index.getAll(owner);
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                let goals = request.result;
                if (owner === 'both') {
                    goals = goals.filter(g => g.owner === 'both');
                }
                resolve(goals);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Activity operations
    async addActivity(activity) {
        const transaction = this.db.transaction(['activities'], 'readwrite');
        const store = transaction.objectStore('activities');
        activity.timestamp = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const request = store.add(activity);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getActivitiesByGoal(goalId) {
        const transaction = this.db.transaction(['activities'], 'readonly');
        const store = transaction.objectStore('activities');
        const index = store.index('goalId');

        return new Promise((resolve, reject) => {
            const request = index.getAll(goalId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getActivitiesByDate(date) {
        const transaction = this.db.transaction(['activities'], 'readonly');
        const store = transaction.objectStore('activities');
        const index = store.index('date');

        return new Promise((resolve, reject) => {
            const request = index.getAll(date);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllActivities() {
        const transaction = this.db.transaction(['activities'], 'readonly');
        const store = transaction.objectStore('activities');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Settings operations
    async saveSetting(key, value) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.put({ key, value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllSettings() {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const settings = {};
                request.result.forEach(item => {
                    settings[item.key] = item.value;
                });
                resolve(settings);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Health data operations
    async saveHealthData(data) {
        const transaction = this.db.transaction(['healthData'], 'readwrite');
        const store = transaction.objectStore('healthData');
        data.synced = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getHealthDataByDate(date) {
        const transaction = this.db.transaction(['healthData'], 'readonly');
        const store = transaction.objectStore('healthData');
        const index = store.index('date');

        return new Promise((resolve, reject) => {
            const request = index.getAll(date);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getHealthDataByType(type) {
        const transaction = this.db.transaction(['healthData'], 'readonly');
        const store = transaction.objectStore('healthData');
        const index = store.index('type');

        return new Promise((resolve, reject) => {
            const request = index.getAll(type);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Export/Import functionality
    async exportData() {
        const goals = await this.getAllGoals();
        const activities = await this.getAllActivities();
        const settings = await this.getAllSettings();

        return {
            version: this.version,
            exportDate: new Date().toISOString(),
            goals,
            activities,
            settings
        };
    }

    async importData(data) {
        // Clear existing data
        const transaction = this.db.transaction(['goals', 'activities', 'settings'], 'readwrite');
        await Promise.all([
            transaction.objectStore('goals').clear(),
            transaction.objectStore('activities').clear()
        ]);

        // Import new data
        if (data.goals) {
            for (const goal of data.goals) {
                await this.addGoal(goal);
            }
        }
        if (data.activities) {
            for (const activity of data.activities) {
                await this.addActivity(activity);
            }
        }
        if (data.settings) {
            for (const [key, value] of Object.entries(data.settings)) {
                await this.saveSetting(key, value);
            }
        }
    }
}

// Create global database instance
const db = new GoalDatabase();
