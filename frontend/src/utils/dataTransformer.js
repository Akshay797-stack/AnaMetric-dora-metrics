// Transform backend data to chart-compatible format
export const transformMetricsData = (apiData) => {
  const { deploymentFrequency, leadTime, mttr, cfr } = apiData;
  
  // Transform deployment frequency data
  const deploymentData = transformDeploymentFrequency(deploymentFrequency);
  
  // Transform lead time data
  const leadTimeData = transformLeadTime(leadTime);
  
  // Transform MTTR data
  const mttrData = transformMTTR(mttr);
  
  // Transform CFR data
  const cfrData = transformCFR(cfr);
  
  return {
    deploymentData,
    leadTimeData,
    mttrData,
    cfrData
  };
};

// Transform deployment frequency data
const transformDeploymentFrequency = (deploymentFreq) => {
  if (!deploymentFreq || !deploymentFreq.deployments) {
    return [];
  }
  
  // Group deployments by date
  const deploymentsByDate = {};
  deploymentFreq.deployments.forEach(deployment => {
    const date = deployment.timestamp.split('T')[0]; // Extract date part
    if (!deploymentsByDate[date]) {
      deploymentsByDate[date] = 0;
    }
    deploymentsByDate[date]++;
  });
  
  // Convert to array format
  return Object.entries(deploymentsByDate).map(([date, count]) => ({
    datetime: `${date} 00:00:00`,
    deployments: count
  }));
};

// Transform lead time data
const transformLeadTime = (leadTime) => {
  if (!leadTime || !leadTime.daily) {
    return [];
  }
  
  return Object.entries(leadTime.daily).map(([date, avgHours]) => ({
    datetime: `${date} 00:00:00`,
    leadTime: avgHours / 24 // Convert hours to days
  }));
};

// Transform MTTR data
const transformMTTR = (mttr) => {
  if (!mttr || !mttr.daily) {
    return [];
  }
  
  return Object.entries(mttr.daily).map(([date, avgMinutes]) => ({
    datetime: `${date} 00:00:00`,
    mttr: avgMinutes / 60 // Convert minutes to hours
  }));
};

// Transform CFR data
const transformCFR = (cfr) => {
  if (!cfr) {
    return [];
  }
  
  // CFR returns a single value for the entire period
  // We'll create a single data point
  const failureRate = cfr['Change Failure Rate (%)'] || 0;
  
  return [{
    datetime: cfr['Start Time'] || new Date().toISOString(),
    failureRate: failureRate
  }];
};

// Calculate aggregated metrics for the dashboard cards
export const calculateAggregatedMetrics = (transformedData) => {
  const { deploymentData, leadTimeData, mttrData, cfrData } = transformedData;
  
  // Calculate total deployments
  const deploymentsSum = deploymentData.reduce((sum, item) => sum + item.deployments, 0);
  
  // Calculate average lead time
  const avgLeadTime = leadTimeData.length > 0 
    ? (leadTimeData.reduce((sum, item) => sum + item.leadTime, 0) / leadTimeData.length).toFixed(2)
    : '--';
  
  // Calculate average MTTR
  const avgMttr = mttrData.length > 0
    ? (mttrData.reduce((sum, item) => sum + item.mttr, 0) / mttrData.length).toFixed(2)
    : '--';
  
  // Get CFR value
  const avgFailureRate = cfrData.length > 0 ? cfrData[0].failureRate.toFixed(2) : '--';
  
  return {
    deploymentsSum,
    avgLeadTime,
    avgMttr,
    avgFailureRate
  };
};

// Merge all data for unified chart display
export const mergeMetricsData = (transformedData) => {
  const { deploymentData, leadTimeData, mttrData, cfrData } = transformedData;
  
  // Create a map of all unique dates
  const allDates = new Set();
  
  deploymentData.forEach(item => allDates.add(item.datetime.split(' ')[0]));
  leadTimeData.forEach(item => allDates.add(item.datetime.split(' ')[0]));
  mttrData.forEach(item => allDates.add(item.datetime.split(' ')[0]));
  
  // Convert to sorted array
  const sortedDates = Array.from(allDates).sort();
  
  // Create merged data
  const mergedData = sortedDates.map(date => {
    const deploymentItem = deploymentData.find(item => item.datetime.startsWith(date));
    const leadTimeItem = leadTimeData.find(item => item.datetime.startsWith(date));
    const mttrItem = mttrData.find(item => item.datetime.startsWith(date));
    
    return {
      datetime: `${date} 00:00:00`,
      deployments: deploymentItem ? deploymentItem.deployments : 0,
      leadTime: leadTimeItem ? leadTimeItem.leadTime : 0,
      mttr: mttrItem ? mttrItem.mttr : 0,
      failureRate: cfrData.length > 0 ? cfrData[0].failureRate : 0
    };
  });
  
  return mergedData;
};
