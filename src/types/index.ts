// Sensor Data Types
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

export interface GasSensorData {
  facilityId: string;
  timestamp: string;
  deviceId: string;
  gasLevel: number;
  temperature: number;
  humidity: number;
  severity: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  hash: string;
}

export interface FlameSensorData {
  facilityId: string;
  timestamp: string;
  deviceId: string;
  flameDetected: boolean;
  temperature: number;
  hash: string;
}

export interface WasteBinData {
  facilityId: string;
  timestamp: string;
  binId: string;
  fillLevel: number;
  distance: number;
  binStatus: 'Empty' | 'Partial' | 'NearlyFull' | 'Full';
  hash: string;
}

export interface Alert {
  facilityId: string;
  timestamp: string;
  alertId: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
  deviceId: string;
  deviceType: string;
}

export interface FacilitySummary {
  facilityId: string;
  timestamp: string;
  latestEmissions: EmissionData | null;
  gasStatus: {
    status: 'Safe' | 'Alert';
    latestReading: GasSensorData | null;
  };
  fireStatus: {
    status: 'Safe' | 'Alert';
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

// Re-export waste management types
export * from './waste-management';
