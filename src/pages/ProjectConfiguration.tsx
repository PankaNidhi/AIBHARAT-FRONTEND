import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, MapPin, Users, Shield, Package, Wifi, CheckCircle, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { MODULES } from '../types/industry';
import { useProjectContext } from '../contexts/ProjectContext';
import { IoTSensorModal } from '../components/IoTSensorModal';
import { IoTService } from '../services/IoTService';
import { IoTSensor } from '../types/iot';
import toast from 'react-hot-toast';

interface ProjectFormData {
  // Basic Info
  projectId: string;
  projectName: string;
  industryModule: string;
  projectSize: string;
  description: string;
  investmentAmount: string;
  annualOperatingCost: string;
  annualRevenue: string;
  projectDuration: string;
  discountRate: string;
  sector: string;
  trlLevel: string;
  
  // Location & Plant
  country: string;
  plantType: string;
  startDate: string;
  expectedLifetime: string;
  implementingPartner: string;
  city: string;
  region: string;
  
  // Governance & Roles
  dataOwner: string;
  projectOwner: string;
  mrvResponsible: string;
  reportingAuthority: string;
  
  // Ownership & Rights
  climateDataOwnership: string;
  creditOwnership: string;
  hostCountryAuthority: string;
  creditTransferRestrictions: string;
  
  // Resources
  humanResources: string[];
  equipment: string[];
  budget: string;
  budgetCurrency: string;
  
  // IoT & Compliance
  iotSensors: string[];
  complianceFrameworks: string[];
}

