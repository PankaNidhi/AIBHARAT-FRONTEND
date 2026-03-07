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

    // Project analytics
    const totalProjects = this.currentProjects?.length || 0;
    const activeProjects = this.currentProjects?.filter(p => p.status === 'scaling' || p.status === 'implementation').length || 0;
    const totalCO2Reduction = this.currentProjects?.reduce((sum, p) => sum + p.co2Reduction, 0) || 0;
    const totalInvestment = this.currentProjects?.reduce((sum, p) => sum + p.investmentValue, 0) || 0;

    // Navigation/Help queries
    if (lowerMessage.includes('navigate') || lowerMessage.includes('page') || lowerMessage.includes('where') || lowerMessage.includes('go to')) {
      return `🗺️ **Available Pages & Navigation**\n\n` +
        `**Core Monitoring:**\n` +
        `• Dashboard (/) - Main overview\n` +
        `• Emissions Monitor - Real-time emission tracking\n` +
        `• Alerts - View all system alerts\n\n` +
        `**Industry Dashboards:**\n` +
        `• Steel Dashboard - Steel facility metrics\n` +
        `• Cement Dashboard - Cement facility metrics\n\n` +
        `**Project Management:**\n` +
        `• Portfolio Overview - All projects analytics\n` +
        `• Projects - Manage decarbonization projects\n` +
        `• Project Configuration - Configure project settings\n\n` +
        `**Advanced Analytics:**\n` +
        `• Scenario Modeling - Financial & emission projections\n` +
        `• CHAMPION Module - AI decision support\n` +
        `• MRV Generator - Generate compliance reports\n` +
        `• Climate Metrics - Sustainability dashboard\n\n` +
        `**Waste & Safety:**\n` +
        `• Waste Management - Bin tracking & analytics\n` +
        `• Safety - Safety monitoring\n\n` +
        `Ask me about any specific page for more details!`;
    }

    // Page-specific queries
    if (lowerMessage.includes('dashboard') && !lowerMessage.includes('steel') && !lowerMessage.includes('cement')) {
      return `📊 **Dashboard**\n\n` +
        `The main overview page showing:\n` +
        `• Real-time facility status\n` +
        `• Current emissions levels (${co2Level.toFixed(2)} ppm)\n` +
        `• Active alerts (${totalAlerts})\n` +
        `• Waste management status\n` +
        `• Gas and fire sensor readings\n` +
        `• Quick access to all modules\n\n` +
        `Perfect for getting a quick overview of your facility's current state.`;
    }

    if (lowerMessage.includes('portfolio')) {
      return `📈 **Portfolio Overview**\n\n` +
        `View comprehensive analytics across all projects:\n` +
        `• Total Projects: ${totalProjects}\n` +
        `• Active Projects: ${activeProjects}\n` +
        `• Total CO2 Reduction: ${totalCO2Reduction.toFixed(2)} tons\n` +
        `• Total Investment: $${totalInvestment.toLocaleString()}\n\n` +
        `Features:\n` +
        `• Status distribution (Active, Planned, Completed)\n` +
        `• Technology Readiness Level (TRL) breakdown\n` +
        `• Sector distribution (Steel, Cement, etc.)\n` +
        `• Geographic coverage\n` +
        `• Financial metrics and ROI analysis`;
    }

    if (lowerMessage.includes('champion')) {
      return `🏆 **CHAMPION Module - AI Decision Support**\n\n` +
        `Strategic decarbonization planning with AI assistance:\n` +
        `• Decision cards for key scenarios\n` +
        `• Economic modeling and financial analysis\n` +
        `• Tree simulation for technology options\n` +
        `• Risk assessment and mitigation strategies\n` +
        `• Recommendations based on facility data\n\n` +
        `Use this module to:\n` +
        `• Evaluate decarbonization strategies\n` +
        `• Compare technology options\n` +
        `• Assess financial viability\n` +
        `• Plan implementation roadmaps`;
    }

    if (lowerMessage.includes('mrv') || lowerMessage.includes('compliance') || lowerMessage.includes('report')) {
      return `📋 **MRV (Monitoring, Reporting & Verification)**\n\n` +
        `**MRV Generator:**\n` +
        `• Automated report generation (98% automation)\n` +
        `• Compliance with Gold Standard/Verra standards\n` +
        `• Article 6 compliance for international trading\n` +
        `• Digital signatures and cryptographic verification\n\n` +
        `**MRV Flows:**\n` +
        `• Monitor carbon credit flows\n` +
        `• Track verification status\n` +
        `• Manage compliance documentation\n\n` +
        `Reports include:\n` +
        `• Emission data verification\n` +
        `• Carbon credit calculations\n` +
        `• Audit trails and signatures`;
    }

    if (lowerMessage.includes('scenario') || lowerMessage.includes('modeling') || lowerMessage.includes('projection')) {
      return `🎯 **Scenario Modeling**\n\n` +
        `Interactive financial and emission analysis:\n` +
        `• Model different decarbonization scenarios\n` +
        `• Project emission reductions\n` +
        `• Calculate financial impacts\n` +
        `• Compare technology options\n` +
        `• Analyze ROI and payback periods\n\n` +
        `Use cases:\n` +
        `• Evaluate technology investments\n` +
        `• Plan facility upgrades\n` +
        `• Forecast carbon credit revenue\n` +
        `• Assess climate impact`;
    }

    if (lowerMessage.includes('steel')) {
      return `🏭 **Steel Dashboard**\n\n` +
        `Industry-specific monitoring for steel facilities:\n` +
        `• Steel production metrics\n` +
        `• Emission intensity (kg CO2/ton steel)\n` +
        `• Energy consumption tracking\n` +
        `• Process-specific alerts\n` +
        `• Decarbonization technology options\n\n` +
        `Key metrics:\n` +
        `• Blast furnace efficiency\n` +
        `• Electric arc furnace (EAF) performance\n` +
        `• Scrap utilization rates\n` +
        `• Carbon intensity trends`;
    }

    if (lowerMessage.includes('cement')) {
      return `🏗️ **Cement Dashboard**\n\n` +
        `Industry-specific monitoring for cement facilities:\n` +
        `• Cement production metrics\n` +
        `• Clinker production tracking\n` +
        `• Emission intensity (kg CO2/ton cement)\n` +
        `• Kiln efficiency monitoring\n` +
        `• Alternative fuel usage\n\n` +
        `Key metrics:\n` +
        `• Kiln temperature and efficiency\n` +
        `• Raw material composition\n` +
        `• Fuel consumption\n` +
        `• Clinker factor optimization`;
    }

    // Status-related queries
    if (lowerMessage.includes('status') || lowerMessage.includes('how are you') || lowerMessage === 'hi' || lowerMessage === 'hello') {
      return `📊 **Facility Status Report** - ${facilityId}\n\n` +
        `**Real-time Monitoring:**\n` +
        `✓ CO2 Level: ${co2Level.toFixed(2)} ppm (${emissionLevel})\n` +
        `✓ Gas Status: ${gasStatus}\n` +
        `✓ Fire Status: ${fireStatus}\n` +
        `✓ Active Alerts: ${totalAlerts} (Critical: ${alertCounts.critical}, High: ${alertCounts.high})\n` +
        `✓ Waste Bins: ${wasteStats.totalBins} total, ${wasteStats.fullBins} full\n` +
        `✓ Last Updated: ${lastUpdated}\n\n` +
        `**Project Portfolio:**\n` +
        `✓ Total Projects: ${totalProjects}\n` +
        `✓ Active Projects: ${activeProjects}\n` +
        `✓ CO2 Reduction Target: ${totalCO2Reduction.toFixed(2)} tons\n\n` +
        `All systems operating normally. How can I assist you today?`;
    }

    // Emissions-related queries
    if (lowerMessage.includes('emission') || lowerMessage.includes('carbon') || lowerMessage.includes('co2')) {
      return `🌍 **Emissions Analysis**\n\n` +
        `**Current Facility Data:**\n` +
        `CO2 Level: ${co2Level.toFixed(2)} ppm\n` +
        `Emission Status: ${emissionLevel.toUpperCase()}\n` +
        `Facility: ${facilityId}\n\n` +
        `**Portfolio Impact:**\n` +
        `Total CO2 Reduction Target: ${totalCO2Reduction.toFixed(2)} tons\n` +
        `Active Projects: ${activeProjects}/${totalProjects}\n\n` +
        `The facility is currently operating at ${emissionLevel} emission levels. ` +
        `${emissionLevel === 'high' ? 'Elevated emissions detected - recommend immediate review.' : 'Normal operational parameters maintained.'}\n\n` +
        `Visit Emissions Monitor for detailed trends and historical data.`;
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
        `${wasteStats.fullBins > 0 ? `⚠️ ${wasteStats.fullBins} bin(s) need immediate collection.` : '✓ All bins within acceptable levels.'}\n\n` +
        `Visit Waste Management Dashboard for detailed analytics and collection scheduling.`;
    }

    // Help/guidance queries
    if (lowerMessage.includes('help') || lowerMessage.includes('what can') || lowerMessage.includes('guide') || lowerMessage.includes('features')) {
      return `🤖 **AI Climate Assistant - Available Commands**\n\n` +
        `I can help you with:\n` +
        `• **Status** - Get current facility and project status\n` +
        `• **Emissions** - View CO2 levels and reduction targets\n` +
        `• **Alerts** - Check active alerts and issues\n` +
        `• **Waste** - Review waste management status\n` +
        `• **Projects** - Portfolio and project information\n` +
        `• **Navigate** - Find specific pages and features\n` +
        `• **CHAMPION** - AI decision support information\n` +
        `• **MRV** - Compliance and reporting details\n` +
        `• **Scenario** - Modeling and projection tools\n` +
        `• **Steel/Cement** - Industry-specific dashboards\n` +
        `• **Recommendations** - Get optimization suggestions\n\n` +
        `Just ask me about any of these topics!`;
    }

    // Recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('improve')) {
      return `💡 **Optimization Recommendations**\n\n` +
        `Based on current facility and project data:\n\n` +
        `1. **Monitor Emissions** - CO2 at ${co2Level.toFixed(2)} ppm - continue tracking\n` +
        `2. **Address Alerts** - ${totalAlerts > 0 ? `${totalAlerts} active alert(s) need attention` : 'No critical alerts'}\n` +
        `3. **Waste Management** - ${wasteStats.fullBins > 0 ? `${wasteStats.fullBins} bin(s) ready for collection` : 'Bins at optimal levels'}\n` +
        `4. **Portfolio Growth** - ${activeProjects}/${totalProjects} projects active\n` +
        `5. **Use CHAMPION Module** - Get AI-powered decarbonization strategies\n` +
        `6. **Run Scenarios** - Model different technology options\n` +
        `7. **Generate MRV Reports** - Ensure compliance and carbon credit verification\n\n` +
        `For detailed recommendations, visit the Dashboard or CHAMPION Module.`;
    }

    // Default response
    return `I'm your AI Climate Control Assistant for facility ${facilityId}.\n\n` +
      `**Current Status:**\n` +
      `• CO2 Level: ${co2Level.toFixed(2)} ppm (${emissionLevel})\n` +
      `• Gas Status: ${gasStatus}\n` +
      `• Fire Status: ${fireStatus}\n` +
      `• Active Alerts: ${totalAlerts}\n` +
      `• Waste Bins: ${wasteStats.fullBins}/${wasteStats.totalBins} full\n\n` +
      `**Portfolio:**\n` +
      `• Projects: ${activeProjects}/${totalProjects} active\n` +
      `• CO2 Reduction: ${totalCO2Reduction.toFixed(2)} tons\n\n` +
      `You can ask me about:\n` +
      `• Facility status and monitoring\n` +
      `• Emissions and carbon data\n` +
      `• Active alerts and issues\n` +
      `• Waste management\n` +
      `• Project portfolio\n` +
      `• Available pages and features\n` +
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
