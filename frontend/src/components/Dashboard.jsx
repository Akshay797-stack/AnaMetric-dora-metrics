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
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
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
  Filler,
  TimeScale
);

// Custom plugin for enhanced grid styling
const enhancedGridPlugin = {
  id: 'enhancedGrid',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    
    // Draw subtle background grid
    ctx.save();
    ctx.strokeStyle = 'rgba(55, 65, 81, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = chartArea.left + (chartArea.right - chartArea.left) * (i / 10);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 8; i++) {
      const y = chartArea.top + (chartArea.bottom - chartArea.top) * (i / 8);
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }
};

// Register the enhanced grid plugin
ChartJS.register(enhancedGridPlugin);

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
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        color: '#d8d9da',
        font: { size: 12, family: 'Inter', weight: '600' },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      },
      position: 'top',
      align: 'start'
    },
    tooltip: {
      backgroundColor: 'rgba(15, 17, 23, 0.98)',
      titleColor: '#ffffff',
      bodyColor: '#e1e5e9',
      borderColor: '#5794f2',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: { size: 14, family: 'Inter', weight: '700' },
      bodyFont: { size: 13, family: 'Inter', weight: '500' },
      padding: 16,
      bodySpacing: 8,
      callbacks: {
        title: function(context) {
          const date = new Date(context[0].label);
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) + ' ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        },
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          if (label.includes('Lead Time')) {
            return `${label}: ${value.toFixed(2)} days`;
          } else if (label.includes('MTTR')) {
            return `${label}: ${value.toFixed(2)} hours`;
          } else if (label.includes('Deployments')) {
            return `${label}: ${value}`;
          }
          return `${label}: ${value}`;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        displayFormats: {
          day: 'MMM dd',
          week: 'MMM dd',
          month: 'MMM yyyy'
        },
        tooltipFormat: 'MMM dd, yyyy HH:mm'
      },
      grid: { 
        color: 'rgba(55, 65, 81, 0.2)', 
        drawBorder: false,
        lineWidth: 1,
        drawOnChartArea: true
      },
      ticks: { 
        color: '#9ca3af', 
        font: { size: 11, family: 'Inter', weight: '600' },
        maxRotation: 0,
        minRotation: 0,
        padding: 8
      },
      border: {
        color: '#374151',
        width: 1
      }
    },
    y: {
      grid: { 
        color: 'rgba(55, 65, 81, 0.15)', 
        drawBorder: false,
        lineWidth: 1,
        drawOnChartArea: true
      },
      ticks: { 
        color: '#9ca3af', 
        font: { size: 11, family: 'Inter', weight: '600' },
        padding: 8,
        callback: function(value) {
          return value.toLocaleString();
        }
      },
      border: {
        color: '#374151',
        width: 1
      },
      beginAtZero: true
    }
  },
  elements: {
    point: {
      hoverRadius: 8,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff',
      radius: 4,
      borderWidth: 2,
      borderColor: '#ffffff',
      backgroundColor: '#ffffff'
    },
    line: {
      tension: 0.2,
      borderWidth: 2.5,
      fill: false
    },
    bar: {
      borderRadius: 4,
      borderSkipped: false
    }
  },
  animation: {
    duration: 800,
    easing: 'easeOutQuart'
  },
  hover: {
    mode: 'index',
    intersect: false,
    animationDuration: 200
  },
  responsiveAnimationDuration: 800
};

