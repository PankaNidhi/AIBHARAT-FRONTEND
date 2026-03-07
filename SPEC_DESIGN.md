# AI Climate Control Platform - Consolidated Design Document

## Executive Summary

This consolidated design document provides a comprehensive technical architecture for the complete AI Climate Control Platform, integrating all seven modules into a cohesive system. The platform enables industrial decarbonization through real-time monitoring, automated MRV reporting, scenario modeling, and carbon credit trading compliance.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  React 18 + TypeScript + Tailwind CSS                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Dashboard │ │ Waste    │ │ Tree     │ │CHAMPION  │          │
│  │          │ │ Mgmt     │ │ Projects │ │ Module   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │Steel/    │ │Scenario  │ │User      │                       │
│  │Cement    │ │Modeling  │ │Mgmt      │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  RESTful APIs + OAuth 2.0 + JWT                                │
├─────────────────────────────────────────────────────────────────┤
│  Rate Limiting: 1000 req/min │ Burst: 2000                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                            │
│  Python Flask + SQLAlchemy + CrewAI                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │IoT       │ │MRV       │ │Scenario  │ │AI        │          │
│  │Ingestion │ │Engine    │ │Calculator│ │Assistant │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │Waste     │ │CHAMPION  │ │User      │                       │
│  │Mgmt API  │ │API       │ │Mgmt API  │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Services Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │IoT Core  │ │DynamoDB  │ │Lambda    │ │SageMaker │          │
│  │MQTT      │ │Time-     │ │Serverless│ │ML Models │          │
│  │X.509     │ │Series    │ │Functions │ │Anomaly   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Bedrock   │ │S3        │ │Cognito   │ │KMS       │          │
│  │Claude    │ │Audit     │ │OAuth 2.0 │ │AES-256   │          │
│  │GenAI     │ │Logs      │ │Auth      │ │Encrypt   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │ DynamoDB Tables                                       │      │
│  │ - sensor_readings (facilityId + timestamp#deviceId)  │      │
│  │ - waste_projects, waste_streams, waste_mrv_data      │      │
│  │ - scenarios, decision_cards, compliance_data         │      │
│  │ GSIs: device-timestamp, facility-anomaly, status     │      │
│  └──────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ PostgreSQL/SQLite                                     │      │
│  │ - users, projects, modules, plant_types              │      │
│  │ - compliance_frameworks, resources, permissions      │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Module Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Module Integration Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌────────────────┐                 │
│  │  Core Platform │◄────────┤ Steel & Cement │                 │
│  │  (Base)        │         │  Bifurcation   │                 │
│  └────────┬───────┘         └────────────────┘                 │
│           │                                                      │
│           ├──────────┬──────────┬──────────┬──────────┐        │
│           │          │          │          │          │        │
│  ┌────────▼───┐ ┌───▼──────┐ ┌─▼────────┐ ┌▼────────┐ ┌─────▼┐│
│  │Municipal  │ │Tree      │ │CHAMPION  │ │Scenario │ │NxES  ││
│  │Waste Mgmt │ │Projects  │ │Module    │ │Modeling │ │v2    ││
│  └───────────┘ └──────────┘ └──────────┘ └─────────┘ └──────┘│
│                                                                  │
│  Shared Services:                                               │
│  - Authentication & Authorization                               │
│  - AI Assistant (CrewAI)                                       │
│  - MRV Engine                                                   │
│  - Data Validation                                              │
│  - Export & Reporting                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### Core Data Models

#### User Management
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'ProjectManager' | 'Viewer';
  permissions: Permission[];
  projects: string[]; // Project IDs
  createdAt: Date;
  lastLogin: Date;
  status: 'active' | 'inactive';
}

interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}
```

#### Project Management
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  location: Location;
  plantType: PlantType;
  industry: 'steel' | 'cement' | 'waste' | 'tree' | 'energy';
  modules: Module[];
  status: 'planning' | 'active' | 'completed' | 'suspended';
  complianceFrameworks: string[];
  resources: Resources;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Location {
  country: string;
  region?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
}

interface PlantType {
  id: string;
  name: string;
  category: 'industrial' | 'energy' | 'waste' | 'water' | 'forestry';
  customFields?: Record<string, any>;
}

interface Resources {
  humanResources: HumanResource[];
  equipment: Equipment[];
  budget: Budget;
}
```


