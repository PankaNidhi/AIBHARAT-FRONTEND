import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface EmissionData {
  facilityId: string;
  timestamp: string;
  deviceId: string;
  co2Level: number;
  temperature: number;
  pressure: number;
  flowRate: number;
  hash: string;
}

export interface Alert {
  alertId: string;
  facilityId: string;
  deviceId: string;
  deviceType: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface FacilitySummary {
  facilityId: string;
  timestamp: string;
  latestEmissions: EmissionData | null;
  gasStatus: {
    status: string;
    latestReading: any;
  };
  fireStatus: {
    status: string;
    latestReading: any;
  };
  wasteStats: {
    totalBins: number;
    fullBins: number;
    nearlyFullBins: number;
    averageFillLevel: number;
  };
  activeAlerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

class EmissionsService {
  async getLatestEmissions(): Promise<EmissionData | null> {
    try {
      const data: any = await apiClient.get(API_ENDPOINTS.EMISSIONS_LATEST);
      return data;
    } catch (error) {
      console.error('Error fetching latest emissions:', error);
      return null;
    }
  }

  async getEmissionsHistory(limit: number = 100): Promise<EmissionData[]> {
    try {
      const data: any = await apiClient.get(`${API_ENDPOINTS.EMISSIONS_HISTORY}?limit=${limit}`);
      return data.emissions || [];
    } catch (error) {
      console.error('Error fetching emissions history:', error);
      return [];
    }
  }

  async getAlerts(limit: number = 50): Promise<Alert[]> {
    try {
      const data: any = await apiClient.get(`${API_ENDPOINTS.ALERTS}?limit=${limit}`);
      return data.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  async getFacilitySummary(): Promise<FacilitySummary | null> {
    try {
      const data: any = await apiClient.get(API_ENDPOINTS.SUMMARY);
      return data;
    } catch (error) {
      console.error('Error fetching facility summary:', error);
      return null;
    }
  }
}

export default new EmissionsService();
