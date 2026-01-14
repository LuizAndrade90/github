// Notifications module
class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
        this.scheduledNotifications = new Map();
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        if (this.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    async sendNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) return null;
        }

        const defaultOptions = {
            icon: '🎯',
            badge: '🎯',
            vibrate: [200, 100, 200],
            tag: 'goal-dashboard',
            requireInteraction: false
        };

        const notification = new Notification(title, { ...defaultOptions, ...options });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    }

    scheduleGoalReminder(goal, time) {
        const now = new Date();
        const reminderTime = new Date(time);
        const delay = reminderTime.getTime() - now.getTime();

        if (delay <= 0) {
            return; // Time has already passed
        }

        const timeoutId = setTimeout(() => {
            this.sendNotification(`Goal Reminder: ${goal.title}`, {
                body: goal.description || 'Time to work on your goal!',
                tag: `goal-${goal.id}`,
                data: { goalId: goal.id, type: 'reminder' }
            });
            this.scheduledNotifications.delete(goal.id);
        }, delay);

        this.scheduledNotifications.set(goal.id, timeoutId);
    }

    cancelGoalReminder(goalId) {
        if (this.scheduledNotifications.has(goalId)) {
            clearTimeout(this.scheduledNotifications.get(goalId));
            this.scheduledNotifications.delete(goalId);
        }
    }

    async sendGoalCompletionNotification(goal) {
        return this.sendNotification('Goal Completed! 🎉', {
            body: `Congratulations! You've completed "${goal.title}"`,
            tag: `goal-complete-${goal.id}`,
            data: { goalId: goal.id, type: 'completion' }
        });
    }

    async sendDailyReminder(goals) {
        const pendingGoals = goals.filter(g => g.progress < 100);
        if (pendingGoals.length === 0) return;

        const title = '📋 Daily Goal Reminder';
        const body = `You have ${pendingGoals.length} goal(s) to work on today!`;

        return this.sendNotification(title, {
            body,
            tag: 'daily-reminder',
            data: { type: 'daily' }
        });
    }

    async sendStreakNotification(goalTitle, streak) {
        return this.sendNotification('Streak Achievement! 🔥', {
            body: `You've maintained a ${streak}-day streak for "${goalTitle}"!`,
            tag: 'streak',
            data: { type: 'streak' }
        });
    }

    async sendMilestoneNotification(goal, milestone) {
        return this.sendNotification('Milestone Reached! 🏆', {
            body: `"${goal.title}" is now ${milestone}% complete!`,
            tag: `milestone-${goal.id}`,
            data: { goalId: goal.id, type: 'milestone' }
        });
    }

    scheduleDailyReminders(goals, time = '09:00') {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);

        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const delay = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            this.sendDailyReminder(goals);
            // Schedule next day
            this.scheduleDailyReminders(goals, time);
        }, delay);
    }

    async scheduleNotificationsForGoal(goal) {
        if (!goal.notifications) return;

        const now = new Date();

        // Morning reminder (9 AM)
        const morningReminder = new Date();
        morningReminder.setHours(9, 0, 0, 0);
        if (morningReminder > now) {
            this.scheduleGoalReminder(goal, morningReminder);
        }

        // Evening reminder (8 PM)
        const eveningReminder = new Date();
        eveningReminder.setHours(20, 0, 0, 0);
        if (eveningReminder > now) {
            this.scheduleGoalReminder(goal, eveningReminder);
        }
    }

    clearAllScheduledNotifications() {
        this.scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
        this.scheduledNotifications.clear();
    }

    // Check for milestone achievements
    checkMilestones(goal, oldProgress, newProgress) {
        const milestones = [25, 50, 75, 100];

        for (const milestone of milestones) {
            if (oldProgress < milestone && newProgress >= milestone) {
                if (milestone === 100) {
                    this.sendGoalCompletionNotification(goal);
                } else {
                    this.sendMilestoneNotification(goal, milestone);
                }
            }
        }
    }

    // Calculate and check for streaks
    async checkStreaks(goal, activities) {
        if (!activities || activities.length === 0) return;

        // Sort activities by date
        const sortedActivities = activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const activity of sortedActivities) {
            const activityDate = new Date(activity.date);
            activityDate.setHours(0, 0, 0, 0);

            const dayDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Send notification for significant streaks
        if ([7, 14, 30, 60, 90, 100].includes(streak)) {
            this.sendStreakNotification(goal.title, streak);
        }

        return streak;
    }
}

// Create global notification manager instance
const notificationManager = new NotificationManager();