#### Municipal Waste Management Models
```typescript
interface WasteProject {
  id: string;
  projectId: string;
  country: string; // Default: 'Ghana'
  hostAuthority: string; // Default: 'EPA Ghana'
  projectStage: string; // Default: 'Feasibility/Stage B'
  dailyWasteVolume: number; // Default: 120 tonnes
  article6Enabled: boolean; // Default: true
  ownershipType: string; // Default: 'Host Country'
  wasteStreams: WasteStream[];
  mrvData: WasteMRVData[];
  scenarios: WasteScenario[];
}

interface WasteStream {
  id: string;
  streamType: 'organic' | 'hazardous' | 'collection';
  percentageAllocation: number;
  technology: string;
  status: 'active' | 'blocked' | 'maintenance';
  biogasOption?: 'cooking_gas' | 'chp_electricity';
  incinerationType?: string;
  outputs: WasteOutput[];
}

interface WasteMRVData {
  id: string;
  category: 'waste_volume' | 'organic_fraction' | 'biogas_yield' | 'electricity_output' | 'rfid_tracking';
  value: number;
  unit: string;
  timestamp: Date;
  source: 'manual' | 'sensor' | 'rfid';
  uncertaintyBuffer: number; // Default: 0.1 (10%)
  validationStatus: 'valid' | 'blocked' | 'pending';
}

interface WasteScenario {
  id: string;
  scenarioName: 'conservative' | 'expected' | 'optimized';
  organicEfficiency: number;
  biogasYield: number;
  electricityConversion: number;
  collectionRate: number;
  annualCO2Reduction: number;
  annualBiogasProduction: number;
  annualElectricityGeneration: number;
  revenuePotential: number;
  mrvReadiness: number;
  article6Compliance: boolean;
}
```

#### Tree Project Models
```typescript
interface TreeProject {
  id: string;
  projectId: string;
  area: number; // hectares
  initialTrees: number;
  species: 'Acacia' | 'Teak' | string;
  costPerTree: number;
  survivalRate: number; // percentage
  sequestrationRate: number; // tCO2e per tree per year
  projectDuration: number; // years
  afterMarketLevel: number; // 0-3
  timeline: TreeYear[];
  totalCost: number;
  totalCO2e: number;
  costPerTCO2e: number;
  jobsEstimate: number;
}

interface TreeYear {
  year: number;
  treeCount: number;
  annualCO2e: number;
  cumulativeCO2e: number;
}
```

#### CHAMPION Models
```typescript
interface EconomicScenario {
  id: string;
  name: string;
  investment: number;
  operatingCost: number;
  annualRevenue: number;
  duration: number;
  discountRate: number;
  integrityMultiplier: number; // 0.3-1.2
  mrvCostMultiplier: number; // 0.5-3.0
  npv: number;
  irr: number;
  paybackYear: number;
  cashflows: number[];
}

interface DecisionCard {
  id: string;
  stage: 'Decision' | 'Feasibility' | 'MRV' | 'Finance' | 'Transformation';
  title: string;
  question: string;
  options: DecisionOption[];
}

interface DecisionOption {
  id: string;
  label: string;
  effects: {
    integrity_debt?: number;
    governance?: number;
    social?: number;
    finance?: number;
    mrv?: number;
    additionality?: number;
  };
}
```

#### IoT Sensor Models
```typescript
interface SensorReading {
  facilityId: string;
  deviceId: string;
  timestamp: Date;
  sensorType: 'temperature' | 'pressure' | 'flow' | 'emission' | 'energy';
  value: number;
  unit: string;
  quality: 'good' | 'suspect' | 'bad';
  hash: string; // SHA-256
}

interface SensorConfiguration {
  id: string;
  projectId: string;
  sensorType: string;
  endpoint: string;
  authMethod: 'api_key' | 'oauth' | 'basic';
  collectionFrequency: '5min' | '1hour' | 'daily';
  dataFormat: 'json' | 'xml' | 'csv';
  status: 'active' | 'inactive' | 'error';
}
```

## API Endpoints

### Core Platform APIs

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/reset-password
```

#### User Management
```
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
PUT    /api/users/{id}/permissions
PUT    /api/users/{id}/status
```

#### Project Management
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
GET    /api/projects/{id}/modules
POST   /api/projects/{id}/modules
```

### Municipal Waste Management APIs
```
POST   /api/waste-management/projects
GET    /api/waste-management/projects/{id}
PUT    /api/waste-management/projects/{id}/configuration
POST   /api/waste-management/projects/{id}/streams
GET    /api/waste-management/projects/{id}/streams
PUT    /api/waste-management/projects/{id}/streams/{streamId}
POST   /api/waste-management/projects/{id}/mrv-data
GET    /api/waste-management/projects/{id}/mrv-data
GET    /api/waste-management/projects/{id}/mrv-status
POST   /api/waste-management/projects/{id}/scenarios
GET    /api/waste-management/projects/{id}/scenarios/{scenarioId}
PUT    /api/waste-management/projects/{id}/scenarios/{scenarioId}
GET    /api/waste-management/projects/{id}/article6-status
POST   /api/waste-management/projects/{id}/compliance-check
```

