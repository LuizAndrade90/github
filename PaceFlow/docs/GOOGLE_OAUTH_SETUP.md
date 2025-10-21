## Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication for PaceFlow.

### Prerequisites

- Google Cloud Platform account
- Supabase project already created (see supabase/README.md)

---

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**

5. Configure the OAuth consent screen (if not done):
   - Click **Configure Consent Screen**
   - Choose **External** user type
   - Fill in app information:
     - **App name**: PaceFlow
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Click **Save and Continue**

6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: PaceFlow Web Client
   - **Authorized JavaScript origins**: Leave empty for now
   - **Authorized redirect URIs**:
     - Add: `https://your-project-ref.supabase.co/auth/v1/callback`
     - Replace `your-project-ref` with your actual Supabase project reference
   - Click **Create**

7. Copy the **Client ID** and **Client Secret**

---

### Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to expand
4. Enable Google provider
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

---

### Step 3: Add Credentials to Environment

Add your Google Client ID to `.env`:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

### Step 4: Configure Redirect URLs

#### For Development (Expo Go)

1. In Google Cloud Console, add this to **Authorized redirect URIs**:
   ```
   https://auth.expo.io/@your-expo-username/PaceFlow
   ```

#### For Production (Standalone App)

1. In Google Cloud Console, add:
   ```
   paceflow://auth/callback
   ```

2. Make sure your `app.json` has the scheme configured:
   ```json
   {
     "expo": {
       "scheme": "paceflow"
     }
   }
   ```

---

### Step 5: Test Authentication

1. Start your app: `npm start`
2. Click "Continue with Google" on the login screen
3. Complete the Google sign-in flow
4. You should be redirected back to the app and see the onboarding screen

---

### Troubleshooting

#### Error: "redirect_uri_mismatch"

- Make sure the redirect URI in Google Cloud Console exactly matches the one from Supabase
- Check for trailing slashes or typos
- Format: `https://your-project-ref.supabase.co/auth/v1/callback`

#### Error: "Invalid client"

- Double-check your Client ID and Client Secret in Supabase
- Make sure they're from the correct Google Cloud project

#### Authentication works but user data not saved

- Check Supabase Table Editor to see if user record was created
- Check browser/app console for errors
- Verify RLS policies are set up correctly

---

### Next Steps

Once Google OAuth is working, you're ready to test the complete auth flow:
1. Login with Google
2. Complete onboarding
3. Access the main app

Then proceed to Step 4: Navigation & UI Foundation
