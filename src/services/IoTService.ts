/**
 * IoT Service for managing AWS IoT Core sensors
 */

import { IoTSensor, IOT_CONFIG, SENSOR_TYPES } from '../types/iot';

export class IoTService {
  private static STORAGE_KEY = 'iot_sensors';

  /**
   * Get all configured IoT sensors
   */
  static getSensors(): IoTSensor[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Get sensors for a specific facility/project
   */
  static getSensorsByFacility(facilityId: string): IoTSensor[] {
    return this.getSensors().filter(sensor => sensor.facilityId === facilityId);
  }

  /**
   * Add a new IoT sensor
   */
  static addSensor(sensor: Omit<IoTSensor, 'id' | 'endpoint' | 'topic'>): IoTSensor {
    const sensors = this.getSensors();
    
    // Generate unique ID
    const id = `sensor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get sensor type config
    const sensorTypeConfig = SENSOR_TYPES.find(st => st.value === sensor.type);
    const topic = sensorTypeConfig?.topic || 'emissions';
    
    // Create full topic path
    const fullTopic = `${IOT_CONFIG.TOPIC_PREFIX}/${sensor.facilityId}/${topic}`;
    
    const newSensor: IoTSensor = {
      ...sensor,
      id,
      topic: fullTopic,
      endpoint: IOT_CONFIG.ENDPOINT,
      status: 'inactive',
      lastSeen: undefined,
    };
    
    sensors.push(newSensor);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensors));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('sensorsUpdated'));
    
    return newSensor;
  }

  /**
   * Remove an IoT sensor
   */
  static removeSensor(sensorId: string): void {
    const sensors = this.getSensors().filter(s => s.id !== sensorId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensors));
    window.dispatchEvent(new Event('sensorsUpdated'));
  }

  /**
   * Update sensor status
   */
  static updateSensorStatus(sensorId: string, status: IoTSensor['status'], lastSeen?: string): void {
    const sensors = this.getSensors();
    const sensor = sensors.find(s => s.id === sensorId);
    
    if (sensor) {
      sensor.status = status;
      if (lastSeen) {
        sensor.lastSeen = lastSeen;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensors));
      window.dispatchEvent(new Event('sensorsUpdated'));
    }
  }

  /**
   * Get IoT Core connection details for a sensor
   */
  static getConnectionDetails(sensor: IoTSensor): {
    endpoint: string;
    topic: string;
    thingName: string;
    region: string;
    policy: string;
  } {
    return {
      endpoint: sensor.endpoint,
      topic: sensor.topic,
      thingName: sensor.thingName,
      region: IOT_CONFIG.REGION,
      policy: IOT_CONFIG.DEVICE_POLICY,
    };
  }

  /**
   * Generate MQTT connection command for Raspberry Pi
   */
  static generateConnectionCommand(sensor: IoTSensor): string {
    const details = this.getConnectionDetails(sensor);
    return `
# AWS IoT Core Connection Details
# Endpoint: ${details.endpoint}
# Thing Name: ${details.thingName}
# Topic: ${details.topic}
# Region: ${details.region}

# Python MQTT Connection Example:
import paho.mqtt.client as mqtt
import ssl

client = mqtt.Client(client_id="${details.thingName}")
client.tls_set(
    ca_certs="AmazonRootCA1.pem",
    certfile="${details.thingName}.cert.pem",
    keyfile="${details.thingName}.private.key",
    tls_version=ssl.PROTOCOL_TLSv1_2
)

client.connect("${details.endpoint}", 8883, 60)
client.publish("${details.topic}", payload)
    `.trim();
  }
}
