import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CustomGuideRequest {
  userId: string
  goal: string
  fitnessLevel: string
  durationWeeks: number
  daysPerWeek: number
  hasInjuries: boolean
  injuryDetails?: string
  additionalNotes?: string
}

interface GuideSession {
  week: number
  day: number
  type: string
  description: string
  distance?: number
  duration?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      userId,
      goal,
      fitnessLevel,
      durationWeeks,
      daysPerWeek,
      hasInjuries,
      injuryDetails,
      additionalNotes,
    }: CustomGuideRequest = await req.json()

    // Validate inputs
    if (!userId || !goal || !fitnessLevel || !durationWeeks || !daysPerWeek) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Build prompt for Claude
    const prompt = buildTrainingGuidePrompt({
      goal,
      fitnessLevel,
      durationWeeks,
      daysPerWeek,
      hasInjuries,
      injuryDetails,
      additionalNotes,
    })

    // Call Claude API
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json()
    const generatedContent = claudeData.content[0].text

    // Parse the generated content to extract guide data
    const parsedGuide = parseGuideResponse(generatedContent)

    // Save to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    )

    const { data: guide, error: guideError } = await supabase
      .from('custom_guides')
      .insert({
        user_id: userId,
        title: parsedGuide.title,
        description: parsedGuide.description,
        goal,
        fitness_level: fitnessLevel,
        duration_weeks: durationWeeks,
        days_per_week: daysPerWeek,
        sessions: parsedGuide.sessions,
        generated_by_ai: true,
      })
      .select()
      .single()

    if (guideError) {
      console.error('Database error:', guideError)
      throw guideError
    }

    return new Response(
      JSON.stringify({ guide }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function buildTrainingGuidePrompt(params: {
  goal: string
  fitnessLevel: string
  durationWeeks: number
  daysPerWeek: number
  hasInjuries: boolean
  injuryDetails?: string
  additionalNotes?: string
}): string {
  return `You are an expert running coach creating a personalized training plan. Generate a detailed ${params.durationWeeks}-week training guide with the following specifications:

**Runner Profile:**
- Goal: ${params.goal}
- Fitness Level: ${params.fitnessLevel}
- Training Duration: ${params.durationWeeks} weeks
- Training Days Per Week: ${params.daysPerWeek}
- Has Injuries: ${params.hasInjuries ? 'Yes' : 'No'}
${params.hasInjuries && params.injuryDetails ? `- Injury Details: ${params.injuryDetails}` : ''}
${params.additionalNotes ? `- Additional Notes: ${params.additionalNotes}` : ''}

**Requirements:**
1. Create a progressive training plan that builds safely toward the goal
2. Include variety: easy runs, tempo runs, intervals, long runs, rest days
3. If injuries are mentioned, account for them with appropriate modifications
4. Include specific distances (in kilometers) and durations (in seconds) for each session
5. Provide clear, actionable descriptions for each workout

**Output Format (JSON):**
Return ONLY a valid JSON object with this structure:
{
  "title": "Brief title for the training plan (max 60 chars)",
  "description": "2-3 sentence overview of the plan's philosophy and progression",
  "sessions": [
    {
      "week": 1,
      "day": 1,
      "type": "easy_run|tempo|intervals|long_run|rest|recovery",
      "description": "Detailed workout description",
      "distance": 5.0,
      "duration": 1800
    }
  ]
}

**Important:**
- Total sessions should equal: ${params.durationWeeks} weeks × ${params.daysPerWeek} days
- Distance in kilometers (use decimals, e.g., 5.0, 10.5)
- Duration in seconds (e.g., 1800 for 30 minutes, 3600 for 1 hour)
- Type must be one of: easy_run, tempo, intervals, long_run, rest, recovery, cross_training
- Week numbers from 1 to ${params.durationWeeks}
- Day numbers from 1 to 7 within each week
- Rest days should have no distance/duration (omit those fields)
- Include proper warm-up, cool-down in descriptions where appropriate

Generate the complete training plan now as valid JSON only (no additional text).`
}

function parseGuideResponse(response: string): {
  title: string
  description: string
  sessions: GuideSession[]
} {
  try {
    // Extract JSON from response (Claude might wrap it in markdown code blocks)
    let jsonStr = response.trim()

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr)

    // Validate structure
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.sessions)) {
      throw new Error('Invalid guide structure')
    }

    return {
      title: parsed.title,
      description: parsed.description,
      sessions: parsed.sessions,
    }
  } catch (error) {
    console.error('Failed to parse guide response:', error)
    console.error('Response was:', response)
    throw new Error('Failed to parse AI-generated guide. Please try again.')
  }
}
