// AI Integration Module using Anthropic Claude API
class AIAssistant {
    constructor() {
        this.apiKey = null;
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-5-sonnet-20241022';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    async callClaude(prompt, systemPrompt = '') {
        if (!this.apiKey) {
            throw new Error('API key not configured. Please add your Anthropic API key in settings.');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 2048,
                    system: systemPrompt || 'You are a helpful AI assistant specializing in goal setting, productivity, and personal development.',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Error calling Claude API:', error);
            throw error;
        }
    }

    async generateGoalSuggestions(currentGoals, userProfile = {}) {
        const goalsContext = currentGoals.map(g => ({
            title: g.title,
            category: g.category,
            progress: g.progress,
            frequency: g.frequency
        }));

        const prompt = `
I'm helping someone improve their goal setting. Here are their current goals:

${JSON.stringify(goalsContext, null, 2)}

Based on these goals, please provide:
1. 3-5 new goal suggestions that complement their current goals
2. Improvements for existing goals (be specific)
3. Tips for better goal achievement

User context: ${JSON.stringify(userProfile)}

Format your response as a JSON array with this structure:
{
  "newGoals": [
    {
      "title": "Goal title",
      "description": "Detailed description",
      "category": "fitness|health|learning|habits|nutrition|mindfulness|other",
      "target": number,
      "frequency": "daily|weekly|monthly",
      "reasoning": "Why this goal is suggested"
    }
  ],
  "improvements": [
    {
      "goalTitle": "Existing goal title",
      "suggestion": "Specific improvement suggestion",
      "reasoning": "Why this improvement helps"
    }
  ],
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}
`;

        const systemPrompt = `You are an expert goal-setting coach with expertise in SMART goals, habit formation, and personal development. Provide actionable, specific, and realistic suggestions. Always return valid JSON.`;

        try {
            const response = await this.callClaude(prompt, systemPrompt);

            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback parsing
            return this.parseSuggestionsFromText(response);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            throw error;
        }
    }

    parseSuggestionsFromText(text) {
        // Fallback parser if JSON parsing fails
        return {
            newGoals: [{
                title: 'AI-Generated Goal',
                description: text.substring(0, 200),
                category: 'other',
                target: 1,
                frequency: 'weekly',
                reasoning: 'Generated from AI response'
            }],
            improvements: [],
            tips: ['Review the AI response for detailed suggestions']
        };
    }

    async analyzeGoalProgress(goal, activities) {
        const prompt = `
Analyze this goal and its progress:

Goal: ${goal.title}
Description: ${goal.description}
Category: ${goal.category}
Target: ${goal.target} per ${goal.frequency}
Current Progress: ${goal.progress}%
Total Activities: ${activities.length}

Recent activities (last 10):
${activities.slice(-10).map(a => `- ${a.date}: ${a.notes || 'Activity completed'}`).join('\n')}

Provide:
1. Progress assessment (honest and constructive)
2. Specific recommendations to improve
3. Motivation and encouragement
4. Pattern analysis (are they consistent? what days work best?)

Keep response concise and actionable (max 300 words).
`;

        try {
            const response = await this.callClaude(prompt);
            return response;
        } catch (error) {
            console.error('Error analyzing goal:', error);
            throw error;
        }
    }

    async getMotivationalMessage(goals) {
        const completedGoals = goals.filter(g => g.progress >= 100).length;
        const totalGoals = goals.length;
        const inProgressGoals = goals.filter(g => g.progress > 0 && g.progress < 100).length;

        const prompt = `
Generate a motivational message for someone with these stats:
- Total goals: ${totalGoals}
- Completed goals: ${completedGoals}
- In progress: ${inProgressGoals}

The message should be:
- Encouraging and positive
- Specific to their progress
- Maximum 50 words
- Include an emoji

Just return the message, nothing else.
`;

        try {
            const response = await this.callClaude(prompt);
            return response.trim();
        } catch (error) {
            console.error('Error getting motivational message:', error);
            return '🎯 Keep pushing forward! Every small step counts toward your goals.';
        }
    }

    async suggestGoalAdjustments(goal, activities) {
        const recentActivities = activities.slice(-14); // Last 2 weeks
        const completionRate = recentActivities.length / 14;

        const prompt = `
A user has this goal:
- Title: ${goal.title}
- Target: ${goal.target} per ${goal.frequency}
- Actual completion rate: ${(completionRate * 100).toFixed(1)}%

Should this goal be adjusted? Consider:
1. Is it too easy/too hard?
2. Should the target be increased/decreased?
3. Should the frequency change?

Provide a brief recommendation (max 100 words) with specific numbers if suggesting changes.
`;

        try {
            const response = await this.callClaude(prompt);
            return response;
        } catch (error) {
            console.error('Error suggesting adjustments:', error);
            return null;
        }
    }

    async generateWeeklySummary(goals, activities, healthData) {
        const prompt = `
Create a weekly summary for a user with:

Goals: ${goals.length} total (${goals.filter(g => g.progress >= 100).length} completed)

Recent activities: ${activities.length} this week

Health stats (if available):
${healthData ? JSON.stringify(healthData, null, 2) : 'Not available'}

Generate a concise, encouraging weekly summary that:
1. Highlights achievements
2. Notes areas for improvement
3. Provides 1-2 specific action items for next week
4. Keeps positive and motivating tone

Maximum 200 words.
`;

        try {
            const response = await this.callClaude(prompt);
            return response;
        } catch (error) {
            console.error('Error generating summary:', error);
            return 'Great work this week! Keep up the momentum.';
        }
    }

    async createGoalFromNaturalLanguage(description) {
        const prompt = `
Convert this natural language goal into a structured goal format:

"${description}"

Return a JSON object with this structure:
{
  "title": "Clear, concise title",
  "description": "Detailed description",
  "category": "fitness|health|learning|habits|nutrition|mindfulness|other",
  "target": number,
  "frequency": "daily|weekly|monthly"
}

Only return the JSON, nothing else.
`;

        try {
            const response = await this.callClaude(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse goal structure');
        } catch (error) {
            console.error('Error creating goal from natural language:', error);
            throw error;
        }
    }

    async getGoalRecommendationsFromHealth(healthData) {
        const prompt = `
Based on this health data, suggest 3 relevant goals:

${JSON.stringify(healthData, null, 2)}

Return a JSON array of goals with structure:
[
  {
    "title": "Goal title",
    "description": "Description",
    "category": "fitness|health|nutrition|mindfulness",
    "target": number,
    "frequency": "daily|weekly|monthly",
    "reasoning": "Why based on health data"
  }
]

Only return the JSON array.
`;

        try {
            const response = await this.callClaude(prompt);
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Error getting health-based recommendations:', error);
            return [];
        }
    }

    async chatWithAI(message, context = {}) {
        const systemPrompt = `You are a helpful AI coach for a goal tracking app. You help users:
- Set better goals
- Stay motivated
- Analyze their progress
- Overcome obstacles

Keep responses concise and actionable. Be encouraging but realistic.`;

        const contextStr = Object.keys(context).length > 0
            ? `\n\nContext: ${JSON.stringify(context, null, 2)}`
            : '';

        try {
            const response = await this.callClaude(message + contextStr, systemPrompt);
            return response;
        } catch (error) {
            console.error('Error chatting with AI:', error);
            throw error;
        }
    }
}

// Create global AI assistant instance
const aiAssistant = new AIAssistant();
