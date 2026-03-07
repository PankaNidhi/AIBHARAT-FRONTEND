import { FacilitySummary } from './EmissionsService';

interface ChatResponse {
  textResponse: string;
}

/**
 * Mock Chatbot Service
 * Provides intelligent responses about system status without requiring backend
 */
class MockChatbotService {
  private knowledgeBase = {
    greetings: ['hello', 'hi', 'hey', 'greetings'],
    status: ['status', 'how is', 'what is', 'current', 'overview'],
    emissions: ['emission', 'co2', 'carbon', 'ghg', 'greenhouse'],
    alerts: ['alert', 'warning', 'issue', 'problem'],
    compliance: ['compliance', 'compliant', 'regulation', 'standard'],
    help: ['help', 'what can you', 'capabilities', 'features'],
  };

  /**
   * Process user message and generate intelligent response
   */
  async processMessage(
    userMessage: string,
    systemData: FacilitySummary | null
  ): Promise<ChatResponse> {
    const message = userMessage.toLowerCase().trim();

    // Greeting
    if (this.matchesKeywords(message, this.knowledgeBase.greetings)) {
      return {
        textResponse: this.getGreetingResponse(),
      };
    }

    // Help
    if (this.matchesKeywords(message, this.knowledgeBase.help)) {
      return {
        textResponse: this.getHelpResponse(),
      };
    }

    // System Status
    if (this.matchesKeywords(message, this.knowledgeBase.status)) {
      return {
        textResponse: this.getStatusResponse(systemData),
      };
    }

    // Emissions
    if (this.matchesKeywords(message, this.knowledgeBase.emissions)) {
      return {
        textResponse: this.getEmissionsResponse(systemData),
      };
    }

    // Alerts
    if (this.matchesKeywords(message, this.knowledgeBase.alerts)) {
      return {
        textResponse: this.getAlertsResponse(systemData),
      };
    }

    // Compliance
    if (this.matchesKeywords(message, this.knowledgeBase.compliance)) {
      return {
        textResponse: this.getComplianceResponse(systemData),
      };
    }

    // Default response
    return {
      textResponse: this.getDefaultResponse(message),
    };
  }

  private matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.includes(keyword));
  }

  private getGreetingResponse(): string {
    const greetings = [
      "Hello! I'm your AI Climate Control Assistant. How can I help you today?",
      "Hi there! I can provide information about your system status, emissions, and alerts. What would you like to know?",
      "Greetings! I'm here to help you monitor your climate control systems. Ask me anything!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getHelpResponse(): string {
    return `I can help you with:

📊 System Status - Get an overview of your facilities and operations
🌍 Emissions Data - View current emissions levels and trends
⚠️ Alerts - Check active alerts and warnings
✅ Compliance - Review compliance status and regulations
📈 Analytics - Understand your environmental impact

Try asking:
• "What's the current system status?"
• "Show me emissions data"
• "Are there any alerts?"
• "What's our compliance status?"`;
  }

  private getStatusResponse(systemData: FacilitySummary | null): string {
    if (!systemData) {
      return `System Status Overview:

🏭 Facilities: Monitoring multiple industrial sites
📊 Data Collection: Active and operational
🔄 Last Update: Real-time monitoring enabled
✅ System Health: All systems operational

The dashboard is collecting data from your facilities. Navigate to the Dashboard page to see detailed metrics.`;
    }

    const totalEmissions = systemData.totalEmissions || 0;
    const activeAlerts = systemData.activeAlerts || 0;
    const complianceRate = systemData.complianceRate || 0;

    return `System Status Overview:

🏭 Total Emissions: ${totalEmissions.toLocaleString()} tons CO2e
⚠️ Active Alerts: ${activeAlerts}
✅ Compliance Rate: ${complianceRate}%
📊 Facilities Monitored: ${systemData.facilities?.length || 0}

${activeAlerts > 0 ? '⚠️ Attention: You have active alerts that require review.' : '✅ All systems operating within normal parameters.'}`;
  }

  private getEmissionsResponse(systemData: FacilitySummary | null): string {
    if (!systemData) {
      return `Emissions Monitoring:

The system tracks emissions across multiple categories:
• Scope 1: Direct emissions from owned sources
• Scope 2: Indirect emissions from purchased energy
• Scope 3: Other indirect emissions in value chain

Navigate to the Emissions Monitor page for detailed analytics and real-time data visualization.`;
    }

    const totalEmissions = systemData.totalEmissions || 0;
    const trend = systemData.emissionsTrend || 'stable';

    return `Current Emissions Data:

🌍 Total Emissions: ${totalEmissions.toLocaleString()} tons CO2e
📈 Trend: ${trend}
📊 Breakdown available by:
   • Facility
   • Emission source
   • Time period

${trend === 'increasing' ? '⚠️ Emissions are trending upward. Consider reviewing reduction strategies.' : '✅ Emissions are within expected ranges.'}

Visit the Emissions Monitor page for detailed charts and analytics.`;
  }

  private getAlertsResponse(systemData: FacilitySummary | null): string {
    if (!systemData) {
      return `Alert Monitoring:

The system monitors for:
• Emission threshold exceedances
• Equipment malfunctions
• Compliance violations
• Data quality issues

Check the Alerts page for a complete list of active and historical alerts.`;
    }

    const activeAlerts = systemData.activeAlerts || 0;

    if (activeAlerts === 0) {
      return `✅ No Active Alerts

All systems are operating within normal parameters. The monitoring system is actively tracking:
• Emission levels
• Equipment status
• Compliance metrics
• Data quality

You'll be notified immediately if any issues arise.`;
    }

    return `⚠️ Active Alerts: ${activeAlerts}

You have ${activeAlerts} alert${activeAlerts > 1 ? 's' : ''} requiring attention.

Common alert types:
• Emission threshold exceedances
• Equipment performance issues
• Compliance warnings

Please visit the Alerts page to review and address these issues.`;
  }

  private getComplianceResponse(systemData: FacilitySummary | null): string {
    if (!systemData) {
      return `Compliance Monitoring:

The system tracks compliance with:
• EPA regulations
• State environmental standards
• Industry-specific requirements
• Internal sustainability goals

Navigate to the Compliance section for detailed reports and certification status.`;
    }

    const complianceRate = systemData.complianceRate || 0;

    if (complianceRate >= 95) {
      return `✅ Excellent Compliance Status

Compliance Rate: ${complianceRate}%

Your facilities are meeting or exceeding regulatory requirements. Key areas:
• Emissions reporting: Compliant
• Equipment standards: Compliant
• Documentation: Up to date

Keep up the great work!`;
    } else if (complianceRate >= 80) {
      return `⚠️ Compliance Status: Needs Attention

Compliance Rate: ${complianceRate}%

Some areas require improvement:
• Review non-compliant facilities
• Update documentation
• Address outstanding issues

Visit the Compliance dashboard for detailed action items.`;
    } else {
      return `🚨 Compliance Status: Critical

Compliance Rate: ${complianceRate}%

Immediate action required:
• Multiple compliance violations detected
• Regulatory deadlines approaching
• Documentation gaps identified

Please prioritize compliance issues on the Compliance dashboard.`;
    }
  }

  private getDefaultResponse(message: string): string {
    return `I understand you're asking about "${message}".

I can help you with:
• System status and overview
• Emissions data and trends
• Active alerts and warnings
• Compliance status

Try asking a more specific question, or type "help" to see what I can do!`;
  }
}

export default new MockChatbotService();
