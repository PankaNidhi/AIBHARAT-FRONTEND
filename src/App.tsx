import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ModuleProvider } from './contexts/ModuleContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Layout from './components/Layout';
import SystemChatbot from './components/SystemChatbot';
import Dashboard from './pages/Dashboard';
import EmissionsPage from './pages/EmissionsPage';
import SafetyPage from './pages/SafetyPage';
import WastePage from './pages/WastePage';
import WasteManagementDashboard from './pages/WasteManagementDashboard';
import AlertsPage from './pages/AlertsPage';
import SteelDashboard from './pages/SteelDashboard';
import CementDashboard from './pages/CementDashboard';
import PortfolioOverview from './pages/PortfolioOverview';
import InteractiveScenarioModeling from './pages/InteractiveScenarioModeling';
import ProjectListView from './pages/ProjectListView';
import ChampionModule from './pages/ChampionModule';
import MRVFlows from './pages/MRVFlows';
import ClimateMetrics from './pages/ClimateMetrics';
import MRVGenerator from './pages/MRVGenerator';
import ProjectConfiguration from './pages/ProjectConfiguration';
import ApiTestPage from './pages/ApiTestPage';
import EmissionsMonitor from './pages/EmissionsMonitor';

function App() {
  return (
    <Router>
      <ProjectProvider>
        <ModuleProvider>
          <Toaster position="top-right" />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<PortfolioOverview />} />
              <Route path="/projects" element={<ProjectListView />} />
              <Route path="/emissions" element={<EmissionsPage />} />
              <Route path="/emissions-monitor" element={<EmissionsMonitor />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/waste" element={<WastePage />} />
              <Route path="/waste-management" element={<WasteManagementDashboard />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/steel" element={<SteelDashboard />} />
              <Route path="/cement" element={<CementDashboard />} />
              <Route path="/scenario-modeling" element={<InteractiveScenarioModeling />} />
              <Route path="/champion" element={<ChampionModule />} />
              <Route path="/mrv-flows" element={<MRVFlows />} />
              <Route path="/climate-metrics" element={<ClimateMetrics />} />
              <Route path="/mrv-generator" element={<MRVGenerator />} />
              <Route path="/project-config" element={<ProjectConfiguration />} />
              <Route path="/api-test" element={<ApiTestPage />} />
            </Routes>
          </Layout>
          <SystemChatbot />
        </ModuleProvider>
      </ProjectProvider>
    </Router>
  );
}

export default App;
