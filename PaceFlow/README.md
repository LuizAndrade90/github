# PaceFlow - AI-Powered Running App

A modern, minimalist running app with AI-powered custom training guides, Apple HealthKit integration, and Stripe subscriptions.

## Features

- **AI-Powered Custom Guides**: Generate personalized running plans using Claude AI
- **Standard Training Guides**: Pre-built training programs (Couch to 5K, 10K, Half Marathon, Marathon, Speed Training)
- **Session Tracking**: Log and track your running sessions
- **Apple HealthKit Integration**: Sync your runs from Apple Watch
- **Dashboard & Analytics**: Track your progress and stats
- **Stripe Subscriptions**: 7-day trial, then $7/month

## Tech Stack

- **Frontend**: React Native (Expo)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Anthropic Claude API
- **Payments**: Stripe
- **Health Data**: Apple HealthKit

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account
- Stripe account
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
PaceFlow/
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/
│   │   ├── home/
│   │   ├── guides/
│   │   ├── sessions/
│   │   └── profile/
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── theme/           # Theme and colors
│   ├── types/           # TypeScript types
│   ├── services/        # API services
│   └── hooks/           # Custom hooks
└── App.tsx
```

## Development Progress

### ✅ Step 1: Project Initialization & Setup
- React Native project with TypeScript
- React Navigation setup
- React Native Paper UI library
- Theme configuration
- Basic folder structure

### 🔄 Next Steps
- Supabase configuration
- Google OAuth authentication
- Standard training guides
- Session tracking
- And more...

## License

MIT
