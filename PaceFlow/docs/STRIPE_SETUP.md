# Stripe Subscription Setup Guide

This guide walks you through setting up Stripe subscriptions for PaceFlow.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Supabase project configured
- Environment variables set up

---

## Step 1: Create Stripe Account & Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add to `.env`:
   ```
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...  # For Supabase Edge Function
   ```

**Important:** Use test keys for development!

---

## Step 2: Create Subscription Product

1. In Stripe Dashboard, go to **Products**
2. Click **Add product**
3. Fill in:
   - **Name:** PaceFlow Premium
   - **Description:** AI-powered running coach with unlimited features
   - **Pricing:** Recurring
   - **Price:** $7.00 USD
   - **Billing period:** Monthly
4. Enable **7-day free trial** in pricing options
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_...`)
7. Add to `.env`:
   ```
   EXPO_PUBLIC_STRIPE_PRICE_ID=price_...
   ```

---

## Step 3: Create Supabase Edge Function for Checkout

Create a Supabase Edge Function to handle secure payment processing:

### File: `supabase/functions/create-checkout-session/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, email } = await req.json()

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID'),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId,
        },
      },
      success_url: `paceflow://subscription-success`,
      cancel_url: `paceflow://subscription-cancelled`,
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

Deploy the function:
```bash
supabase functions deploy create-checkout-session --no-verify-jwt
```

---

## Step 4: Set Up Webhooks

### Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to Supabase Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Create Webhook Handler

File: `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.user_id

      await supabase
        .from('users')
        .update({
          subscription_status: subscription.status === 'active' ? 'active' : 'trial',
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: subscription.customer as string,
        })
        .eq('id', userId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.user_id

      await supabase
        .from('users')
        .update({
          subscription_status: 'expired',
        })
        .eq('id', userId)

      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
```

Deploy:
```bash
supabase functions deploy stripe-webhook
```

---

## Step 5: Configure App

The app is already configured to use Stripe. Just ensure your `.env` has:

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_STRIPE_PRICE_ID=price_...
```

---

## Testing

### Test Cards

Use these test cards in development:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires 3DS:** 4000 0027 6000 3184

Any future expiry date and any CVC will work.

### Test Flow

1. Sign up with Google
2. Complete onboarding
3. Tap "Start 7-Day Trial" on subscription screen
4. Enter test card details
5. Confirm payment
6. Verify subscription status in users table

---

## Subscription Status Flow

1. **trial** - First 7 days, all features unlocked
2. **active** - After trial, paid subscription
3. **cancelled** - User cancelled, still active until period end
4. **expired** - Subscription ended, limited access

---

## Features Behind Subscription

According to requirements, ALL features are available during 7-day trial:
- Standard training guides
- Custom AI guides
- Session tracking
- Apple Watch sync
- Dashboard analytics

After trial ends without payment → expired status → limited or no access.

---

## Troubleshooting

### Error: "Invalid API Key"
- Check STRIPE_SECRET_KEY in Supabase secrets
- Make sure you're using the correct key (test vs live)

### Webhook not receiving events
- Verify webhook URL is correct
- Check webhook signing secret matches
- Test with Stripe CLI: `stripe listen --forward-to https://...`

### Subscription not updating in database
- Check Supabase Edge Function logs
- Verify RLS policies allow updates
- Check metadata.user_id is set correctly

---

## Production Checklist

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test complete subscription flow end-to-end
- [ ] Set up Stripe billing portal for cancellations
- [ ] Configure email receipts in Stripe
- [ ] Set up subscription analytics
- [ ] Test trial → paid conversion
- [ ] Test cancellation flow
- [ ] Implement proper error handling
- [ ] Add loading states for payment processing

---

## Security Notes

- **Never** expose STRIPE_SECRET_KEY in client code
- Always process payments server-side (Supabase Edge Functions)
- Validate webhook signatures
- Use HTTPS for all endpoints
- Implement rate limiting on Edge Functions
- Log all subscription events for auditing

---

## Support Resources

- [Stripe React Native Docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Status:** Requires manual setup with Stripe account
**Complexity:** Medium (server-side setup required)
**Time:** ~30-45 minutes for complete setup
