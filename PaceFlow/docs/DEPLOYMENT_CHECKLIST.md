# PaceFlow - Deployment Checklist

Complete checklist for deploying PaceFlow to production.

---

## Pre-Deployment

### Code Quality

- [x] All TypeScript compilation passes (`npx tsc --noEmit`)
- [x] No console errors or warnings
- [x] All features implemented
- [x] Error boundary in place
- [x] Form validation complete
- [x] Loading states implemented

### Testing

- [ ] Manual testing completed (see TEST_PLAN.md)
- [ ] Google OAuth login works
- [ ] Onboarding flow completes
- [ ] Sessions can be added/viewed/deleted
- [ ] Dashboard displays correct stats
- [ ] Standard guides load properly
- [ ] AI guide generation tested (with API key)
- [ ] HealthKit sync tested (on iOS device)
- [ ] Subscription status displays correctly
- [ ] Error handling verified

### Documentation

- [x] README.md complete
- [x] TEST_PLAN.md created
- [x] STRIPE_SETUP.md documented
- [x] AI_CUSTOM_GUIDES.md documented
- [x] HEALTHKIT_INTEGRATION.md documented
- [x] DEPLOYMENT_CHECKLIST.md created

---

## External Services Setup

### 1. Supabase

- [ ] Production project created
- [ ] Database migrations run
  ```bash
  supabase db push
  ```
- [ ] Row Level Security policies enabled
- [ ] Google OAuth provider configured
- [ ] Edge Functions deployed
  ```bash
  supabase functions deploy generate-custom-guide
  ```
- [ ] Secrets configured
  ```bash
  supabase secrets set ANTHROPIC_API_KEY=your_key
  ```
- [ ] Production URL and anon key saved

### 2. Google Cloud Console

- [ ] Project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 credentials created
- [ ] iOS URL scheme added: `com.googleusercontent.apps.YOUR_CLIENT_ID`
- [ ] Authorized redirect URIs configured
- [ ] OAuth consent screen completed
- [ ] App published (not in testing mode)
- [ ] Client ID saved for `.env`

### 3. Stripe

- [ ] Production account created (not test mode)
- [ ] Product created: "PaceFlow Pro"
- [ ] Price set: $7/month
- [ ] Trial period configured: 7 days
- [ ] Webhook endpoint created
- [ ] Webhook secret saved
- [ ] Publishable key (live) saved
- [ ] Tax settings configured (if applicable)
- [ ] Payout method configured

### 4. Anthropic Claude

- [ ] Production API key created
- [ ] Usage limits reviewed
- [ ] Billing configured
- [ ] API key added to Supabase secrets
- [ ] Cost monitoring enabled

### 5. Apple Developer

- [ ] Developer account ($99/year) active
- [ ] App ID created: `com.paceflow.app`
- [ ] HealthKit capability enabled
- [ ] Push notifications configured (optional)
- [ ] App Store Connect app created
- [ ] Certificates and provisioning profiles generated

---

## Environment Configuration

### Production .env

Create `.env.production`:

```env
# Supabase (PRODUCTION)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Stripe (LIVE KEYS)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_production_client_id.apps.googleusercontent.com
```

**IMPORTANT:**
- Use LIVE Stripe keys (not test keys)
- Use production Supabase project (not development)
- Never commit `.env` files to git

---

## App Configuration

### app.json Updates

```json
{
  "expo": {
    "name": "PaceFlow",
    "slug": "paceflow",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "paceflow",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.paceflow.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSHealthShareUsageDescription": "PaceFlow needs access to your running workouts to automatically sync your training data and provide personalized insights.",
        "NSHealthUpdateUsageDescription": "PaceFlow needs permission to save your running sessions to Apple Health.",
        "UIBackgroundModes": ["fetch"]
      }
    }
  }
}
```

Verify:
- [ ] Bundle identifier matches App Store Connect
- [ ] Version number is correct
- [ ] Build number increments
- [ ] HealthKit permissions are accurate

---

## Build & Submit

### iOS Build (EAS)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Build for production:**
   ```bash
   eas build --platform ios --profile production
   ```

5. **Wait for build** (~10-15 minutes)

6. **Download .ipa file**

### App Store Connect

1. **Upload to App Store:**
   ```bash
   eas submit --platform ios
   ```

   OR manually upload via Transporter app

2. **Complete App Store listing:**
   - [ ] App name: "PaceFlow"
   - [ ] Subtitle: "AI-Powered Running Coach"
   - [ ] Description (4000 char max)
   - [ ] Keywords: running, training, AI, fitness, health
   - [ ] Support URL
   - [ ] Marketing URL
   - [ ] Privacy Policy URL
   - [ ] Category: Health & Fitness

3. **App Screenshots:**
   - [ ] 6.5" iPhone (1284 x 2778) - 3-10 screenshots
   - [ ] 5.5" iPhone (1242 x 2208) - 3-10 screenshots
   - [ ] iPad Pro (2048 x 2732) - Optional

4. **App Preview (Optional):**
   - [ ] 15-30 second video demo

5. **Rating:**
   - [ ] Age rating questionnaire completed

6. **Review Information:**
   - [ ] Demo account credentials (if login required)
   - [ ] Notes for reviewer
   - [ ] Contact information

7. **Version Release:**
   - [ ] Automatic release
   - [ ] OR Manual release

8. **Submit for Review**

---

## Legal & Compliance

### Required Documents

- [ ] **Privacy Policy** - Required by App Store
  - Data collection practices
  - Third-party services (Supabase, Stripe, Anthropic)
  - User rights (data deletion, export)
  - Contact information

