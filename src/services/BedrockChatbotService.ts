import { API_CONFIG } from '../config/api';
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

class BedrockChatbotService {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private applicationContext: ApplicationContext | null = null;

  /**
   * Send message to Bedrock with full application context
   * Analyzes question and generates intelligent response
   */
  async sendMessage(
    userMessage: string,
    systemData: FacilitySummary | null,
    projects: Project[] = []
  ): Promise<ChatbotResponse> {
    try {
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

      // Call Bedrock Lambda function with full context
      const response = await fetch(`${API_CONFIG.BASE_URL}/bedrock-chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          systemData,
          projects,
          conversationHistory: this.conversationHistory,
          applicationContext: this.getApplicationContextSummary(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: result.textResponse,
      });

      // Keep conversation history manageable (last 20 messages for better context)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return {
        textResponse: result.textResponse,
        audioUrl: result.audioUrl,
        analysis: result.analysis || {
          sentiment: 'neutral',
          urgency: 'normal',
          questionType: 'general',
          recommendations: [],
        },
      };
    } catch (error) {
      console.error('Bedrock chatbot error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive application context summary for Bedrock
   */
  private getApplicationContextSummary(): string {
    if (!this.applicationContext) return '';

    const { systemData, projects } = this.applicationContext;

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
          'Dashboard',
          'Portfolio Overview',
          'Project List',
          'Emissions Monitor',
          'Steel Dashboard',
          'Cement Dashboard',
          'CHAMPION Module',
          'MRV Generator',
          'Scenario Modeling',
          'Climate Metrics',
          'Smart Alerts',
          'Waste Management',
          'Safety Page',
        ],
      },
    };

    return JSON.stringify(contextSummary, null, 2);
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

export default new BedrockChatbotService();
