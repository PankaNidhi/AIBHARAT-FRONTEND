# OpenAI Chatbot Integration Setup

## Overview

The chatbot has been successfully migrated from AWS Bedrock to OpenAI's GPT-4 API to bypass CORS issues. The new implementation calls OpenAI directly from the frontend with no intermediary Lambda/API Gateway.

## What Changed

### Files Modified
1. **src/services/OpenAIChatbotService.ts** (NEW)
   - Direct OpenAI API integration
   - Maintains full application context (facility data, projects, alerts)
   - Conversation history management
   - Response analysis (sentiment, urgency, recommendations)

2. **src/components/SystemChatbot.tsx**
   - Updated import from `BedrockChatbotService` to `OpenAIChatbotService`
   - Updated header text to "Powered by OpenAI"
   - Updated error message to reference OpenAI API key configuration

3. **.env** and **.env.example**
   - Added `VITE_OPENAI_API_KEY` environment variable

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to **API keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-proj-`)

### Step 2: Configure Environment Variable

#### For Local Development

Edit `.env` file in `AIBHARAT-FRONTEND/` directory:

```env
VITE_API_URL=https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/prod
VITE_OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

Replace `sk-proj-your-actual-api-key-here` with your actual OpenAI API key.

#### For AWS Amplify Deployment

1. Go to AWS Amplify Console
2. Select your app (AIBHARAT-FRONTEND)
3. Go to **Deployment settings** → **Environment variables**
4. Add new environment variable:
   - **Name**: `VITE_OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
5. Redeploy the application

### Step 3: Verify Configuration

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click the chatbot button (bottom right)
4. Type a message and verify the chatbot responds

## Features

### Application Context
The chatbot has access to:
- **Real-time Facility Data**: CO2 levels, temperature, pressure, flow rate
- **System Status**: Gas status, fire status, active alerts
- **Waste Management**: Bin status, fill levels, collection scheduling
- **Project Portfolio**: Project status, CO2 reduction targets, investment values
- **Page Information**: Details about all 18 application pages

### Response Analysis
Each response includes:
- **Sentiment**: Positive, neutral, or negative
- **Urgency**: Critical, high, normal, or low
- **Question Type**: Status, alert, recommendation, data, help, or general
- **Recommendations**: Actionable suggestions based on the response

### Conversation History
- Maintains last 20 messages for context continuity
- Automatically manages history to prevent token overflow

## API Model

The service uses **GPT-4 Turbo** model with:
- Temperature: 0.7 (balanced creativity and consistency)
- Max tokens: 500 (concise responses)
- Direct HTTPS calls to `https://api.openai.com/v1/chat/completions`

## Cost Considerations

OpenAI API usage is metered. Typical costs:
- **GPT-4 Turbo**: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- Each message typically uses 500-1000 tokens depending on context

Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/account/usage/overview)

## Troubleshooting

### "OpenAI API key not configured"
- Verify `VITE_OPENAI_API_KEY` is set in `.env`
- Restart development server after changing `.env`
- For Amplify: Verify environment variable is set and app is redeployed

### "OpenAI API error: Invalid API key"
- Check that the API key is correct (starts with `sk-proj-`)
- Verify the key hasn't been revoked in OpenAI dashboard
- Ensure no extra spaces or quotes in the key

### "OpenAI API error: Rate limit exceeded"
- Wait a few minutes before retrying
- Consider upgrading your OpenAI plan for higher rate limits
- Implement request throttling if needed

### Chatbot not responding
- Check browser console for error messages
- Verify internet connection
- Ensure OpenAI API key is valid and has available credits
- Check OpenAI status page for service issues

## Fallback Behavior

If OpenAI API fails, the error message will indicate:
```
I encountered an issue connecting to the AI service. Please ensure your OpenAI API key is configured (VITE_OPENAI_API_KEY environment variable). Try again or ask a simpler question.
```

The LocalChatbotService is still available as a fallback if needed (can be re-enabled in SystemChatbot.tsx).

## Security Notes

- **API Key Protection**: Never commit `.env` file with real API keys to version control
- **Frontend Exposure**: API key is visible in frontend code - consider using a backend proxy for production
- **Rate Limiting**: Implement rate limiting on the frontend to prevent excessive API calls
- **Token Limits**: Monitor token usage to avoid unexpected costs

## Next Steps

1. Configure the OpenAI API key in your environment
2. Test the chatbot with various queries
3. Monitor API usage and costs
4. Consider implementing a backend proxy for production deployments to hide the API key

## Support

For issues with:
- **OpenAI API**: Visit [OpenAI Help Center](https://help.openai.com)
- **Application**: Check the application logs and browser console
- **Amplify Deployment**: Check Amplify build logs in AWS Console
