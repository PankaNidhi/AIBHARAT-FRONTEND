import { FacilitySummary } from './EmissionsService';
import { Project } from '../types/project';

export interface ChatbotResponse {
  textResponse: string;
  audioUrl?: string;
  analysis?: any;
}

class LocalChatbotService {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private currentProjects: Project[] = [];

  async sendMessage(
    userMessage: string,
    systemData: FacilitySummary | null,
    projects?: Project[]
  ): Promise<ChatbotResponse> {
    try {
      // Store context for response generation
      if (projects) this.currentProjects = projects;

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Generate response based on system data and user message
      const response = this.generateResponse(userMessage, systemData);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return {
        textResponse: response,
        analysis: {
          timestamp: new Date().toISOString(),
          model: 'Local Mock Assistant',
          systemDataIncluded: !!systemData,
          projectsIncluded: !!projects,
        },
      };
    } catch (error) {
      console.error('Local chatbot error:', error);
      throw error;
    }
  }

  private generateResponse(userMessage: string, systemData: FacilitySummary | null): string {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Extract data from systemData
    const facilityId = systemData?.facilityId || 'Facility-001';
    const co2Level = systemData?.latestEmissions?.co2Level || 0;
    const emissionLevel = co2Level > 500 ? 'high' : co2Level > 300 ? 'moderate' : 'normal';
    const gasStatus = systemData?.gasStatus?.status || 'normal';
    const fireStatus = systemData?.fireStatus?.status || 'normal';
    const wasteStats = systemData?.wasteStats || { totalBins: 0, fullBins: 0, averageFillLevel: 0 };
    const alertCounts = systemData?.activeAlerts || { critical: 0, high: 0, medium: 0, low: 0 };
    const totalAlerts = alertCounts.critical + alertCounts.high + alertCounts.medium + alertCounts.low;

    // Project analytics
    const totalProjects = this.currentProjects?.length || 0;
    const activeProjects = this.currentProjects?.filter(p => p.status === 'scaling' || p.status === 'implementation').length || 0;
    const totalCO2Reduction = this.currentProjects?.reduce((sum, p) => sum + p.co2Reduction, 0) || 0;
    const totalInvestment = this.currentProjects?.reduce((sum, p) => sum + p.investmentValue, 0) || 0;

    // SPECIFIC QUESTION MATCHING - Return only relevant answer
    
    // Project status queries
    if (lowerMessage.includes('project') && (lowerMessage.includes('status') || lowerMessage.includes('update'))) {
      if (totalProjects === 0) return 'No projects found.';
      const projects = this.currentProjects || [];
      const statusList = projects.map(p => `• ${p.name}: ${p.status} (TRL ${p.trlLevel})`).join('\n');
      return `Project Status:\n${statusList}`;
    }

    // Project details
    if (lowerMessage.includes('project') && (lowerMessage.includes('detail') || lowerMessage.includes('information'))) {
      if (totalProjects === 0) return 'No projects available.';
      const projects = this.currentProjects || [];
      return projects.map(p => 
        `${p.name}\n` +
        `  Country: ${p.country}\n` +
        `  Sector: ${p.sector}\n` +
        `  Status: ${p.status}\n` +
        `  CO2 Reduction: ${p.co2Reduction} tons\n` +
        `  Investment: $${p.investmentValue}M`
      ).join('\n\n');
    }

    // CO2 level
    if (lowerMessage.includes('co2') || lowerMessage.includes('emission')) {
      return `CO2 Level: ${co2Level.toFixed(2)} ppm (${emissionLevel})`;
    }

    // Gas status
    if (lowerMessage.includes('gas')) {
      return `Gas Status: ${gasStatus}`;
    }

    // Fire status
    if (lowerMessage.includes('fire')) {
      return `Fire Status: ${fireStatus}`;
    }

    // Alerts
    if (lowerMessage.includes('alert')) {
      if (totalAlerts === 0) return 'No active alerts.';
      return `Active Alerts: Critical: ${alertCounts.critical}, High: ${alertCounts.high}, Medium: ${alertCounts.medium}, Low: ${alertCounts.low}`;
    }

    // Waste bins
    if (lowerMessage.includes('waste') || lowerMessage.includes('bin')) {
      return `Waste Bins: ${wasteStats.totalBins} total, ${wasteStats.fullBins} full (${wasteStats.averageFillLevel.toFixed(1)}% avg)`;
    }

    // Portfolio summary
    if (lowerMessage.includes('portfolio')) {
      return `Portfolio: ${totalProjects} projects, ${activeProjects} active, ${totalCO2Reduction.toFixed(0)} tons CO2 reduction, $${totalInvestment.toFixed(1)}M investment`;
    }

    // Facility status
    if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'status') {
      return `Facility: ${facilityId}\nCO2: ${co2Level.toFixed(2)} ppm | Gas: ${gasStatus} | Fire: ${fireStatus} | Alerts: ${totalAlerts} | Waste: ${wasteStats.fullBins}/${wasteStats.totalBins}`;
    }

    // Help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      return `Ask about: project status, project details, CO2, gas, fire, alerts, waste, portfolio, or facility status`;
    }

    // Default - ask for clarification
    return `Please be more specific. Ask about: project status, project details, CO2 level, gas status, fire status, alerts, waste, or portfolio.`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }
}

export default new LocalChatbotService();
