# 🎯 Goal Dashboard

A comprehensive web application for tracking and managing personal goals with AI-powered insights and Apple Health integration. Perfect for couples or individuals who want to track their progress together!

## ✨ Features

### Core Features
- **Multi-User Support**: Track goals for two users separately or together
- **Goal Management**: Create, edit, update, and delete goals with ease
- **Activity Tracking**: Log activities and track progress over time
- **Visual Analytics**: Beautiful charts showing completion rates and weekly activity
- **Weekly Calendar**: Visual representation of days you practiced activities

### AI-Powered Features
- **AI Goal Suggestions**: Get personalized goal recommendations based on your current goals
- **Progress Analysis**: AI-powered insights into your goal progress
- **Motivational Messages**: Receive encouraging messages based on your progress
- **Natural Language Goal Creation**: Create goals using natural language
- **Weekly Summaries**: AI-generated summaries of your achievements

### Apple Health Integration
- **Automatic Activity Sync**: Sync activities from Apple Health via MCP servers
- **Health Data Tracking**: Track steps, workout minutes, active calories, and heart rate
- **Goal Matching**: Automatically match health data to relevant goals
- **Weekly Health Summary**: View your weekly health statistics

### Notifications
- **Push Notifications**: Get reminded about your goals
- **Milestone Notifications**: Celebrate when you reach 25%, 50%, 75%, and 100%
- **Streak Notifications**: Get notified when you maintain consistency
- **Daily Reminders**: Optional daily reminders to work on your goals

### Data Management
- **Local Storage**: All data stored locally using IndexedDB
- **Export/Import**: Backup and restore your data easily
- **Privacy First**: Your data never leaves your device (except API calls to Anthropic and Apple Health MCP)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- (Optional) Anthropic API key for AI features
- (Optional) Apple Health MCP server for health integration

### Installation

1. **Clone or download this repository**

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or serve it using a local web server:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

3. **Configure Settings** (Optional)
   - Click the ⚙️ settings icon
   - Add your names for User 1 and User 2
   - Add your Anthropic API key for AI features
   - Add your Apple Health MCP endpoint if available
   - Enable notifications if desired

### First Steps

1. **Add Your First Goal**
   - Click "+ Add Goal"
   - Fill in the goal details
   - Choose the owner (User 1, User 2, or Both)
   - Set your target and frequency
   - Save!

2. **Track Progress**
   - Click "✓ Check In" on any goal to log an activity
   - Watch your progress update automatically
   - View charts and weekly calendar for visual insights

3. **Get AI Suggestions** (Requires API Key)
   - Click "✨ AI Suggestions"
   - Click "Generate Suggestions"
   - Review and add suggested goals

## 🔧 Configuration

### Anthropic API Key

To use AI features, you need an Anthropic API key:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Go to Settings in the app
3. Enter your API key
4. The key is stored locally in your browser

### Apple Health MCP Integration

There are several MCP servers available for Apple Health:

1. **[Momentum's Apple Health MCP](https://github.com/the-momentum/apple-health-mcp-server)** - Uses DuckDB
2. **[Neiltron's Apple Health MCP](https://github.com/neiltron/apple-health-mcp)** - SQL queries
3. **Manual Setup** - Or use manual data entry if MCP is not available

#### Setting Up MCP Server

1. Install and run your chosen MCP server
2. Get the endpoint URL (usually `http://localhost:3000`)
3. Enter it in the app settings
4. Click "Connect Apple Health" to test the connection
5. Use "🍎 Sync Apple Health" to fetch data

## 📱 Features Guide

### Goal Categories

- 🏃 **Fitness**: Exercise, running, gym workouts
- 💚 **Health**: General health goals, sleep, hydration
- 📚 **Learning**: Reading, courses, skill development
- 🎯 **Habits**: Daily habits, routines
- 🥗 **Nutrition**: Diet, meal planning
- 🧘 **Mindfulness**: Meditation, yoga, mental health
- 📝 **Other**: Any other goals

### Goal Frequency

- **Daily**: Goals to complete every day
- **Weekly**: Goals to complete each week
- **Monthly**: Goals to complete each month

### Progress Tracking

Progress is automatically calculated based on:
- Number of activities logged
- Target amount
- Frequency setting

Example: If your goal is "Exercise 3 times weekly" and you've logged 2 activities, your progress is 67%.

### Notifications

The app supports browser notifications:
- **Goal Reminders**: Morning and evening reminders
- **Milestones**: Celebrate progress at 25%, 50%, 75%, 100%
- **Streaks**: Recognition for maintaining consistency
- **Daily Reminders**: Optional daily check-in reminders

### Charts and Analytics

1. **Goal Completion Chart**: Doughnut chart showing completed, in-progress, and not started goals
2. **Weekly Activity Chart**: Bar chart showing activities per day
3. **Activity Calendar**: Visual calendar showing active days

## 🏗️ Architecture

### Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charts**: Chart.js v4
- **Database**: IndexedDB for local storage
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Health Data**: Apple Health via MCP servers
- **Notifications**: Web Notifications API

### File Structure

```
goal-dashboard/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── app.js             # Main application logic
├── db.js              # IndexedDB wrapper
├── charts.js          # Chart.js visualizations
├── notifications.js   # Notification manager
├── health.js          # Apple Health integration
├── ai.js              # AI assistant (Anthropic Claude)
└── README.md          # This file
```

### Data Structure

**Goals**:
```javascript
{
  id: number,
  title: string,
  description: string,
  category: string,
  target: number,
  frequency: string,
  owner: string,
  notifications: boolean,
  healthSync: boolean,
  progress: number,
  createdAt: string,
  updatedAt: string
}
```

**Activities**:
```javascript
{
  id: number,
  goalId: number,
  date: string,
  value: number,
  notes: string,
  source: string,
  timestamp: string
}
```

## 🔒 Privacy & Security

- **Local First**: All data stored locally in your browser using IndexedDB
- **No Tracking**: No analytics, no tracking, no data collection
- **API Keys**: Stored locally, only sent to respective services (Anthropic, MCP)
- **Open Source**: Full transparency - inspect the code yourself

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

MIT License - feel free to use and modify for your own needs.

## 🐛 Known Limitations

- Apple Health integration requires a separate MCP server
- AI features require an Anthropic API key (paid service)
- Browser notifications require user permission
- Data is stored locally per browser (not synced across devices)

## 🎉 Credits

- Built with ❤️ for personal goal tracking
- Uses [Chart.js](https://www.chartjs.org/) for visualizations
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Apple Health integration via [MCP servers](https://github.com/the-momentum/apple-health-mcp-server)

## 📞 Support

For questions or issues:
1. Check this README
2. Review the console for error messages
3. Ensure your API keys and endpoints are configured correctly
4. Try clearing browser data and reimporting your backup

---

**Enjoy tracking your goals! 🎯**