### Tree Project APIs
```
POST   /api/tree-projects
GET    /api/tree-projects/{id}
PUT    /api/tree-projects/{id}
POST   /api/tree-projects/{id}/simulate
GET    /api/tree-projects/{id}/timeline
POST   /api/tree-projects/{id}/scenarios
GET    /api/tree-projects/{id}/scenarios
```

### CHAMPION APIs
```
POST   /api/champion/economic/calc
POST   /api/champion/tree/simulate
GET    /api/champion/decision-cards
GET    /api/champion/scenarios
POST   /api/champion/scenarios/{id}/save
GET    /api/champion/scenarios/{id}/compare
```

### IoT & Monitoring APIs
```
POST   /api/iot/sensors
GET    /api/iot/sensors/{id}
PUT    /api/iot/sensors/{id}
POST   /api/iot/sensors/{id}/test
GET    /api/iot/readings
POST   /api/iot/readings
GET    /api/iot/readings/{facilityId}
```

### MRV & Compliance APIs
```
GET    /api/mrv/flows
GET    /api/mrv/flows/{projectId}
POST   /api/mrv/reports/generate
GET    /api/mrv/reports/{id}
GET    /api/compliance/frameworks
POST   /api/compliance/assess
GET    /api/compliance/readiness/{projectId}
```

## Component Architecture

### Frontend Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Sidebar
│   │   ├── ModuleSelector
│   │   └── QuickActions
│   └── Footer
├── Dashboard
│   ├── OverviewCards
│   ├── RealtimeMetrics
│   ├── AlertsPanel
│   └── QuickInsights
├── WasteManagement
│   ├── WasteManagementDashboard
│   ├── WasteStreamConfiguration
│   ├── MRVDataCollection
│   └── ScenarioModeling
├── TreeProjects
│   ├── TreeProjectDashboard
│   ├── ProjectConfiguration
│   ├── SimulationEngine
│   └── ResultsVisualization
├── CHAMPION
│   ├── EconomicModule
│   ├── TreeProjectModule
│   ├── DecisionCards
│   └── ScenarioLibrary
├── ScenarioModeling
│   ├── InputForms
│   ├── CalculationEngine
│   ├── ResultsDisplay
│   └── ComparisonView
├── UserManagement
│   ├── UserList
│   ├── UserForm
│   ├── RoleManagement
│   └── PermissionMatrix
└── ProjectConfiguration
    ├── ProjectWizard
    ├── LocationSelector
    ├── PlantTypeSelector
    ├── ResourcePlanner
    └── ComplianceSelector
```

### Shared Components

```typescript
// Reusable UI Components
- Card
- Button
- Input
- Select
- Modal
- Table
- Chart
- StatusBadge
- LoadingSpinner
- ErrorBoundary
- Toast/Notification

// Business Logic Components
- ModuleFilter
- DataValidator
- ExportManager
- ReportGenerator
- AIAssistant
- SearchBar
- FilterPanel
```

## Calculation Engines

### MRV Calculation Engine
```typescript
class MRVCalculator {
  // Waste Management Calculations
  calculateEmissionReductions(wasteData: WasteProjectData): EmissionReductions {
    const avoidedMethane = this.calculateAvoidedMethane(wasteData);
    const fossilFuelSubstitution = this.calculateFossilFuelSubstitution(wasteData);
    const reducedFertilizer = this.calculateReducedFertilizer(wasteData);
    
    return {
      avoidedMethane,
      fossilFuelSubstitution,
      reducedFertilizer,
      total: avoidedMethane + fossilFuelSubstitution + reducedFertilizer
    };
  }
  
  applyUncertaintyBuffer(value: number, buffer: number = 0.1): number {
    return value * (1 - buffer);
  }
  
  // Tree Project Calculations
  calculateTreePopulation(initialTrees: number, survivalRate: number, year: number): number {
    return initialTrees * Math.pow(survivalRate, year);
  }
  
  calculateCarbonSequestration(trees: number, sequestrationRate: number): number {
    return trees * sequestrationRate;
  }
}
```

### Financial Calculation Engine
```typescript
class FinancialCalculator {
  calculateNPV(cashflows: number[], discountRate: number): number {
    return cashflows.reduce((npv, cf, year) => {
      return npv + cf / Math.pow(1 + discountRate, year);
    }, 0);
  }
  
  calculateIRR(cashflows: number[], guess: number = 0.1): number {
    // Newton-Raphson method
    let irr = guess;
    const maxIterations = 100;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashflows, irr);
      const derivative = this.calculateNPVDerivative(cashflows, irr);
      
