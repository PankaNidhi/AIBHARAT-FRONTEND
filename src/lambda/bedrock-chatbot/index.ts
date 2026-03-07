import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: 'ap-south-1' });

interface ChatbotRequest {
  userMessage: string;
  systemData?: any;
  projects?: any[];
  conversationHistory?: Array<{ role: string; content: string }>;
  applicationContext?: string;
  enableVoice?: boolean;
}

interface ChatbotResponse {
  textResponse: string;
  audioUrl?: string;
  analysis: {
    sentiment: string;
    urgency: string;
    questionType: string;
    recommendations: string[];
    timestamp: string;
    model: string;
  };
}

/**
 * Analyze user message to determine sentiment, urgency, and question type
 */
async function analyzeQuestion(userMessage: string): Promise<{ sentiment: string; urgency: string; questionType: string }> {
  const analysisPrompt = `Analyze this user message and respond with ONLY a JSON object (no markdown, no extra text):
{
  "sentiment": "positive|neutral|negative",
  "urgency": "critical|high|normal|low",
  "questionType": "status|alert|recommendation|data|help|other"
}

User message: "${userMessage}"`;

  const payload = {
    anthropic_version: 'bedrock-2023-06-01',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify(payload),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const analysisText = responseBody.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { sentiment: 'neutral', urgency: 'normal', questionType: 'general' };
  } catch (error) {
    console.error('Error analyzing question:', error);
    return { sentiment: 'neutral', urgency: 'normal', questionType: 'general' };
  }
}

/**
 * Generate intelligent response using Claude 3 Haiku with full application context
 */
async function generateResponse(
  userMessage: string,
  systemData: any,
  projects: any[],
  conversationHistory: Array<{ role: string; content: string }>,
  applicationContext: string
): Promise<string> {
  const systemPrompt = `You are an AI Climate Control Assistant for an industrial decarbonization platform targeting India's steel and cement industries.

Your role is to:
1. Analyze real-time emissions data and system status
2. Provide actionable insights on carbon monitoring and compliance
3. Help with project portfolio management and carbon credit tracking
4. Answer questions about MRV (Monitoring, Reporting, Verification)
5. Support decision-making for decarbonization strategies

COMPLETE APPLICATION CONTEXT:
${applicationContext}

INSTRUCTIONS:
- Be conversational and natural in your responses
- Provide specific data from the application context when relevant
- Offer actionable recommendations based on current system state
- If alerts or critical issues exist, highlight them immediately
- Reference specific projects, facilities, or metrics when answering
- Keep responses concise but informative
- Use the conversation history to maintain context`;

  const messages = [
    ...conversationHistory.slice(-10), // Include last 10 messages for context
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const payload = {
    anthropic_version: 'bedrock-2023-06-01',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  };

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify(payload),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Generate recommendations based on system state
 */
function generateRecommendations(systemData: any, projects: any[]): string[] {
  const recommendations: string[] = [];

  if (systemData?.activeAlerts) {
    const totalAlerts = (systemData.activeAlerts.critical || 0) + (systemData.activeAlerts.high || 0);
    if (totalAlerts > 0) {
      recommendations.push(`Address ${totalAlerts} active alerts to maintain compliance`);
    }
  }

  if (systemData?.wasteStats?.fullBins > 0) {
    recommendations.push(`${systemData.wasteStats.fullBins} waste bins need collection`);
  }

  if (systemData?.latestEmissions?.co2Level > 500) {
    recommendations.push('CO2 levels are elevated - review emission sources');
  }

  if (projects.length > 0) {
    const activeProjects = projects.filter(p => p.status === 'scaling' || p.status === 'implementation');
    if (activeProjects.length > 0) {
      recommendations.push(`Monitor ${activeProjects.length} active projects for progress`);
    }
  }

  return recommendations;
}

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event: any): Promise<any> => {
  // Handle preflight OPTIONS request
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      userMessage,
      systemData,
      projects = [],
      conversationHistory = [],
      applicationContext = '',
      enableVoice,
    } = body as ChatbotRequest;

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'userMessage is required' }),
      };
    }

    // Step 1: Analyze the question
    const analysis = await analyzeQuestion(userMessage);

    // Step 2: Generate intelligent response with full context
    const textResponse = await generateResponse(
      userMessage,
      systemData || {},
      projects,
      conversationHistory,
      applicationContext
    );

    // Step 3: Generate recommendations
    const recommendations = generateRecommendations(systemData, projects);

    const response: ChatbotResponse = {
      textResponse,
      audioUrl: undefined,
      analysis: {
        sentiment: analysis.sentiment,
        urgency: analysis.urgency,
        questionType: analysis.questionType,
        recommendations,
        timestamp: new Date().toISOString(),
        model: 'Claude 3 Haiku (APAC Inference Profile)',
      },
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Chatbot handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
