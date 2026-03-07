import { FacilitySummary } from './EmissionsService';
import { Project } from '../types/project';

export interface ChatbotAnalysis {
  sentiment: string;
  urgency: string;
  questionType: string;
  recommendations: string[];
}

export interface ChatbotResponse {
  textResponse: string;
  audioUrl?: string;
  analysis: ChatbotAnalysis;
}

interface ApplicationContext {
  systemData: FacilitySummary | null;
  projects: Project[];
  timestamp: string;
}

class OpenAIChatbotService {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private applicationContext: ApplicationContext | null = null;
  private apiKey: string = '';

  constructor() {
    // Get OpenAI API key from environment variable
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. Set VITE_OPENAI_API_KEY environment variable.');
    }
  }

  /**
   * Send message to OpenAI with full application context
   * Analyzes question and generates intelligent response
   */
  async sendMessage(
    userMessage: string,
    systemData: FacilitySummary | null,
    projects: Project[] = []
  ): Promise<ChatbotResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Store application context for this session
      this.applicationContext = {
        systemData,
        projects,
        timestamp: new Date().toISOString(),
      };

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Build system prompt with application context
      const systemPrompt = this.buildSystemPrompt(systemData, projects);

      // Prepare messages for OpenAI API
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...this.conversationHistory,
      ];

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.choices[0].message.content;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: textResponse,
      });

      // Keep conversation history manageable (last 20 messages for better context)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Analyze the response for sentiment, urgency, and recommendations
      const analysis = this.analyzeResponse(userMessage, textResponse);

      return {
        textResponse,
        analysis,
      };
    } catch (error) {
      console.error('OpenAI chatbot error:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive system prompt with application context
   */
  private buildSystemPrompt(systemData: FacilitySummary | null, projects: Project[]): string {
    const contextSummary = {
      facility: {
        id: systemData?.facilityId || 'N/A',
        emissions: {
          co2Level: systemData?.latestEmissions?.co2Level || 0,
          temperature: systemData?.latestEmissions?.temperature || 0,
          pressure: systemData?.latestEmissions?.pressure || 0,
          flowRate: systemData?.latestEmissions?.flowRate || 0,
        },
        status: {
          gas: systemData?.gasStatus?.status || 'normal',
          fire: systemData?.fireStatus?.status || 'normal',
        },
        alerts: systemData?.activeAlerts || { critical: 0, high: 0, medium: 0, low: 0 },
        waste: systemData?.wasteStats || { totalBins: 0, fullBins: 0, averageFillLevel: 0 },
      },
      portfolio: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'scaling' || p.status === 'implementation').length,
        totalCO2Reduction: projects.reduce((sum, p) => sum + p.co2Reduction, 0),
        totalInvestment: projects.reduce((sum, p) => sum + p.investmentValue, 0),
        projects: projects.map(p => ({
          name: p.name,
          country: p.country,
          sector: p.sector,
          status: p.status,
          co2Reduction: p.co2Reduction,
          investment: p.investmentValue,
        })),
      },
      pages: {
        available: [
          'Dashboard - Overview of all facilities and projects',
          'Portfolio Overview - Portfolio analytics and metrics',
          'Project List - Detailed project information',
          'Emissions Monitor - Real-time CO2, temperature, pressure, flow rate data',
          'Steel Dashboard - Steel industry specific metrics',
          'Cement Dashboard - Cement industry specific metrics',
          'CHAMPION Module - Decision cards, economic modeling, tree simulation',
          'MRV Generator - Automated MRV report generation',
          'Scenario Modeling - Financial projections and emission scenarios',
          'Climate Metrics - Sustainability metrics and compliance data',
          'Smart Alerts - Alert management and severity levels',
          'Waste Management - Bin status, collection scheduling',
          'Safety Page - Safety metrics and incident tracking',
        ],
      },
    };

    return `You are an AI Climate Control Assistant for an industrial decarbonization platform. You help users monitor emissions, manage projects, and make strategic decarbonization decisions.

You have access to the following real-time facility and project data:

${JSON.stringify(contextSummary, null, 2)}

Guidelines:
1. Provide specific, concise answers directly addressing the user's question
2. Use the facility data to give accurate, real-time information
3. When asked about emissions, waste, alerts, or projects, reference the actual data provided
4. Be helpful and professional in tone
5. If asked about features or pages, describe what's available
6. Provide recommendations when appropriate based on the data
7. Keep responses focused and avoid unnecessary verbosity
8. When data is not available, clearly state that

Available topics you can help with:
- Emissions monitoring and analysis
- Project status and portfolio management
- Waste management and collection
- Alert management and severity
- CHAMPION module features
- MRV report generation
- Scenario modeling and financial projections
- Climate metrics and compliance
- Safety and incident tracking`;
  }

  /**
   * Analyze response for sentiment, urgency, and recommendations
   */
  private analyzeResponse(userMessage: string, response: string): ChatbotAnalysis {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Determine sentiment
    let sentiment = 'neutral';
    if (lowerResponse.includes('excellent') || lowerResponse.includes('great') || lowerResponse.includes('good')) {
      sentiment = 'positive';
    } else if (lowerResponse.includes('critical') || lowerResponse.includes('urgent') || lowerResponse.includes('alert')) {
      sentiment = 'negative';
    }

    // Determine urgency
    let urgency = 'normal';
    if (lowerMessage.includes('critical') || lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
      urgency = 'critical';
    } else if (lowerMessage.includes('high') || lowerMessage.includes('important')) {
      urgency = 'high';
    } else if (lowerMessage.includes('low') || lowerMessage.includes('minor')) {
      urgency = 'low';
    }

    // Determine question type
    let questionType = 'general';
    if (lowerMessage.includes('status') || lowerMessage.includes('how')) {
      questionType = 'status';
    } else if (lowerMessage.includes('alert') || lowerMessage.includes('warning')) {
      questionType = 'alert';
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      questionType = 'recommendation';
    } else if (lowerMessage.includes('what') || lowerMessage.includes('tell')) {
      questionType = 'data';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how to')) {
      questionType = 'help';
    }

    // Extract recommendations from response
    const recommendations: string[] = [];
    if (lowerResponse.includes('recommend')) {
      recommendations.push('Follow the AI recommendations provided');
    }
    if (lowerResponse.includes('check') || lowerResponse.includes('monitor')) {
      recommendations.push('Monitor the situation closely');
    }
    if (lowerResponse.includes('action') || lowerResponse.includes('take')) {
      recommendations.push('Take appropriate action as suggested');
    }

    return {
      sentiment,
      urgency,
      questionType,
      recommendations,
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    this.applicationContext = null;
  }

  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }

  /**
   * Get current application context
   */
  getApplicationContext(): ApplicationContext | null {
    return this.applicationContext;
  }
}

export default new OpenAIChatbotService();
