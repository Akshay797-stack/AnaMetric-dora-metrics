const API_BASE_URL = 'http://localhost:8000';

// Helper function to format datetime for API calls
const formatDateTimeForAPI = (dateTimeString) => {
  // Convert from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DD HH:mm:ss"
  return dateTimeString.replace('T', ' ') + ':00';
};

// Helper function to handle API errors
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

// API service functions
export const apiService = {
  // Health check to test if backend is running
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/docs`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get deployment frequency data
  async getDeploymentFrequency(startTime, endTime) {
    const formattedStart = formatDateTimeForAPI(startTime);
    const formattedEnd = formatDateTimeForAPI(endTime);
    
    const response = await fetch(
      `${API_BASE_URL}/deployment-frequency?start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}`
    );
    
    return handleApiError(response);
  },

  // Get lead time data
  async getLeadTime(startTime, endTime) {
    const formattedStart = formatDateTimeForAPI(startTime);
    const formattedEnd = formatDateTimeForAPI(endTime);
    
    const response = await fetch(
      `${API_BASE_URL}/lead-time?start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}`
    );
    
    return handleApiError(response);
  },

  // Get MTTR data
  async getMTTR(startTime, endTime) {
    const formattedStart = formatDateTimeForAPI(startTime);
    const formattedEnd = formatDateTimeForAPI(endTime);
    
    const response = await fetch(
      `${API_BASE_URL}/mttr?start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}`
    );
    
    return handleApiError(response);
  },

  // Get Change Failure Rate data
  async getCFR(startTime, endTime) {
    const formattedStart = formatDateTimeForAPI(startTime);
    const formattedEnd = formatDateTimeForAPI(endTime);
    
    const response = await fetch(
      `${API_BASE_URL}/api/cfr?start=${encodeURIComponent(formattedStart)}&end=${encodeURIComponent(formattedEnd)}`
    );
    
    return handleApiError(response);
  },

  // Get all metrics at once
  async getAllMetrics(startTime, endTime) {
    try {
      const [deploymentFreq, leadTime, mttr, cfr] = await Promise.all([
        this.getDeploymentFrequency(startTime, endTime),
        this.getLeadTime(startTime, endTime),
        this.getMTTR(startTime, endTime),
        this.getCFR(startTime, endTime)
      ]);

      return {
        deploymentFrequency: deploymentFreq,
        leadTime: leadTime,
        mttr: mttr,
        cfr: cfr
      };
    } catch (error) {
      console.error('Error fetching all metrics:', error);
      throw error;
    }
  },

  // Get AI insights
  async getAIInsights(startTime, endTime) {
    const formattedStart = formatDateTimeForAPI(startTime);
    const formattedEnd = formatDateTimeForAPI(endTime);
    
    const response = await fetch(
      `${API_BASE_URL}/ai-insights?start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}`
    );
    
    return handleApiError(response);
  },

  // Get forecast for a specific metric
  async getForecast(metric, startTime, endTime, days = 30) {
    const formattedStart = formatDateTimeForAPI(startTime);
    const formattedEnd = formatDateTimeForAPI(endTime);
    
    const response = await fetch(
      `${API_BASE_URL}/forecast?metric=${metric}&start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}&days=${days}`
    );
    
    return handleApiError(response);
  }
};

export default apiService;
