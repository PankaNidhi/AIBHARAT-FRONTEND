import { FacilitySummary } from './EmissionsService';

export interface ChatbotResponse {
  textResponse: string;
  audioUrl?: string;
  analysis?: any;
}

class LocalChatbotService {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  async sendMessage(
    userMessage: string,
    systemData: FacilitySummary | null
  ): Promise<ChatbotResponse> {
    try {
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
        },
      };
    } catch (error) {
      console.error('Local chatbot error:', error);
      throw error;
    }
  }

  private generateResponse(userMessage: string, systemData: FacilitySummary | null): string {
    const lowerMessage = userMessage.toLowerCase();

    // Extract data from systemData
    const facilityId = systemData?.facilityId || 'Facility-001';
    const co2Level = systemData?.latestEmissions?.co2Level || 0;
    const emissionLevel = co2Level > 500 ? 'high' : co2Level > 300 ? 'moderate' : 'normal';
    const gasStatus = systemData?.gasStatus?.status || 'normal';
    const fireStatus = systemData?.fireStatus?.status || 'normal';
    const wasteStats = systemData?.wasteStats || { totalBins: 0, fullBins: 0, averageFillLevel: 0 };
    const alertCounts = systemData?.activeAlerts || { critical: 0, high: 0, medium: 0, low: 0 };
    const totalAlerts = alertCounts.critical + alertCounts.high + alertCounts.medium + alertCounts.low;
    const lastUpdated = systemData?.timestamp ? new Date(systemData.timestamp).toLocaleTimeString() : 'N/A';

    // Status-related queries
    if (lowerMessage.includes('status') || lowerMessage.includes('how are you') || lowerMessage === 'hi' || lowerMessage === 'hello') {
      return `📊 **Facility Status Report** - ${facilityId}\n\n` +
        `✓ CO2 Level: ${co2Level.toFixed(2)} ppm (${emissionLevel})\n` +
        `✓ Gas Status: ${gasStatus}\n` +
        `✓ Fire Status: ${fireStatus}\n` +
        `✓ Active Alerts: ${totalAlerts} (Critical: ${alertCounts.critical}, High: ${alertCounts.high})\n` +
        `✓ Waste Bins: ${wasteStats.totalBins} total, ${wasteStats.fullBins} full\n` +
        `✓ Last Updated: ${lastUpdated}\n\n` +
        `All systems are operating normally. How can I assist you today?`;
    }

    // Emissions-related queries
    if (lowerMessage.includes('emission') || lowerMessage.includes('carbon') || lowerMessage.includes('co2')) {
      return `🌍 **Emissions Analysis**\n\n` +
        `Current CO2 Level: ${co2Level.toFixed(2)} ppm\n` +
        `Emission Status: ${emissionLevel.toUpperCase()}\n` +
        `Facility: ${facilityId}\n\n` +
        `The facility is currently operating at ${emissionLevel} emission levels. ` +
        `${emissionLevel === 'high' ? 'Elevated emissions detected - recommend immediate review.' : 'Normal operational parameters maintained.'}`;
    }

    // Alert-related queries
    if (lowerMessage.includes('alert') || lowerMessage.includes('warning') || lowerMessage.includes('issue')) {
      if (totalAlerts === 0) {
        return `✅ **Alert Status**\n\nNo active alerts detected. Your facility is operating within normal parameters. ` +
          `All monitoring systems are functioning correctly.`;
      } else {
        return `⚠️ **Active Alerts**\n\nYou have ${totalAlerts} active alert${totalAlerts > 1 ? 's' : ''} requiring attention:\n\n` +
          `• Critical: ${alertCounts.critical}\n` +
          `• High: ${alertCounts.high}\n` +
          `• Medium: ${alertCounts.medium}\n` +
          `• Low: ${alertCounts.low}\n\n` +
          `Review alert details in the Alerts page and take corrective action as needed.`;
      }
    }

    // Waste management queries
    if (lowerMessage.includes('waste') || lowerMessage.includes('bin') || lowerMessage.includes('collection')) {
      return `♻️ **Waste Management Status**\n\n` +
        `Total Bins: ${wasteStats.totalBins}\n` +
        `Full Bins: ${wasteStats.fullBins}\n` +
        `Average Fill Level: ${wasteStats.averageFillLevel.toFixed(1)}%\n\n` +
        `${wasteStats.fullBins > 0 ? `⚠️ ${wasteStats.fullBins} bin(s) need immediate collection.` : '✓ All bins within acceptable levels.'}`;
    }

    // Help/guidance queries
    if (lowerMessage.includes('help') || lowerMessage.includes('what can') || lowerMessage.includes('guide')) {
      return `🤖 **AI Climate Assistant - Available Commands**\n\n` +
        `I can help you with:\n` +
        `• **Status** - Get current facility status\n` +
        `• **Emissions** - View CO2 levels and trends\n` +
        `• **Alerts** - Check active alerts\n` +
        `• **Waste** - Review waste management status\n` +
        `• **Recommendations** - Get optimization suggestions\n\n` +
        `Just ask me about any of these topics!`;
    }

    // Recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('improve')) {
      return `💡 **Optimization Recommendations**\n\n` +
        `Based on current facility data:\n\n` +
        `1. **Monitor Emissions** - CO2 at ${co2Level.toFixed(2)} ppm - continue tracking\n` +
        `2. **Address Alerts** - ${totalAlerts > 0 ? `${totalAlerts} active alert(s) need attention` : 'No critical alerts'}\n` +
        `3. **Waste Management** - ${wasteStats.fullBins > 0 ? `${wasteStats.fullBins} bin(s) ready for collection` : 'Bins at optimal levels'}\n` +
        `4. **System Health** - Gas: ${gasStatus}, Fire: ${fireStatus}\n\n` +
        `For detailed recommendations, visit the Dashboard or CHAMPION Module.`;
    }

    // Default response
    return `I'm your AI Climate Control Assistant for facility ${facilityId}.\n\n` +
      `Current Status:\n` +
      `• CO2 Level: ${co2Level.toFixed(2)} ppm (${emissionLevel})\n` +
      `• Gas Status: ${gasStatus}\n` +
      `• Fire Status: ${fireStatus}\n` +
      `• Active Alerts: ${totalAlerts}\n` +
      `• Waste Bins: ${wasteStats.fullBins}/${wasteStats.totalBins} full\n\n` +
      `You can ask me about:\n` +
      `• Facility status\n` +
      `• Emissions data\n` +
      `• Active alerts\n` +
      `• Waste management\n` +
      `• Recommendations\n\n` +
      `What would you like to know?`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }
}

export default new LocalChatbotService();