      if (Math.abs(npv) < tolerance) break;
      
      irr = irr - npv / derivative;
    }
    
    return irr;
  }
  
  calculatePaybackPeriod(cashflows: number[]): number {
    let cumulative = 0;
    for (let year = 0; year < cashflows.length; year++) {
      cumulative += cashflows[year];
      if (cumulative >= 0) return year;
    }
    return -1; // No payback
  }
}
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Backend validates against database
3. Generate JWT token (1-hour expiration)
4. Return token + refresh token
5. Frontend stores in secure httpOnly cookie
6. Include token in Authorization header for API calls
7. Backend validates token on each request
8. Refresh token before expiration
```

### Authorization Model
```
Role Hierarchy:
- Admin: Full access to all resources
- ProjectManager: Access to assigned projects + configuration
- Viewer: Read-only access to assigned projects

Permission Structure:
- Resource-based (projects, modules, users, configuration)
- Action-based (read, write, delete, admin)
- Project-based (user assigned to specific projects)
```

### Data Encryption
```
In Transit:
- TLS 1.3 for all API communications
- Certificate pinning for mobile apps
- Encrypted WebSocket connections

At Rest:
- AES-256 encryption for sensitive data
- KMS key management with 90-day rotation
- Encrypted database fields for PII
- S3 Object Lock for immutable audit logs
```

## Performance Optimization

### Caching Strategy
```
Frontend:
- React Query for API response caching
- LocalStorage for user preferences
- SessionStorage for temporary data
- Service Worker for offline capability

Backend:
- Redis for session management
- DynamoDB DAX for hot data
- CloudFront CDN for static assets
- API Gateway caching (5-minute TTL)
```

### Database Optimization
```
DynamoDB:
- Composite keys: facilityId + timestamp#deviceId
- GSIs for common query patterns
- Time-series data partitioning
- TTL for automatic data expiration

PostgreSQL:
- Indexed foreign keys
- Materialized views for analytics
- Connection pooling
- Query optimization with EXPLAIN
```

### Load Balancing
```
- Application Load Balancer (ALB)
- Auto-scaling groups (2-10 instances)
- Health checks every 30 seconds
- Sticky sessions for WebSocket
- Cross-region failover
```

## Monitoring & Observability

### Metrics Collection
```
CloudWatch Metrics:
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Lambda function duration
- IoT message throughput

Custom Metrics:
- User activity patterns
- Module usage statistics
- MRV calculation frequency
- Scenario modeling usage
- Export generation counts
```

### Logging Strategy
```
Application Logs:
- Structured JSON logging
- Log levels: DEBUG, INFO, WARN, ERROR
- Request/response logging
- User action audit trail
- Error stack traces

AWS Services:
- CloudWatch Logs for application logs
- CloudTrail for AWS API calls
- X-Ray for distributed tracing
- VPC Flow Logs for network traffic
```

### Alerting
```
Critical Alerts:
- API error rate > 5%
- Database connection failures
- Authentication failures spike
- Data integrity violations
- Security incidents

Warning Alerts:
- Response time > 1 second
- Memory usage > 80%
- Disk usage > 85%
- Failed background jobs
- Anomaly detection triggers
```

## Deployment Architecture

### Environment Strategy
```
Development:
- Local development with Docker
- SQLite database
- Mock AWS services (LocalStack)
- Hot reload enabled

Staging:
- AWS deployment (reduced capacity)
- PostgreSQL RDS
- Real AWS services
- Automated testing

Production:
- Multi-AZ deployment
- PostgreSQL RDS with read replicas
- Full AWS service stack
- Blue-green deployment
- Automated rollback
```

### CI/CD Pipeline
```
1. Code commit to GitHub
2. GitHub Actions trigger
3. Run linting and type checking
4. Run unit tests
5. Run integration tests
6. Build Docker images
7. Push to ECR
8. Deploy to staging
9. Run E2E tests
10. Manual approval for production
11. Deploy to production
12. Health check validation
13. Rollback if failures detected
```

## Disaster Recovery

### Backup Strategy
```
Database Backups:
- Automated daily backups
- Point-in-time recovery (7 days)
- Cross-region replication
- Backup retention: 30 days

Application Backups:
- Infrastructure as Code (Terraform/CDK)
- Configuration in version control
- Docker images in ECR
- S3 versioning enabled
```

### Recovery Procedures
```
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour

Recovery Steps:
1. Identify failure scope
2. Activate incident response team
3. Switch to backup region (if needed)
4. Restore database from backup
5. Deploy application from last known good state
6. Validate data integrity
7. Resume normal operations
8. Post-mortem analysis
```

