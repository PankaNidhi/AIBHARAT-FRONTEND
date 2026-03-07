import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: 'ap-south-1' });

interface ChatbotRequest {
  userMessage: string;
  systemData?: any;
  enableVoice?: boolean;
}

interface ChatbotResponse {
  textResponse: string;
  audioUrl?: string;
  analysis?: any;
}

// Analyze user message with Claude 3 Haiku
async function analyzeWithClaude(userMessage: string, systemData: any): Promise<string> {
  const systemPrompt = `You are an AI Climate Control Assistant for an industrial decarbonization platform. 
You have access to real-time emissions data and system status. Provide concise, actionable insights.

Current System Data:
${JSON.stringify(systemData, null, 2)}

Analyze the user's query and provide a detailed response based on the system data.`;

  const payload = {
    anthropic_version: 'bedrock-2023-06-01',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
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
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Error invoking Claude 3 Haiku:', error);
    throw error;
  }
}

// Generate voice response with Claude 3 Sonnet (text-based, no audio)
async function generateVoiceWithClaude(text: string): Promise<string> {
  // Claude doesn't support audio generation, so we'll return empty string
  // In production, you could use Amazon Polly for text-to-speech
  console.log('Voice generation requested but Claude does not support audio. Using text response only.');
  return '';
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
    const { userMessage, systemData, enableVoice } = body as ChatbotRequest;

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'userMessage is required' }),
      };
    }

    // Use system data passed from frontend (no DynamoDB queries)
    const analysis = await analyzeWithClaude(userMessage, systemData || {});

    // Generate voice if requested (Claude doesn't support audio, so this will be empty)
    let audioUrl: string | undefined;
    if (enableVoice) {
      audioUrl = await generateVoiceWithClaude(analysis);
    }

    const response: ChatbotResponse = {
      textResponse: analysis,
      audioUrl,
      analysis: {
        timestamp: new Date().toISOString(),
        model: 'Claude 3 Haiku (APAC Inference Profile)',
        systemDataIncluded: !!systemData,
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