// Enhanced chart options for specific chart types
const getEnhancedChartOptions = (type) => {
  const baseOptions = { ...chartOptions };
  
  // Add custom plugin for vertical line on hover (TradingView style)
  const verticalLinePlugin = {
    id: 'verticalLine',
    beforeDraw: (chart) => {
      if (chart.tooltip._active && chart.tooltip._active.length) {
        const activePoint = chart.tooltip._active[0];
        const ctx = chart.ctx;
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;
        
        // Draw main vertical line (crosshair)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(87, 148, 242, 0.9)';
        ctx.stroke();
        
        // Draw horizontal line (crosshair)
        const y = activePoint.element.y;
        const leftX = chart.scales.x.left;
        const rightX = chart.scales.x.right;
        
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(rightX, y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(87, 148, 242, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        
        // Draw subtle background highlight
        ctx.beginPath();
        ctx.rect(x - 0.5, topY, 1, bottomY - topY);
        ctx.fillStyle = 'rgba(87, 148, 242, 0.05)';
        ctx.fill();
        
        ctx.restore();
      }
    }
  };
  
  baseOptions.plugins = {
    ...baseOptions.plugins,
    verticalLine: verticalLinePlugin
  };
  
  if (type === 'leadTime') {
    baseOptions.scales.y.beginAtZero = false;
    baseOptions.scales.y.ticks.callback = function(value) {
      return `${value.toFixed(1)}d`;
    };
  } else if (type === 'mttr') {
    baseOptions.scales.y.ticks.callback = function(value) {
      return `${value.toFixed(1)}h`;
    };
  } else if (type === 'deployments') {
    baseOptions.scales.y.ticks.callback = function(value) {
      return Math.round(value);
    };
  } else if (type === 'failureRate') {
    // Special configuration for CFR doughnut chart - no axes needed
    baseOptions.plugins.tooltip = {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        ...baseOptions.plugins.tooltip.callbacks,
        title: function() {
          return 'Change Failure Rate';
        },
        label: function(context) {
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${percentage}%`;
        }
      }
    };
    // Remove scales for doughnut chart
    baseOptions.scales = {};
  } else if (type === 'deployments') {
    // Deployments chart: Y-axis shows count, X-axis shows dates
    baseOptions.scales.y = {
      ...baseOptions.scales.y,
      type: 'linear',
      title: {
        display: true,
        text: 'Number of Deployments',
        color: '#9ca3af',
        font: { size: 12, family: 'Inter', weight: '600' }
      },
      ticks: {
        ...baseOptions.scales.y.ticks,
        callback: function(value) {
          return Math.round(value);
        }
      },
      beginAtZero: true
    };
    baseOptions.scales.x = {
      ...baseOptions.scales.x,
      type: 'time',
      title: {
        display: true,
        text: 'Date',
        color: '#9ca3af',
        font: { size: 12, family: 'Inter', weight: '600' }
      }
    };
    // Ensure Y-axis starts from 0 for count data
    baseOptions.scales.y.beginAtZero = true;
  } else if (type === 'leadTime') {
    // Lead Time chart: Y-axis shows days, X-axis shows dates
    baseOptions.scales.y = {
      ...baseOptions.scales.y,
      title: {
        display: true,
        text: 'Lead Time (Days)',
        color: '#9ca3af',
        font: { size: 12, family: 'Inter', weight: '600' }
      },
      ticks: {
        ...baseOptions.scales.y.ticks,
        callback: function(value) {
          return `${value.toFixed(1)}d`;
        }
      }
    };
    baseOptions.scales.x = {
      ...baseOptions.scales.x,
      title: {
        display: true,
        text: 'Date',
        color: '#9ca3af',
        font: { size: 12, family: 'Inter', weight: '600' }
      }
    };
  } else if (type === 'mttr') {
    // MTTR chart: Y-axis shows hours, X-axis shows dates
    baseOptions.scales.y = {
      ...baseOptions.scales.y,
      title: {
        display: true,
        text: 'MTTR (Hours)',
        color: '#9ca3af',
        font: { size: 12, family: 'Inter', weight: '600' }
      },
      ticks: {
        ...baseOptions.scales.y.ticks,
        callback: function(value) {
          return `${value.toFixed(1)}h`;
        }
      }
    };
    baseOptions.scales.x = {
      ...baseOptions.scales.x,
      title: {
        display: true,
        text: 'Date',
        color: '#9ca3af',
        font: { size: 12, family: 'Inter', weight: '600' }
      }
    };
  }
  
  return baseOptions;
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
  
  // State for detail modals
  const [showDeploymentsDetail, setShowDeploymentsDetail] = useState(false);
  const [showLeadTimeDetail, setShowLeadTimeDetail] = useState(false);
  const [showMTTRDetail, setShowMTTRDetail] = useState(false);
  const [showFailureRateDetail, setShowFailureRateDetail] = useState(false);

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
    
    // Convert datetime strings to Date objects for proper time scale
    const labels = currentData.map(item => new Date(item.datetime));
    const data = currentData.map(item => item[type]);

    if (type === "deployments") {
      return {
        labels,
        datasets: [{
          label: "Deployments",
          data,
          backgroundColor: "rgba(87, 148, 242, 0.15)",
          borderColor: "#5794f2",
          borderWidth: 3,
          borderRadius: 4,
          fill: true,
          pointBackgroundColor: "#5794f2",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#5794f2",
          pointHoverBorderWidth: 3,
          hoverBackgroundColor: "rgba(87, 148, 242, 0.25)",
          hoverBorderColor: "#5794f2",
          hoverBorderWidth: 4,
          tension: 0.1
        }]
      };
    }
    if (type === "leadTime") {
      return {
        labels,
        datasets: [{
          label: "Lead Time (days)",
          data,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#10b981",
          pointHoverBorderWidth: 3,
          hoverBackgroundColor: "rgba(16, 185, 129, 0.2)",
          hoverBorderColor: "#10b981",
          hoverBorderWidth: 4
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
          backgroundColor: [
            "rgba(16, 185, 129, 0.9)", 
            "rgba(239, 68, 68, 0.9)"
          ],
          borderColor: ["#10b981", "#ef4444"],
          borderWidth: 2,
          hoverOffset: 12,
          borderRadius: 6,
          cutout: '65%',
          hoverBackgroundColor: [
            "rgba(16, 185, 129, 1)", 
            "rgba(239, 68, 68, 1)"
          ],
          spacing: 2
        }]
      };
    }
    if (type === "mttr") {
      return {
        labels,
        datasets: [{
          label: "MTTR (hours)",
          data,
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          borderColor: "#f59e0b",
          borderWidth: 3,
          borderRadius: 4,
          fill: true,
          pointBackgroundColor: "#f59e0b",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#f59e0b",
          pointHoverBorderWidth: 3,
          hoverBackgroundColor: "rgba(245, 158, 11, 0.25)",
          hoverBorderColor: "#f59e0b",
          hoverBorderWidth: 4,
          tension: 0.1
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

  // Deployments Detail Modal
  const DeploymentsDetailModal = () => (
    <div className="filter-modal-overlay" onClick={() => setShowDeploymentsDetail(false)}>
      <div className="filter-modal detail-modal" onClick={e => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Deployment Frequency - Detailed Analysis</h3>
          <button className="filter-modal-close" onClick={() => setShowDeploymentsDetail(false)} aria-label="Close Detail Modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="filter-modal-content">
          <div className="detail-section">
            <h4>Summary</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Total Deployments:</span>
                <span className="detail-value">{deploymentsSum}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Range:</span>
                <span className="detail-value">{startDate && endDate ? `${formatForCompare(startDate)} - ${formatForCompare(endDate)}` : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Average per Day:</span>
                <span className="detail-value">{currentData.length > 0 ? (deploymentsSum / currentData.length).toFixed(2) : 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h4>Deployment Timeline</h4>
            <div className="timeline-container">
              {currentData.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-date">{new Date(item.datetime).toLocaleDateString()}</div>
                  <div className="timeline-value">{item.deployments} deployments</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Lead Time Detail Modal
  const LeadTimeDetailModal = () => (
    <div className="filter-modal-overlay" onClick={() => setShowLeadTimeDetail(false)}>
      <div className="filter-modal detail-modal" onClick={e => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Lead Time for Changes - Detailed Analysis</h3>
          <button className="filter-modal-close" onClick={() => setShowLeadTimeDetail(false)} aria-label="Close Detail Modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="filter-modal-content">
          <div className="detail-section">
            <h4>Summary</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Average Lead Time:</span>
                <span className="detail-value">{avgLeadTime} days</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Range:</span>
                <span className="detail-value">{startDate && endDate ? `${formatForCompare(startDate)} - ${formatForCompare(endDate)}` : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data Points:</span>
                <span className="detail-value">{currentData.length}</span>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h4>Lead Time Trends</h4>
            <div className="timeline-container">
              {currentData.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-date">{new Date(item.datetime).toLocaleDateString()}</div>
                  <div className="timeline-value">{item.leadTime?.toFixed(2) || 'N/A'} days</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // MTTR Detail Modal
  const MTTRDetailModal = () => (
    <div className="filter-modal-overlay" onClick={() => setShowMTTRDetail(false)}>
      <div className="filter-modal detail-modal" onClick={e => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Mean Time to Recovery - Detailed Analysis</h3>
          <button className="filter-modal-close" onClick={() => setShowMTTRDetail(false)} aria-label="Close Detail Modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="filter-modal-content">
          <div className="detail-section">
            <h4>Summary</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Average MTTR:</span>
                <span className="detail-value">{avgMttr} hours</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Range:</span>
                <span className="detail-value">{startDate && endDate ? `${formatForCompare(startDate)} - ${formatForCompare(endDate)}` : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data Points:</span>
                <span className="detail-value">{currentData.length}</span>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h4>Recovery Time Trends</h4>
            <div className="timeline-container">
              {currentData.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-date">{new Date(item.datetime).toLocaleDateString()}</div>
                  <div className="timeline-value">{item.mttr?.toFixed(2) || 'N/A'} hours</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Failure Rate Detail Modal
  const FailureRateDetailModal = () => (
    <div className="filter-modal-overlay" onClick={() => setShowFailureRateDetail(false)}>
      <div className="filter-modal detail-modal" onClick={e => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Change Failure Rate - Detailed Analysis</h3>
          <button className="filter-modal-close" onClick={() => setShowFailureRateDetail(false)} aria-label="Close Detail Modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="filter-modal-content">
          <div className="detail-section">
            <h4>Summary</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Current Failure Rate:</span>
                <span className="detail-value">{avgFailureRate}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Success Rate:</span>
                <span className="detail-value">{100 - (avgFailureRate || 0)}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Range:</span>
                <span className="detail-value">{startDate && endDate ? `${formatForCompare(startDate)} - ${formatForCompare(endDate)}` : 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h4>Failure Rate Analysis</h4>
            <div className="failure-rate-breakdown">
              <div className="failure-rate-item success">
                <span className="failure-rate-label">Successful Changes</span>
                <span className="failure-rate-value">{100 - (avgFailureRate || 0)}%</span>
              </div>
              <div className="failure-rate-item failure">
                <span className="failure-rate-label">Failed Changes</span>
                <span className="failure-rate-value">{avgFailureRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
              <button className="panel-action-btn" onClick={() => setShowDeploymentsDetail(true)} aria-label="View detailed analysis">⋮</button>
            </div>
          </div>
          <div className={`chart-container ${loading ? 'loading' : ''}`}>
            <Bar data={getChartData("deployments")} options={getEnhancedChartOptions("deployments")} />
          </div>
        </div>
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Lead Time for Changes</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" onClick={() => setShowLeadTimeDetail(true)} aria-label="View detailed analysis">⋮</button>
            </div>
          </div>
          <div className={`chart-container ${loading ? 'loading' : ''}`}>
            <Line data={getChartData("leadTime")} options={getEnhancedChartOptions("leadTime")} />
          </div>
        </div>
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Change Failure Rate</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" onClick={() => setShowFailureRateDetail(true)} aria-label="View detailed analysis">⋮</button>
            </div>
          </div>
          <div className={`chart-container ${loading ? 'loading' : ''}`}>
            <Doughnut data={getChartData("failureRate")} options={getEnhancedChartOptions("failureRate")} />
          </div>
        </div>
        <div className="chart-panel grafana-panel">
          <div className="panel-header">
            <h3>Mean Time to Recovery</h3>
            <div className="panel-actions">
              <button className="panel-action-btn" onClick={() => setShowMTTRDetail(true)} aria-label="View detailed analysis">⋮</button>
            </div>
          </div>
          <div className={`chart-container ${loading ? 'loading' : ''}`}>
            <Bar data={getChartData("mttr")} options={getEnhancedChartOptions("mttr")} />
          </div>
        </div>
      </div>

      {/* Filter modal */}
      {showFilterModal && <FilterModal />}
      {showDeploymentsDetail && <DeploymentsDetailModal />}
      {showLeadTimeDetail && <LeadTimeDetailModal />}
      {showMTTRDetail && <MTTRDetailModal />}
      {showFailureRateDetail && <FailureRateDetailModal />}
    </div>
  );
};

export default Dashboard;