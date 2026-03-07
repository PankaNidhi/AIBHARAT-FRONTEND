/**
 * IoT Sensor Types for AWS IoT Core Integration
 */

export type SensorType = 'MQ2GasSensor' | 'FlameSensor' | 'UltrasonicSensor' | 'CO2Sensor' | 'TemperatureSensor' | 'PressureSensor' | 'FlowRateSensor';

export interface IoTSensor {
  id: string;
  name: string;
  type: SensorType;
  thingName: string;
  facilityId: string;
  topic: string;
  status: 'active' | 'inactive' | 'error';
  lastSeen?: string;
  description: string;
  endpoint: string;
}

export interface IoTEndpoint {
  endpoint: string;
  region: string;
  account: string;
}

export const SENSOR_TYPES: { value: SensorType; label: string; description: string; topic: string }[] = [
  {
    value: 'MQ2GasSensor',
    label: 'MQ2 Gas Sensor',
    description: 'Detects methane, CO2, LPG, and smoke',
    topic: 'gas'
  },
  {
    value: 'FlameSensor',
    label: 'Flame Sensor',
    description: 'Infrared flame detection for fire safety',
    topic: 'flame'
  },
  {
    value: 'UltrasonicSensor',
    label: 'Ultrasonic Sensor',
    description: 'Waste bin fill level monitoring',
    topic: 'waste'
  },
  {
    value: 'CO2Sensor',
    label: 'CO2 Emission Sensor',
    description: 'Industrial CO2 emission monitoring',
    topic: 'emissions'
  },
  {
    value: 'TemperatureSensor',
    label: 'Temperature Sensor',
    description: 'Temperature monitoring for emissions',
    topic: 'emissions'
  },
  {
    value: 'PressureSensor',
    label: 'Pressure Sensor',
    description: 'Pressure monitoring for emissions',
    topic: 'emissions'
  },
  {
    value: 'FlowRateSensor',
    label: 'Flow Rate Sensor',
    description: 'Flow rate monitoring for emissions',
    topic: 'emissions'
  }
];

export const IOT_CONFIG = {
  // AWS IoT Core endpoint (update with your actual endpoint)
  ENDPOINT: import.meta.env.VITE_IOT_ENDPOINT || 'your-account.iot.ap-south-1.amazonaws.com',
  REGION: 'ap-south-1',
  DEVICE_POLICY: 'AIClimateControl-DevicePolicy',
  TOPIC_PREFIX: 'aiclimatecontrol',
};