- [ ] **Terms of Service** - Recommended
  - Subscription terms
  - Refund policy
  - Acceptable use policy
  - Limitation of liability

- [ ] **End User License Agreement (EULA)** - Optional
  - Use standard Apple EULA or custom

### Hosting Legal Documents

Host on:
- Your own website
- GitHub Pages
- Netlify/Vercel
- Notion public page

Update URLs in App Store Connect.

---

## Monitoring & Analytics

### Error Tracking (Recommended)

Set up error monitoring service:
- [ ] Sentry
- [ ] Bugsnag
- [ ] Firebase Crashlytics

### Analytics (Optional)

Track user behavior:
- [ ] Google Analytics
- [ ] Mixpanel
- [ ] Amplitude

### Performance Monitoring

- [ ] Expo Analytics (built-in)
- [ ] Custom logging to Supabase

---

## Post-Launch

### Day 1

- [ ] Monitor crash reports
- [ ] Check App Store reviews
- [ ] Verify Stripe subscriptions processing
- [ ] Test live OAuth flow
- [ ] Monitor Supabase usage
- [ ] Check Anthropic API usage/costs

### Week 1

- [ ] Respond to user reviews
- [ ] Fix critical bugs (if any)
- [ ] Monitor retention rates
- [ ] Track subscription conversions
- [ ] Review API costs

### Month 1

- [ ] Analyze user feedback
- [ ] Plan next features
- [ ] Optimize conversion funnel
- [ ] Review infrastructure costs
- [ ] Scale resources if needed

---

## Rollback Plan

If critical issues occur:

1. **Remove app from sale:**
   - App Store Connect → Pricing & Availability → Remove from sale

2. **Submit hotfix:**
   ```bash
   # Fix critical bug
   # Increment build number
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

3. **Expedited review:**
   - Request expedited review in App Store Connect
   - Explain critical nature of fix

---

## Cost Monitoring

### Monthly Cost Tracking

Set up alerts for:
- [ ] Supabase usage > $50/month
- [ ] Anthropic API > $100/month
- [ ] Stripe fees > expected

### Break-Even Analysis

**Costs:**
- Supabase: $25/month
- Anthropic: $50/month (1000 guides)
- Stripe: ~$200/month (on $7k revenue)
- Apple Developer: $99/year (~$8/month)
- **Total:** ~$283/month

**Break-Even:** 41 paying subscribers ($7 × 41 = $287)

**Profit at scale:**
- 100 users: $700 - $283 = $417/month
- 500 users: $3,500 - $283 = $3,217/month
- 1,000 users: $7,000 - $283 = $6,717/month

---

## Security Checklist

- [ ] All API keys stored securely (not in code)
- [ ] Production environment variables set
- [ ] RLS policies enabled in Supabase
- [ ] Stripe webhook signature verification
- [ ] HTTPS only (enforced by Supabase)
- [ ] Input validation on all forms
- [ ] SQL injection protection (via Supabase)
- [ ] XSS protection
- [ ] No sensitive data in logs

---

## Final Pre-Launch Checklist

### Code

- [x] TypeScript compiles without errors
- [x] No TODO comments in critical code
- [x] Console.log statements removed (or minimal)
- [x] Error boundary implemented
- [x] All assets optimized (images, fonts)

### Services

- [ ] All external services configured
- [ ] Production environment variables set
- [ ] API keys valid and active
- [ ] Database migrations run
- [ ] Edge Functions deployed

### Testing

- [ ] End-to-end testing completed
- [ ] Cross-device testing (iPhone models)
- [ ] Network error scenarios tested
- [ ] Payment flow tested (Stripe test mode)
- [ ] HealthKit tested on physical device

### Legal

- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] EULA reviewed (if custom)

### App Store

- [ ] Build uploaded
- [ ] Metadata completed
- [ ] Screenshots uploaded
- [ ] Review info provided
- [ ] Submitted for review

---

## Launch Day

### 8:00 AM
- [ ] Check App Store status
- [ ] Verify app is live
- [ ] Test download on fresh device
- [ ] Test full registration flow

### 12:00 PM
- [ ] Monitor error logs
- [ ] Check Stripe dashboard
- [ ] Review initial user feedback

### 6:00 PM
- [ ] Respond to first reviews
- [ ] Check subscription metrics
- [ ] Monitor infrastructure

---

## Success Metrics

### Week 1 KPIs

- [ ] Downloads: Target 100+
- [ ] Registrations: Target 50+
- [ ] Trial starts: Target 30+
- [ ] Conversions to paid: Target 5+
- [ ] Retention (D1): Target 60%+
- [ ] Crash rate: Target <1%

### Month 1 KPIs

- [ ] Downloads: Target 500+
- [ ] Active users: Target 200+
- [ ] Paying subscribers: Target 50+
- [ ] MRR (Monthly Recurring Revenue): Target $350+
- [ ] Churn rate: Target <20%

---

## Support

### User Support Channels

- [ ] Email: support@paceflow.app
- [ ] In-app feedback form
- [ ] App Store review responses
- [ ] FAQ/Help Center (optional)

### Internal Communication

- [ ] Team Slack/Discord
- [ ] Bug tracking (GitHub Issues)
- [ ] Feature requests (GitHub Discussions)

---

## Congratulations!

You're ready to launch PaceFlow! 🚀

Remember:
- Monitor closely in first 24 hours
- Respond to user feedback quickly
- Be prepared to push hotfixes
- Celebrate your launch! 🎉

---

**Checklist Last Updated:** January 2025
**Target Launch Date:** __________
**Actual Launch Date:** __________
