import React, { useState, useMemo, useEffect } from "react";
import "./Dashboard.css";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import apiService from "../services/api";
import { transformMetricsData, calculateAggregatedMetrics, mergeMetricsData } from "../utils/dataTransformer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// Default date range for initial load (last 7 days)
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  
  return {
    start: start.toISOString().slice(0, 16),
    end: end.toISOString().slice(0, 16)
  };
};

// ---- Chart.js Options ----
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#d8d9da',
        font: { size: 12, family: 'Inter' }
      }
    },
    tooltip: {
      backgroundColor: '#1e1f22',
      titleColor: '#d8d9da',
      bodyColor: '#a4abb6',
      borderColor: '#2c2e33',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      titleFont: { size: 13, family: 'Inter' },
      bodyFont: { size: 12, family: 'Inter' }
    }
  },
  scales: {
    x: {
      grid: { color: '#2c2e33', drawBorder: false },
      ticks: { color: '#7a7f8b', font: { size: 11, family: 'Inter' } }
    },
    y: {
      grid: { color: '#2c2e33', drawBorder: false },
      ticks: { color: '#7a7f8b', font: { size: 11, family: 'Inter' } }
    }
  }
};

// ---- UI Components ----
const MetricCard = ({ title, value, unit, change, changeType, icon }) => (
  <div className="metric-card grafana-panel">
    <div className="metric-header">
      <div className="metric-icon">{icon}</div>
      <div className="metric-info">
        <h4 className="metric-title">{title}</h4>
        <div className="metric-value">
          {value}
          <span className="metric-unit">{unit}</span>
        </div>
        {change && (
          <div className={`metric-change ${changeType}`}>
            {changeType === 'positive' ? '↗' : '↘'} {change}
          </div>
        )}
      </div>
    </div>
  </div>
);

const FilterChip = ({ label, onRemove }) => (
  <div className="filter-chip">
    <span className="filter-chip-text">{label}</span>
    <button className="filter-chip-remove" onClick={onRemove}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
);

