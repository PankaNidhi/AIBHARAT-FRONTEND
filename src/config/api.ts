// API Configuration
export const API_CONFIG = {
  // Update this with your actual API Gateway URL after deployment
  BASE_URL: import.meta.env.VITE_API_URL || 'https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/prod',
  FACILITY_ID: 'facility001',
  REFRESH_INTERVAL: 5000, // 5 seconds
};

export const API_ENDPOINTS = {
  EMISSIONS_LATEST: `/api/facilities/${API_CONFIG.FACILITY_ID}/emissions/latest`,
  EMISSIONS_HISTORY: `/api/facilities/${API_CONFIG.FACILITY_ID}/emissions/history`,
  GAS_SENSORS_LATEST: `/api/facilities/${API_CONFIG.FACILITY_ID}/gas-sensors/latest`,
  FLAME_SENSORS_LATEST: `/api/facilities/${API_CONFIG.FACILITY_ID}/flame-sensors/latest`,
  WASTE_BINS: `/api/facilities/${API_CONFIG.FACILITY_ID}/waste-bins`,
  ALERTS: `/api/facilities/${API_CONFIG.FACILITY_ID}/alerts`,
  SUMMARY: `/api/facilities/${API_CONFIG.FACILITY_ID}/summary`,
};
