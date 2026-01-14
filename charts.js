// Charts module using Chart.js
class ChartManager {
    constructor() {
        this.completionChart = null;
        this.weeklyChart = null;
        this.chartColors = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        };
    }

    init() {
        this.createCompletionChart();
        this.createWeeklyChart();
    }

    createCompletionChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;

        this.completionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        this.chartColors.success,
                        this.chartColors.warning,
                        this.chartColors.info
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value} goal(s)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        this.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Activities Completed',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: this.chartColors.primary,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} activit${context.parsed.y === 1 ? 'y' : 'ies'}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateCompletionChart(goals) {
        if (!this.completionChart) return;

        const completed = goals.filter(g => g.progress >= 100).length;
        const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
        const notStarted = goals.filter(g => g.progress === 0).length;

        this.completionChart.data.datasets[0].data = [completed, inProgress, notStarted];
        this.completionChart.update();
    }

    async updateWeeklyChart(activities) {
        if (!this.weeklyChart) return;

        // Get current week dates
        const today = new Date();
        const currentDay = today.getDay() || 7; // Sunday = 0, make it 7
        const monday = new Date(today);
        monday.setDate(today.getDate() - currentDay + 1);
        monday.setHours(0, 0, 0, 0);

        // Count activities per day
        const weekData = [0, 0, 0, 0, 0, 0, 0];

        activities.forEach(activity => {
            const activityDate = new Date(activity.date);
            activityDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((activityDate - monday) / (1000 * 60 * 60 * 24));

            if (daysDiff >= 0 && daysDiff < 7) {
                weekData[daysDiff]++;
            }
        });

        this.weeklyChart.data.datasets[0].data = weekData;
        this.weeklyChart.update();
    }

    createGoalProgressChart(canvasId, goal, activities) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Get last 30 days of data
        const days = 30;
        const dates = [];
        const progressData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            // Calculate progress up to this date
            const activitiesUpToDate = activities.filter(a => new Date(a.date) <= date).length;
            const progress = goal.target ? Math.min((activitiesUpToDate / goal.target) * 100, 100) : 0;
            progressData.push(progress.toFixed(1));
        }

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Progress',
                    data: progressData,
                    borderColor: this.chartColors.primary,
                    backgroundColor: `${this.chartColors.primary}20`,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Progress: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    createCategoryDistributionChart(canvasId, goals) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Count goals by category
        const categoryCounts = {};
        goals.forEach(goal => {
            categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
        });

        const categories = Object.keys(categoryCounts);
        const counts = Object.values(categoryCounts);

        const colors = [
            this.chartColors.primary,
            this.chartColors.secondary,
            this.chartColors.success,
            this.chartColors.warning,
            this.chartColors.danger,
            this.chartColors.info
        ];

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                datasets: [{
                    data: counts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value} goal(s)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createStreakChart(canvasId, goal, activities) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Calculate daily streaks for last 30 days
        const days = 30;
        const dates = [];
        const streakData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            // Check if activity exists for this date
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = activities.some(a => a.date.startsWith(dateStr));
            streakData.push(hasActivity ? 1 : 0);
        }

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Activity',
                    data: streakData,
                    backgroundColor: streakData.map(v => v === 1 ? this.chartColors.success : this.chartColors.danger),
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        display: false,
                        beginAtZero: true,
                        max: 1
                    },
                    x: {
                        ticks: {
                            maxRotation: 90,
                            minRotation: 90,
                            font: {
                                size: 9
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y === 1 ? 'Completed' : 'Not completed';
                            }
                        }
                    }
                }
            }
        });
    }

    destroy() {
        if (this.completionChart) this.completionChart.destroy();
        if (this.weeklyChart) this.weeklyChart.destroy();
    }
}

// Create global chart manager instance
const chartManager = new ChartManager();
