import { useState } from 'react';
import { API_CONFIG } from '../config/api';

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      console.log('Testing API URL:', API_CONFIG.BASE_URL);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/facilities/facility001/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      setTestResults(data);
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">API Connection Test</h1>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Configuration</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm"><span className="font-medium">API URL:</span> {API_CONFIG.BASE_URL}</p>
              <p className="text-sm"><span className="font-medium">Facility ID:</span> {API_CONFIG.FACILITY_ID}</p>
              <p className="text-sm"><span className="font-medium">Refresh Interval:</span> {API_CONFIG.REFRESH_INTERVAL}ms</p>
            </div>
          </div>

          <button
            onClick={testApiConnection}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {testResults && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Success! API Response:</h3>
              <pre className="text-xs text-green-700 overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Troubleshooting Steps</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Check if the API URL is correct above</li>
          <li>Open browser DevTools (F12) and check Console tab for errors</li>
          <li>Check Network tab to see if requests are being made</li>
          <li>Verify CORS is enabled on the Lambda Function URL</li>
          <li>Test the API directly using curl or Postman</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiTestPage;
