# PaceFlow

**AI-Powered Running Training App for iOS**

PaceFlow is a modern, AI-native mobile application that helps runners achieve their goals with personalized training plans, comprehensive tracking, and seamless Apple Health integration.

---

## Features

### Core Features

✅ **AI-Powered Custom Training Plans** - Generate personalized running guides using Claude AI
✅ **Standard Training Guides** - 5 pre-made plans (Couch to 5K, 10K, Half Marathon, Marathon, Speed Training)
✅ **Running Session Tracking** - Log runs manually with distance, duration, heart rate, and more
✅ **Apple HealthKit Integration** - Auto-sync workouts from Apple Watch
✅ **Dashboard & Analytics** - Track total distance, runs, pace, streaks, and progress
✅ **Google Authentication** - Secure OAuth login
✅ **Stripe Subscriptions** - 7-day free trial, then $7/month

### Technical Highlights

- **TypeScript** - Type-safe codebase
- **React Native + Expo** - Cross-platform (iOS primary)
- **Supabase** - Backend database and authentication
- **React Native Paper** - Material Design 3 UI components
- **Claude 3.5 Sonnet** - AI guide generation
- **Apple HealthKit** - Native iOS health data integration

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- macOS with Xcode (for iOS)
- Physical iOS device (for HealthKit features)

### Installation

```bash
# Navigate to project
cd PaceFlow

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm start

# Run on iOS
npm run ios
```

### Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Project Structure

```
PaceFlow/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   ├── services/         # External services
│   ├── theme/            # App styling
│   └── types/            # TypeScript types
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
├── App.tsx               # Root component
└── package.json
```

---

## Setup Guides

Detailed setup instructions for external services:

### 1. Supabase Setup

```bash
# Run migrations
cd PaceFlow
supabase db push

# Deploy Edge Functions
supabase functions deploy generate-custom-guide

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=your_key
```

### 2. Google OAuth

1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Configure in Supabase Auth

### 3. Stripe Subscription

1. Create account at [stripe.com](https://stripe.com)
2. Create product: "PaceFlow Pro" ($7/month)
3. Set up 7-day trial
4. Add publishable key to `.env`

[Full guide in docs/STRIPE_SETUP.md]

### 4. Anthropic Claude API

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Add to Supabase secrets

[Full guide in docs/AI_CUSTOM_GUIDES.md]

### 5. Apple HealthKit

- Enable HealthKit capability in Xcode
- Test on physical iOS device

[Full guide in docs/HEALTHKIT_INTEGRATION.md]

---

## Development

### Running Locally

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Type checking
npx tsc --noEmit
```

### Testing

See [docs/TEST_PLAN.md](docs/TEST_PLAN.md) for comprehensive test cases.

**Key Test Scenarios:**
1. Google OAuth login and onboarding
2. Add manual run with validation
3. View stats and analytics
4. Browse and view training plans
5. Create custom guide with Claude AI
6. Sync workouts from Apple Health

---

## Documentation

- [TEST_PLAN.md](docs/TEST_PLAN.md) - Comprehensive testing guide
- [STRIPE_SETUP.md](docs/STRIPE_SETUP.md) - Stripe integration setup
- [AI_CUSTOM_GUIDES.md](docs/AI_CUSTOM_GUIDES.md) - AI guide generation details
- [HEALTHKIT_INTEGRATION.md](docs/HEALTHKIT_INTEGRATION.md) - HealthKit setup and usage

---

## Architecture

### Frontend
- React Native with Expo
- React Navigation (bottom tabs + nested stacks)
- React Native Paper (Material Design 3)
- TypeScript (strict mode)

### Backend
- Supabase PostgreSQL database
- Supabase Auth (Google OAuth)
- Supabase Edge Functions (Deno)
- Row Level Security policies

### External Services
- Claude API (AI guide generation)
- Stripe (payment processing)
- Apple HealthKit (workout data)

---

## Development Status

### ✅ Completed Steps

**Step 1-2:** Project initialization and Supabase configuration
**Step 3:** Google OAuth authentication
**Step 4:** Navigation (bottom tabs + nested stacks)
**Step 5:** Standard practice guides (5 pre-made plans)
**Step 6:** Running session tracking
**Step 7:** Dashboard & analytics
**Step 8:** Stripe subscription integration
**Step 9:** AI custom guide generation with Claude
**Step 10:** Apple HealthKit integration
**Step 11:** Polish & error handling
**Step 12:** Final testing & optimization

**Status:** ✅ **Production Ready**

---

## Cost Breakdown

### Monthly Costs (estimated for 1,000 users)

| Service | Estimated Cost |
|---------|----------------|
| Supabase | $25 |
| Anthropic Claude | $50 (1000 guides @ $0.05 each) |
| Stripe | ~$200 (2.9% + $0.30 per transaction) |
| **Total** | **~$275/month** |

**Revenue:** 1,000 users × $7 = $7,000/month
**Profit:** $7,000 - $275 = **$6,725/month**

---

## Troubleshooting

### Common Issues

**App won't start**
→ Delete `node_modules` and run `npm install`

**HealthKit not working**
→ Ensure running on physical iOS device (not simulator)

**Google OAuth fails**
→ Check Google Client ID in app.json

**AI generation fails**
→ Verify ANTHROPIC_API_KEY in Supabase secrets

**TypeScript errors**
→ Run `npx tsc --noEmit` to see all errors

---

## License

MIT

---

## Credits

**Built with:**
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Supabase](https://supabase.com/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Stripe](https://stripe.com/)
- [React Native Paper](https://reactnativepaper.com/)

---

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** January 2025
