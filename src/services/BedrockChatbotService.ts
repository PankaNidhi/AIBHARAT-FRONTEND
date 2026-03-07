import { API_CONFIG } from '../config/api';

export interface ChatbotAnalysis {
  sentiment: string;
  urgency: string;
  recommendations: string[];
}

export interface ChatbotResponse {
  textResponse: string;
  audioUrl?: string;
  analysis: ChatbotAnalysis;
}

class BedrockChatbotService {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  async sendMessage(
    userMessage: string,
    systemData: any
  ): Promise<ChatbotResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Call Bedrock Lambda function
      const response = await fetch(`${API_CONFIG.BASE_URL}/bedrock-chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          systemData,
          conversationHistory: this.conversationHistory,
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

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return {
        textResponse: result.textResponse,
        audioUrl: result.audioUrl,
        analysis: result.analysis,
      };
    } catch (error) {
      console.error('Bedrock chatbot error:', error);
      throw error;
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }
}

export default new BedrockChatbotService();