const ProjectConfiguration = () => {
  const navigate = useNavigate();
  const { addProject } = useProjectContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIoTModal, setShowIoTModal] = useState(false);
  const [projectSensors, setProjectSensors] = useState<IoTSensor[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: '',
    projectName: '',
    industryModule: '',
    projectSize: '',
    description: '',
    investmentAmount: '',
    annualOperatingCost: '',
    annualRevenue: '',
    projectDuration: '10',
    discountRate: '8',
    sector: 'Waste',
    trlLevel: 'TRL 1',
    country: '',
    plantType: '',
    startDate: '',
    expectedLifetime: '10',
    implementingPartner: '',
    city: '',
    region: '',
    dataOwner: '',
    projectOwner: '',
    mrvResponsible: '',
    reportingAuthority: '',
    climateDataOwnership: '',
    creditOwnership: '',
    hostCountryAuthority: '',
    creditTransferRestrictions: '',
    humanResources: [],
    equipment: [],
    budget: '10000',
    budgetCurrency: 'USD',
    iotSensors: [],
    complianceFrameworks: [],
  });

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'location', label: 'Location & Plant', icon: MapPin },
    { id: 'governance', label: 'Governance & Roles', icon: Users },
    { id: 'ownership', label: 'Ownership & Rights', icon: Shield },
    { id: 'resources', label: 'Resources', icon: Package },
    { id: 'iot', label: 'IoT & Compliance', icon: Wifi },
  ];

  // Load sensors for current project
  useEffect(() => {
    const facilityId = formData.projectId || 'temp-facility';
    const sensors = IoTService.getSensorsByFacility(facilityId);
    setProjectSensors(sensors);

    const handleSensorsUpdate = () => {
      const updatedSensors = IoTService.getSensorsByFacility(facilityId);
      setProjectSensors(updatedSensors);
    };

    window.addEventListener('sensorsUpdated', handleSensorsUpdate);
    return () => window.removeEventListener('sensorsUpdated', handleSensorsUpdate);
  }, [formData.projectId]);

  const handleRemoveSensor = (sensorId: string) => {
    IoTService.removeSensor(sensorId);
    toast.success('Sensor removed');
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.projectName || !formData.industryModule) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Generate unique ID
    const timestamp = Date.now();
    const newProjectId = `PROJ-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
    
    // Create project object
    const newProject = {
      id: newProjectId,
      projectId: formData.projectId || newProjectId,
      name: formData.projectName,
      description: formData.description || 'No description provided',
      country: formData.country || 'Not specified',
      countryCode: getCountryCode(formData.country),
      sector: formData.sector || 'Steel Production',
      plantType: formData.plantType || 'Steel Plant',
      status: 'concept' as const,
      trlLevel: parseInt(formData.trlLevel.replace('TRL ', '')) || 1,
      implementingPartner: formData.implementingPartner || 'Not specified',
      co2Reduction: parseInt(formData.projectSize) || 0,
      investmentValue: parseFloat(formData.investmentAmount) / 1000000 || 0,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      location: {
        city: formData.city || 'Not specified',
        region: formData.region || 'Not specified',
        latitude: 0,
        longitude: 0,
      },
    };

    // Add project using context method (which also saves to localStorage)
    addProject(newProject);

    toast.success('Project created successfully!');
    
    // Navigate to portfolio
    setTimeout(() => {
      navigate('/portfolio');
    }, 500);
  };

  const getCountryCode = (country: string): string => {
    const codes: { [key: string]: string } = {
      'India': 'IND',
      'Ghana': 'GHA',
      'Sweden': 'SWE',
      'South Africa': 'ZAF',
      'Germany': 'DEU',
      'Tanzania': 'TZA',
    };
    return codes[country] || 'XXX';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <Info className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">Create and configure a new climate project</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-blue-600 text-white' :
                      isActive ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Form Content */}
      <Card>
        <div className="p-6">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Project Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={formData.projectId}
                    onChange={(e) => handleInputChange('projectId', e.target.value)}
                    placeholder="e.g., PROJ-2024-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Module <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.industryModule}
                    onChange={(e) => handleInputChange('industryModule', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Industry Module</option>
                    {MODULES.map(module => (
                      <option key={module.id} value={module.id}>{module.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select the industry module that best matches your project type</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.projectSize}
                    onChange={(e) => handleInputChange('projectSize', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Project capacity or scale (tons/year, MW, etc.)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Describe the project objectives and scope"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Financial Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <span className="text-green-600">$</span>
                  <span>Financial Information</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.investmentAmount}
                      onChange={(e) => handleInputChange('investmentAmount', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total initial investment required</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Operating Cost ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.annualOperatingCost}
                      onChange={(e) => handleInputChange('annualOperatingCost', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual operational expenses</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Revenue ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.annualRevenue}
                      onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Expected annual revenue</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Duration (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.projectDuration}
                      onChange={(e) => handleInputChange('projectDuration', e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Project operational lifetime</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.discountRate}
                      onChange={(e) => handleInputChange('discountRate', e.target.value)}
                      placeholder="8"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Discount rate for financial calculations</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Waste">Waste</option>
                      <option value="Steel">Steel</option>
                      <option value="Cement">Cement</option>
                      <option value="Energy">Energy</option>
                      <option value="Forestry">Forestry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TRL Level
                    </label>
                    <select
                      value={formData.trlLevel}
                      onChange={(e) => handleInputChange('trlLevel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                        <option key={level} value={`TRL ${level}`}>TRL {level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Location & Plant */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Location & Plant Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Sweden">Sweden</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Germany">Germany</option>
                    <option value="Tanzania">Tanzania</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plant Type
                  </label>
                  <select
                    value={formData.plantType}
                    onChange={(e) => handleInputChange('plantType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Plant Type</option>
                    <option value="Steel Plant">Steel Plant</option>
                    <option value="Cement Plant">Cement Plant</option>
                    <option value="Waste Treatment Plant">Waste Treatment Plant</option>
                    <option value="Biogas Plant">Biogas Plant</option>
                    <option value="Tree Plantation">Tree Plantation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Lifetime (years)
                  </label>
                  <input
                    type="number"
                    value={formData.expectedLifetime}
                    onChange={(e) => handleInputChange('expectedLifetime', e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    placeholder="Enter region"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementing Partner
                </label>
                <input
                  type="text"
                  value={formData.implementingPartner}
                  onChange={(e) => handleInputChange('implementingPartner', e.target.value)}
                  placeholder="Organization or company name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Governance & Roles */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Governance & Roles</h3>
              <p className="text-sm text-gray-600">Define project roles and responsibilities as required for regulatory compliance</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dataOwner}
                    onChange={(e) => handleInputChange('dataOwner', e.target.value)}
                    placeholder="Legal owner of climate data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Person/entity with legal ownership of climate data</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Owner/Operator <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.projectOwner}
                    onChange={(e) => handleInputChange('projectOwner', e.target.value)}
                    placeholder="Project owner or operator"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary responsible party for project operations</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRV Responsible <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.mrvResponsible}
                    onChange={(e) => handleInputChange('mrvResponsible', e.target.value)}
                    placeholder="MRV responsible person"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Person responsible for MRV reporting and verification</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Authority Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reportingAuthority}
                    onChange={(e) => handleInputChange('reportingAuthority', e.target.value)}
                    placeholder="Registry/authority contact"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact for reporting authority or registry</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Regulatory Requirement</h4>
                <p className="text-sm text-blue-700">
                  These roles are mandatory for regulatory compliance and will appear in MRV reports and audit trails. All roles must be clearly defined before project verification.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Ownership & Rights */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Ownership & Rights</h3>
              <p className="text-sm text-gray-600">Define ownership and transfer rights for climate data and carbon credits</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Climate Data Ownership <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.climateDataOwnership}
                    onChange={(e) => handleInputChange('climateDataOwnership', e.target.value)}
                    placeholder="Entity owning climate data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Legal entity with ownership rights to climate data</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Ownership <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.creditOwnership}
                    onChange={(e) => handleInputChange('creditOwnership', e.target.value)}
                    placeholder="Entity owning carbon credits"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Legal entity with ownership rights to carbon credits</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Country Authority
                  </label>
                  <input
                    type="text"
                    value={formData.hostCountryAuthority}
                    onChange={(e) => handleInputChange('hostCountryAuthority', e.target.value)}
                    placeholder="National climate authority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Relevant for Article 6 compliance (if applicable)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Transfer Restrictions
                  </label>
                  <textarea
                    value={formData.creditTransferRestrictions}
                    onChange={(e) => handleInputChange('creditTransferRestrictions', e.target.value)}
                    rows={3}
                    placeholder="Any restrictions on credit transfers"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Describe any legal or contractual restrictions</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2">Institutional Readiness</h4>
                <p className="text-sm text-green-700">
                  Clear ownership definitions are essential for carbon credit issuance and transfer. These details will be verified during the validation process.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Resources */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Resource Allocation</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Human Resources */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                      <Users size={18} className="text-blue-600" />
                      <span>Human Resources</span>
                    </label>
                    <button className="text-sm text-blue-600 hover:text-blue-700">+ Add Member</button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Engineer (1)</span>
                      <button className="text-red-500 text-xs">×</button>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                      <Package size={18} className="text-green-600" />
                      <span>Equipment</span>
                    </label>
                    <button className="text-sm text-green-600 hover:text-green-700">+ Add Equipment</button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Equipment (1)</span>
                      <button className="text-red-500 text-xs">×</button>
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2 mb-3">
                    <span className="text-purple-600">$</span>
                    <span>Budget</span>
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="10000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <select
                    value={formData.budgetCurrency}
                    onChange={(e) => handleInputChange('budgetCurrency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: IoT & Compliance */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">IoT & Compliance Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IoT Sensors */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                      <Wifi size={18} className="text-blue-600" />
                      <span>IoT Sensors</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowIoTModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add IoT Sensor
                    </button>
                  </div>
                  {projectSensors.length === 0 ? (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      <p className="text-sm">No IoT sensors configured</p>
                      <p className="text-xs mt-1">Click "+ Add IoT Sensor" to configure</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projectSensors.map((sensor) => (
                        <div key={sensor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Wifi size={14} className="text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">{sensor.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                sensor.status === 'active' ? 'bg-green-100 text-green-800' :
                                sensor.status === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {sensor.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{sensor.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Topic: {sensor.topic}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSensor(sensor.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compliance Frameworks */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                      <Shield size={18} className="text-green-600" />
                      <span>Compliance Frameworks</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Gold Standard 4.0</div>
                        <div className="text-xs text-gray-500">Gold Standard for the Global Goals</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Verra VCS 4.5</div>
                        <div className="text-xs text-gray-500">Verified Carbon Standard</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">ISO 14064 2018</div>
                        <div className="text-xs text-gray-500">GHG Quantification</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft size={18} />
              <span>Previous</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={18} />
                <span>Create Project</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* IoT Sensor Modal */}
      <IoTSensorModal
        isOpen={showIoTModal}
        onClose={() => setShowIoTModal(false)}
        facilityId={formData.projectId || 'temp-facility'}
        onSensorAdded={() => {
          const sensors = IoTService.getSensorsByFacility(formData.projectId || 'temp-facility');
          setProjectSensors(sensors);
        }}
      />
    </div>
  );
};

export default ProjectConfiguration;
