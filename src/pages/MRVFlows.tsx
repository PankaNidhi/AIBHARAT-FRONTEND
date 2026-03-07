import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Wifi, FileText, CheckCircle, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { IoTSensorModal } from '../components/IoTSensorModal';
import { IoTService } from '../services/IoTService';
import { IoTSensor } from '../types/iot';
import { useProjectContext } from '../contexts/ProjectContext';
import { useModuleContext } from '../contexts/ModuleContext';
import toast from 'react-hot-toast';

const MRVFlows = () => {
  const { projects } = useProjectContext();
  const { modules } = useModuleContext();
  const [showIoTModal, setShowIoTModal] = useState(false);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSensors();

    const handleSensorsUpdate = () => {
      loadSensors();
    };

    window.addEventListener('sensorsUpdated', handleSensorsUpdate);
    return () => window.removeEventListener('sensorsUpdated', handleSensorsUpdate);
  }, [selectedProject]);

  const loadSensors = () => {
    const facilityId = selectedProject || 'default-facility';
    const allSensors = IoTService.getSensorsByFacility(facilityId);
    setSensors(allSensors);
  };

  const filteredProjects = selectedModule
    ? projects.filter(p => {
        const moduleName = modules.find(m => m.id === selectedModule)?.name.toLowerCase();
        return p.sector.toLowerCase().includes(moduleName || '') || 
               p.plantType.toLowerCase().includes(moduleName || '');
      })
    : projects;

  const currentProject = projects.find(p => p.id === selectedProject);
  const currentModule = modules.find(m => m.id === selectedModule);

  const handleRemoveSensor = (sensorId: string) => {
    IoTService.removeSensor(sensorId);
    toast.success('Sensor removed');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate selections
    if (!selectedModule) {
      toast.error('Please select a module first');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!selectedProject) {
      toast.error('Please select a project first');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Please upload a CSV or Excel file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Store file info in localStorage
    const uploadData = {
      id: `upload-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      moduleId: selectedModule,
      moduleName: currentModule?.name || 'Unknown Module',
      projectId: selectedProject,
      projectName: currentProject?.name || 'Unknown Project',
      uploadedAt: new Date().toISOString(),
      status: 'processed',
    };

    const uploads = JSON.parse(localStorage.getItem('data_uploads') || '[]');
    uploads.push(uploadData);
    localStorage.setItem('data_uploads', JSON.stringify(uploads));

    toast.success(`File "${file.name}" uploaded successfully to ${currentProject?.name}!`);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConnectSensor = () => {
    if (!selectedModule) {
      toast.error('Please select a module first');
      return;
    }

    if (!selectedProject) {
      toast.error('Please select a project first');
      return;
    }

    setShowIoTModal(true);
  };

  const facilityId = selectedProject || 'default-facility';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MRV Flows</h1>
        <p className="text-sm text-gray-600 mt-1">Manage IoT sensors and upload emission data</p>
      </div>

      {/* Module and Project Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Module & Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setSelectedProject('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedModule}
              >
                <option value="">Select a project</option>
                {filteredProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedModule && selectedProject && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle size={16} className="text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Selected: {currentModule?.name} - {currentProject?.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <FileText size={16} className="mr-1" />
            {currentModule?.name || 'No Module Selected'}
          </span>
          <span className="flex items-center">
            <Wifi size={16} className="mr-1" />
            {sensors.length} IoT Sensors
          </span>
          <span className="flex items-center">
            <CheckCircle size={16} className="mr-1" />
            2 Compliance Standards
          </span>
        </div>
        <div className="flex space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedModule || !selectedProject}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              selectedModule && selectedProject
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Upload size={18} />
            <span>Upload Data</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* MRV Data Dashboard */}
      {selectedModule && selectedProject && (
        <>
          {/* Monitoring Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Points Collected</span>
                    <span className="text-lg font-bold text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verification Rate</span>
                    <span className="text-lg font-bold text-gray-400">--</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Compliance Score</span>
                    <span className="text-lg font-bold text-gray-400">--</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Connect IoT sensors or upload data to see metrics</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reports Generated</span>
                    <span className="text-lg font-bold text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verified Reports</span>
                    <span className="text-lg font-bold text-gray-400">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Review</span>
                    <span className="text-lg font-bold text-gray-400">0</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Reports will appear after data processing</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Partners</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Gold Standard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Verra (VCS)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Article 6 Registry</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent MRV Reports */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent MRV Reports</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-lg font-medium text-gray-900 mb-2">No MRV Reports Available</p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload emission data or connect IoT sensors to generate MRV reports
                </p>
                <p className="text-xs text-gray-400">
                  Reports will be automatically generated and verified according to Gold Standard, Verra, and Article 6 compliance standards
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* IoT Sensor Integration */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Wifi className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">IoT Sensor Integration</h3>
                <p className="text-sm text-gray-600">Real-time data from AWS IoT Core</p>
              </div>
            </div>
            <button
              onClick={handleConnectSensor}
              disabled={!selectedModule || !selectedProject}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                selectedModule && selectedProject
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Connect IoT Sensors
            </button>
          </div>

          {sensors.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Wifi className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-lg font-medium text-gray-900 mb-2">No IoT Sensors Connected</p>
              <p className="text-sm text-gray-500 mb-4">
                Connect your AWS IoT Core sensors to start receiving real-time emission data
              </p>
              <button
                onClick={handleConnectSensor}
                disabled={!selectedModule || !selectedProject}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  selectedModule && selectedProject
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Connect First Sensor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      sensor.status === 'active' ? 'bg-green-50' :
                      sensor.status === 'error' ? 'bg-red-50' :
                      'bg-gray-50'
                    }`}>
                      <Wifi className={
                        sensor.status === 'active' ? 'text-green-600' :
                        sensor.status === 'error' ? 'text-red-600' :
                        'text-gray-600'
                      } size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{sensor.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          sensor.status === 'active' ? 'bg-green-100 text-green-800' :
                          sensor.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sensor.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{sensor.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Thing: {sensor.thingName}</span>
                        <span>Topic: {sensor.topic}</span>
                        {sensor.lastSeen && <span>Last seen: {new Date(sensor.lastSeen).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSensor(sensor.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* IoT Sensor Modal */}
      <IoTSensorModal
        isOpen={showIoTModal}
        onClose={() => setShowIoTModal(false)}
        facilityId={facilityId}
        onSensorAdded={loadSensors}
      />
    </div>
  );
};

export default MRVFlows;
