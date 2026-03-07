import { useState } from 'react';
import { X, Wifi, Copy, Check } from 'lucide-react';
import { SensorType, SENSOR_TYPES } from '../types/iot';
import { IoTService } from '../services/IoTService';
import toast from 'react-hot-toast';

interface IoTSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityId: string;
  onSensorAdded?: () => void;
}

export const IoTSensorModal = ({ isOpen, onClose, facilityId, onSensorAdded }: IoTSensorModalProps) => {
  const [sensorName, setSensorName] = useState('');
  const [sensorType, setSensorType] = useState<SensorType>('CO2Sensor');
  const [thingName, setThingName] = useState('');
  const [description, setDescription] = useState('');
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sensorName || !thingName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      IoTService.addSensor({
        name: sensorName,
        type: sensorType,
        thingName,
        facilityId,
        status: 'inactive',
        description: description || SENSOR_TYPES.find(st => st.value === sensorType)?.description || '',
      });

      toast.success('IoT Sensor added successfully!');
      setShowConnectionDetails(true);
      
      if (onSensorAdded) {
        onSensorAdded();
      }
    } catch (error) {
      toast.error('Failed to add IoT sensor');
    }
  };

  const handleClose = () => {
    setSensorName('');
    setThingName('');
    setDescription('');
    setShowConnectionDetails(false);
    setCopiedCommand(false);
    onClose();
  };

  const selectedSensorType = SENSOR_TYPES.find(st => st.value === sensorType);

  const connectionCommand = thingName ? `
# AWS IoT Core Connection Details
Endpoint: ${import.meta.env.VITE_IOT_ENDPOINT || 'your-account.iot.ap-south-1.amazonaws.com'}
Thing Name: ${thingName}
Topic: aiclimatecontrol/${facilityId}/${selectedSensorType?.topic}
Region: ap-south-1

# Setup Instructions:
1. Provision IoT Thing in AWS Console
2. Download certificates (cert.pem, private.key, AmazonRootCA1.pem)
3. Install on Raspberry Pi
4. Use the Python code in code/all_sensors_aiclimate.py
5. Update iot_config_aiclimate.py with your credentials
  `.trim() : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(connectionCommand);
    setCopiedCommand(true);
    toast.success('Connection details copied!');
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wifi className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add IoT Sensor</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showConnectionDetails ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sensor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sensorName}
                  onChange={(e) => setSensorName(e.target.value)}
                  placeholder="e.g., Main Emission Sensor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sensor Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={sensorType}
                  onChange={(e) => setSensorType(e.target.value as SensorType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SENSOR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{selectedSensorType?.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AWS IoT Thing Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={thingName}
                  onChange={(e) => setThingName(e.target.value)}
                  placeholder="e.g., RaspberryPi5-Sensor-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This should match the Thing Name created in AWS IoT Core
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">AWS IoT Core Setup Required</h4>
                <p className="text-sm text-blue-700">
                  Before adding this sensor, ensure you have:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
                  <li>Created an IoT Thing in AWS IoT Core</li>
                  <li>Downloaded the device certificates</li>
                  <li>Configured your Raspberry Pi with the certificates</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Sensor
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2">Sensor Added Successfully!</h4>
                <p className="text-sm text-green-700">
                  Your IoT sensor has been configured. Use the connection details below to set up your Raspberry Pi.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Connection Details
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copiedCommand ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedCommand ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {connectionCommand}
                </pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">Next Steps</h4>
                <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                  <li>Copy the connection details above</li>
                  <li>Configure your Raspberry Pi using the code in /code directory</li>
                  <li>Update iot_config_aiclimate.py with your credentials</li>
                  <li>Run the sensor script to start publishing data</li>
                </ol>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
