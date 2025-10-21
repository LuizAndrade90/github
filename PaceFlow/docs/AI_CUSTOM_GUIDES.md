# AI Custom Guide Generation

This feature uses Claude AI (Anthropic) to generate personalized running training plans based on user input.

## Overview

Users can create custom training guides tailored to their:
- Goal (5K, 10K, Half Marathon, Marathon, General Fitness)
- Fitness level (Beginner, Intermediate, Advanced)
- Training duration (4, 8, 12, or 16 weeks)
- Days per week (3, 4, 5, or 6 days)
- Injuries or limitations
- Additional preferences

## Architecture

### Frontend Flow

1. **User Input Screen** (`CreateCustomGuideScreen.tsx`)
   - User selects their parameters using segmented buttons
   - Optional injury details and additional notes
   - Triggers guide generation

2. **Custom Guides Hook** (`useCustomGuides.ts`)
   - Handles API calls to Supabase Edge Function
   - Manages loading states
   - Refreshes guides list after generation

3. **Display Generated Guide**
   - Custom guides are saved to `custom_guides` table
   - Displayed in GuideDetailScreen (same as standard guides)
   - Automatically navigates to guide after generation

### Backend (Supabase Edge Function)

**Function:** `generate-custom-guide`

**Location:** `supabase/functions/generate-custom-guide/index.ts`

**Process:**
1. Receives user parameters from frontend
2. Validates required fields
3. Builds detailed prompt for Claude API
4. Calls Claude 3.5 Sonnet API
5. Parses JSON response from Claude
6. Saves guide to `custom_guides` table
7. Returns generated guide to frontend

**Claude API Integration:**
- Model: `claude-3-5-sonnet-20241022`
- Max tokens: 4096
- Output format: Structured JSON with sessions array

### Prompt Engineering

The prompt instructs Claude to:
- Create a progressive, safe training plan
- Include variety (easy runs, tempo, intervals, long runs, rest)
- Account for injuries if mentioned
- Provide specific distances (km) and durations (seconds)
- Return ONLY valid JSON (no markdown wrapper)

**Session Types:**
- `easy_run` - Base aerobic training
- `tempo` - Lactate threshold training
- `intervals` - Speed work
- `long_run` - Endurance building
- `rest` - Recovery day
- `recovery` - Active recovery
- `cross_training` - Non-running activities

## Setup Requirements

### 1. Environment Variables

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Add to Supabase Edge Function secrets:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 2. Deploy Edge Function

```bash
cd PaceFlow
supabase functions deploy generate-custom-guide
```

### 3. Get Anthropic API Key

1. Sign up at https://console.anthropic.com
2. Create a new API key
3. Add to environment variables (see above)

## Database Schema

Custom guides are stored in the `custom_guides` table:

```sql
CREATE TABLE custom_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal TEXT NOT NULL,
  fitness_level TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  sessions JSONB NOT NULL,
  generated_by_ai BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Sessions JSONB Structure:**
```json
[
  {
    "week": 1,
    "day": 1,
    "type": "easy_run",
    "description": "30-minute easy pace run to build aerobic base",
    "distance": 5.0,
    "duration": 1800
  }
]
```

## Testing

### Manual Test Flow

1. Navigate to Guides tab
2. Tap "Create AI-Powered Custom Guide"
3. Fill in parameters:
   - Goal: 5K Race
   - Fitness: Beginner
   - Duration: 8 weeks
   - Days/week: 4
   - No injuries
4. Tap "Generate Custom Guide"
5. Wait for AI to generate (~5-15 seconds)
6. View generated guide with weekly breakdown

### Expected Behavior

- Loading indicator during generation
- Success alert upon completion
- Auto-navigation to guide detail screen
- Guide appears in user's custom guides list
- All sessions have proper week/day/type/description
- Distances and durations are realistic

## Error Handling

### Common Errors

**"ANTHROPIC_API_KEY not configured"**
- Add API key to Supabase secrets

**"Failed to parse AI-generated guide"**
- Claude returned invalid JSON
- Check Claude API response in Edge Function logs
- Retry generation

**"Edge function error"**
- Check Supabase function logs: `supabase functions logs generate-custom-guide`
- Verify API key is valid
- Check Anthropic API status

## Cost Considerations

**Claude 3.5 Sonnet Pricing (as of Jan 2025):**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Estimated Cost per Guide:**
- Prompt: ~1,000 tokens ($0.003)
- Response: ~3,000 tokens ($0.045)
- **Total: ~$0.05 per custom guide**

For a user base generating 1,000 custom guides/month:
- Monthly cost: ~$50
- Very affordable for a premium feature

## Future Enhancements

- [ ] Save prompt/response for debugging
- [ ] Allow users to regenerate guides
- [ ] Provide guide editing capability
- [ ] Add guide rating/feedback system
- [ ] Include nutrition and recovery advice
- [ ] Support multi-language guide generation
- [ ] Add guide versioning (v1, v2, etc.)
- [ ] Cache similar requests to reduce API costs

## Security Notes

- API key stored securely in Supabase secrets (never exposed to client)
- All API calls server-side only
- RLS policies ensure users only see their own custom guides
- Input validation prevents malicious prompts
- Rate limiting recommended to prevent abuse

---

**Status:** Functional, requires Anthropic API key setup
**Complexity:** Medium (AI integration + prompt engineering)
**User Value:** High (core differentiator for PaceFlow)