// ---- Main Dashboard ----
const Dashboard = () => {
  const [startDate, setStartDate] = useState(getDefaultDateRange().start);
  const [endDate, setEndDate] = useState(getDefaultDateRange().end);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: convert datetime-local format "YYYY-MM-DDTHH:mm" to "YYYY-MM-DD HH:mm:ss"
  const formatForCompare = (dt) => dt ? dt.replace("T", " ") + (dt.length === 16 ? ":00" : "") : "";

  // Fetch metrics data from backend
  const fetchMetricsData = async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAllMetrics(start, end);
      const transformedData = transformMetricsData(data);
      const mergedData = mergeMetricsData(transformedData);
      setMetricsData({
        raw: data,
        transformed: transformedData,
        merged: mergedData,
        aggregated: calculateAggregatedMetrics(transformedData)
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchMetricsData(startDate, endDate);
    }
  }, [startDate, endDate]);

  // Get current data for charts
  const currentData = useMemo(() => {
    return metricsData?.merged || [];
  }, [metricsData]);

  // Generate chart data for each metric
  const getChartData = (type) => {
    if (!currentData.length) {
      // Return empty chart data when no data is available
      return {
        labels: [],
        datasets: [{
          label: type === "deployments" ? "Deployments" : 
                 type === "leadTime" ? "Lead Time (days)" :
                 type === "mttr" ? "MTTR (hours)" : "Failure Rate",
          data: [],
          backgroundColor: type === "deployments" ? "rgba(87, 148, 242, 0.8)" :
                         type === "leadTime" ? "rgba(115, 191, 105, 0.1)" :
                         type === "mttr" ? "rgba(245, 158, 59, 0.8)" : "rgba(224, 47, 68, 0.8)",
          borderColor: type === "deployments" ? "#5794f2" :
                      type === "leadTime" ? "#73bf69" :
                      type === "mttr" ? "#f59e3b" : "#e02f44",
          borderWidth: 2
        }]
      };
    }
    
    const labels = currentData.map(item => item.datetime);
    const data = currentData.map(item => item[type]);

    if (type === "deployments") {
      return {
        labels,
        datasets: [{
          label: "Deployments",
          data,
          backgroundColor: "rgba(87, 148, 242, 0.8)",
          borderColor: "#5794f2",
          borderWidth: 2,
          borderRadius: 4,
          fill: false
        }]
      };
    }
    if (type === "leadTime") {
      return {
        labels,
        datasets: [{
          label: "Lead Time (days)",
          data,
          borderColor: "#73bf69",
          backgroundColor: "rgba(115, 191, 105, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#73bf69",
          pointBorderColor: "#1e1f22",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      };
    }
    if (type === "failureRate") {
      // For CFR, we use the single value from the backend
      const failureRate = data.length > 0 ? data[0] : 0;
      return {
        labels: ["Success", "Failure"],
        datasets: [{
          data: [100 - failureRate, failureRate],
          backgroundColor: ["rgba(115, 191, 105, 0.8)", "rgba(224, 47, 68, 0.8)"],
          borderColor: ["#73bf69", "#e02f44"],
          borderWidth: 2,
          hoverOffset: 4
        }]
      };
    }
    if (type === "mttr") {
      return {
        labels,
        datasets: [{
          label: "MTTR (hours)",
          data,
          backgroundColor: "rgba(245, 158, 59, 0.8)",
          borderColor: "#f59e3b",
          borderWidth: 2,
          borderRadius: 4,
          fill: false
        }]
      };
    }
    return null;
  };

  // Get aggregated metric values from transformed data
  const { deploymentsSum, avgLeadTime, avgMttr, avgFailureRate } = metricsData?.aggregated || {
    deploymentsSum: 0,
    avgLeadTime: '--',
    avgMttr: '--',
    avgFailureRate: '--'
  };

  // Filter modal UI
  const FilterModal = () => {
    const [tempStart, setTempStart] = useState(startDate);
    const [tempEnd, setTempEnd] = useState(endDate);

    const handleApply = () => {
      setStartDate(tempStart);
      setEndDate(tempEnd);
      setShowFilterModal(false);
    };
    const handleCancel = () => setShowFilterModal(false);

    // Set reasonable min/max dates for the date picker
    const minDateTime = "2020-01-01T00:00";
    const maxDateTime = new Date().toISOString().slice(0, 16);

    return (
      <div className="filter-modal-overlay" onClick={handleCancel}>
        <div className="filter-modal" onClick={e => e.stopPropagation()}>
          <div className="filter-modal-header">
            <h3>Filter Date & Time Range</h3>
            <button className="filter-modal-close" onClick={handleCancel} aria-label="Close Filter Modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="filter-modal-content">
            <label htmlFor="start-date-time">
              Start Date & Time:
              <input
                id="start-date-time"
                type="datetime-local"
                value={tempStart}
                min={minDateTime}
                max={tempEnd || maxDateTime}
                onChange={e => setTempStart(e.target.value)}
              />
            </label>
            <label htmlFor="end-date-time" style={{ marginTop: 10 }}>
              End Date & Time:
              <input
                id="end-date-time"
                type="datetime-local"
                value={tempEnd}
                min={tempStart || minDateTime}
                max={maxDateTime}
                onChange={e => setTempEnd(e.target.value)}
              />
            </label>
          </div>
          <div className="filter-modal-footer">
            <button className="filter-btn secondary" onClick={handleCancel}>Cancel</button>
            <button className="filter-btn primary" onClick={handleApply} disabled={!tempStart || !tempEnd}>Apply Filter</button>
          </div>
        </div>
      </div>
    );
  };

  // Filter button & chips UI
  const FilterButton = () => (
    <button className="filter-button" onClick={() => setShowFilterModal(true)} aria-label="Open Filter Modal">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
      </svg>
      <span>Filter</span>
      {(startDate && endDate) && (
        <span className="filter-badge" aria-live="polite">1</span>
      )}
    </button>
  );

  const FilterChips = () => (
    <div className="filter-chips">
      {(startDate && endDate) && (
        <FilterChip
          label={`${formatForCompare(startDate)} ~ ${formatForCompare(endDate)}`}
          onRemove={() => { setStartDate(""); setEndDate(""); }}
        />
      )}
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="grafana-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading metrics data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grafana-dashboard">
        <div className="error-container">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => fetchMetricsData(startDate, endDate)}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grafana-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">DORA Metrics Dashboard</h1>
          <div className="dashboard-subtitle grafana-text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="header-controls">
          <FilterButton />
        </div>
      </div>

      {/* Filter chips */}
      {(startDate && endDate) && (
        <div className="filter-section">
          <FilterChips />
        </div>
      )}

      {/* Metrics */}
      <div className="metrics-row">
        <MetricCard 
          title="Deployment Frequency"
          value={deploymentsSum}
          unit="deployments"
          change="+12.5%"
          changeType="positive"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          }
        />
        <MetricCard 
          title="Lead Time"
          value={avgLeadTime}
          unit="days"
          change="-8.3%"
          changeType="positive"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          }
        />
        <MetricCard 
          title="Change Failure Rate"
          value={avgFailureRate}
          unit="%"
          change="-1.8%"
          changeType="positive"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          }
        />
        <MetricCard 
          title="MTTR"
          value={avgMttr}
          unit="hours"
          change="+0.7h"
          changeType="negative"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Deployment Frequency</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" aria-label="More options">⋮</button>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={getChartData("deployments")} options={chartOptions} />
          </div>
        </div>
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Lead Time for Changes</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" aria-label="More options">⋮</button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={getChartData("leadTime")} options={chartOptions} />
          </div>
        </div>
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Change Failure Rate</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" aria-label="More options">⋮</button>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={getChartData("failureRate")} options={chartOptions} />
          </div>
        </div>
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Mean Time to Recovery</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" aria-label="More options">⋮</button>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={getChartData("mttr")} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Filter modal */}
      {showFilterModal && <FilterModal />}
    </div>
  );
};

export default Dashboard;