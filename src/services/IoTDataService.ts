import apiClient from './api';

export interface GasSensorData {
  facilityId: string;
  timestamp: string;
  deviceId: string;
  gasDetected: boolean;
  gasType: string;
  concentration: number;
  severity: string;
}

export interface FlameSensorData {
  facilityId: string;
  timestamp: string;
  deviceId: string;
  flameDetected: boolean;
  intensity: number;
  severity: string;
}

export interface WasteBinData {
  facilityId: string;
  timestamp: string;
  deviceId: string;
  binId: string;
  fillLevel: number;
  distanceCm: number;
  binStatus: string;
  binCapacityLiters: number;
}

export interface FacilitySummary {
  facilityId: string;
  timestamp: string;
  latestEmissions: any;
  gasStatus: {
    status: string;
    latestReading: GasSensorData | null;
  };
  fireStatus: {
    status: string;
    latestReading: FlameSensorData | null;
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

class IoTDataService {
  private facilityId = 'facility001';

  async getLatestGasSensor(): Promise<GasSensorData | null> {
    try {
      const response: any = await apiClient.get(`/api/facilities/${this.facilityId}/gas-sensors/latest`);
      return response as GasSensorData;
    } catch (error) {
      console.error('Error fetching gas sensor data:', error);
      return null;
    }
  }

  async getLatestFlameSensor(): Promise<FlameSensorData | null> {
    try {
      const response: any = await apiClient.get(`/api/facilities/${this.facilityId}/flame-sensors/latest`);
      return response as FlameSensorData;
    } catch (error) {
      console.error('Error fetching flame sensor data:', error);
      return null;
    }
  }

  async getWasteBins(): Promise<{ bins: WasteBinData[]; count: number }> {
    try {
      const response: any = await apiClient.get(`/api/facilities/${this.facilityId}/waste-bins`);
      return response as { bins: WasteBinData[]; count: number };
    } catch (error) {
      console.error('Error fetching waste bin data:', error);
      return { bins: [], count: 0 };
    }
  }

  async getFacilitySummary(): Promise<FacilitySummary | null> {
    try {
      const response: any = await apiClient.get(`/api/facilities/${this.facilityId}/summary`);
      return response as FacilitySummary;
    } catch (error) {
      console.error('Error fetching facility summary:', error);
      return null;
    }
  }
}

export default new IoTDataService();
