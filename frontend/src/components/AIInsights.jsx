import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useTheme } from "../contexts/ThemeContext";
import apiService from "../services/api";
import "./AIInsights.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const AIInsights = () => {
  const { themes } = useTheme();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [aiInsights, setAiInsights] = useState(null);
  const [forecasts, setForecasts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("deployment_frequency");

  // --- Helpers for forecasting and smoothing on the client ---
  const clipToZero = (value) => Math.max(0, Number.isFinite(value) ? value : 0);

  const buildTimeSeries = (historyArr = [], forecastArr = [], metric = "") => {
    const convert = (val) => {
      if (metric === 'lead_time') {
        return clipToZero(val / 24.0); // backend provides hours; display days
      }
      return clipToZero(val);
    };
    const history = (historyArr || []).map((it) => ({ x: new Date(it.ds), y: convert(it.y) }));
    const forecast = (forecastArr || []).map((it) => ({ x: new Date(it.ds), y: convert(it.yhat) }));
    return { history, forecast };
  };

  // Simple linear regression (least squares) on last N points to extrapolate
  const regressionForecast = (points, horizon) => {
    if (!points || points.length === 0) return [];
    if (points.length === 1) {
      const last = points[0].y;
      return Array.from({ length: horizon }, (_, i) => clipToZero(last));
    }
    const n = points.length;
    const xs = Array.from({ length: n }, (_, i) => i);
    const ys = points.map((p) => p.y);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
    const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
    const denom = n * sumXX - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = (sumY - slope * sumX) / n;
    return Array.from({ length: horizon }, (_, k) => clipToZero(slope * (n + k) + intercept));
  };

  // Exponential smoothing to reduce sharp spikes in the forecast curve
  const exponentialSmooth = (values, alpha = 0.4, seed = null) => {
    if (!values || values.length === 0) return [];
    const out = [];
    let s = seed != null ? seed : values[0];
    for (let i = 0; i < values.length; i++) {
      s = alpha * values[i] + (1 - alpha) * s;
      out.push(clipToZero(s));
    }
    return out;
  };

  // Moving average for additional smoothing
  const movingAverage = (values, window = 3) => {
    if (!values || values.length === 0) return [];
    const w = Math.max(1, window);
    const out = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= w) sum -= values[i - w];
      const count = Math.min(i + 1, w);
      out.push(clipToZero(sum / count));
    }
    return out;
  };

  // Percentile helper for capping forecast extremes
  const percentile = (values, p = 0.95) => {
    const arr = (values || []).filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
    if (arr.length === 0) return 0;
    const idx = Math.min(arr.length - 1, Math.max(0, Math.floor(p * (arr.length - 1))));
    return arr[idx];
  };

  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().slice(0, 16));
    setEndDate(end.toISOString().slice(0, 16));
  }, []);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch AI insights
      const insightsData = await apiService.getAIInsights(startDate, endDate);
      setAiInsights(insightsData);

      // Fetch forecasts for all metrics
      const metrics = ["deployment_frequency", "lead_time", "mttr", "cfr"];
      const forecastPromises = metrics.map(metric => 
        apiService.getForecast(metric, startDate, endDate, 30)
      );

      const forecastResults = await Promise.all(forecastPromises);
      const forecastData = {};
      
      metrics.forEach((metric, index) => {
        forecastData[metric] = forecastResults[index];
      });

      setForecasts(forecastData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, fetchData]);

  const getForecastChartData = (metric) => {
    const forecast = forecasts[metric];
    const result = forecast && forecast.result ? forecast.result : null;
    let history = result ? (result.history || []) : [];
    let forecastData = result ? (result.forecast || []) : [];

    // Lead Time: if backend missing any history, fallback to metrics summary daily
    if (metric === 'lead_time' && (!history || history.length === 0)) {
      const daily = aiInsights?.metrics_summary?.lead_time?.daily || {};
      history = Object.entries(daily).map(([date, hours]) => ({ ds: date, y: Number(hours) || 0 }));
      history.sort((a, b) => new Date(a.ds) - new Date(b.ds));
    }

    if ((!history || history.length === 0) && (!forecastData || forecastData.length === 0)) {
      return null;
    }

    // Build series with non-negative values and proper x,y mapping
    let { history: histSeries, forecast: backendForecastSeries } = buildTimeSeries(history, forecastData, metric);

    // If backend provided forecast, use its dates; else, create dates continuing from last history date
    let forecastDates = backendForecastSeries.map((p) => p.x);
    if (forecastDates.length === 0 && histSeries.length > 0) {
      const periods = 30; // default horizon
      const lastDate = new Date(histSeries[histSeries.length - 1].x);
      forecastDates = Array.from({ length: periods }, (_, i) => {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + (i + 1));
        return d;
      });
    }

    // Build a local forecast using regression over the last 14 history points if backend forecast is missing
    const needLocalForecast = backendForecastSeries.length === 0;
    let forecastValues = backendForecastSeries.map((p) => p.y);
    if (needLocalForecast) {
      const recentHist = histSeries.slice(-14);
      const reg = regressionForecast(recentHist, forecastDates.length);
      forecastValues = reg;
    }

    // Metric-specific smoothing: stronger smoothing for MTTR
    const alpha = metric === 'mttr' ? 0.18 : metric === 'lead_time' ? 0.35 : 0.4;
    // Smooth the forecast with exponential smoothing, seeded with last history value
    const lastHistValue = histSeries.length > 0 ? histSeries[histSeries.length - 1].y : null;
    let smoothedForecast = exponentialSmooth(forecastValues, alpha, lastHistValue);
    // Additional moving average to suppress random spikes (stronger for MTTR)
    smoothedForecast = movingAverage(smoothedForecast, metric === 'mttr' ? 7 : 3);

    // Optional mild smoothing for MTTR historical display (keeps values non-negative)
    if (metric === 'mttr' && histSeries.length > 0) {
      const histVals = histSeries.map((p) => p.y);
      const smoothedHistVals = movingAverage(histVals, 5);
      histSeries = histSeries.map((p, i) => ({ x: p.x, y: smoothedHistVals[i] }));
    }

    // MTTR: cap forecast extremes to a reasonable band based on historical P95
    if (metric === 'mttr' && histSeries.length > 0) {
      const histVals = histSeries.map((p) => p.y);
      const p95 = percentile(histVals, 0.95);
      const cap = (p95 || 0) * 1.2 + 1e-6; // small epsilon
      smoothedForecast = smoothedForecast.map((v) => clipToZero(Math.min(v, cap)));
    }

    // Clip any negative bounds from backend and map datasets to x,y pairs
    const scaleBound = (val) => (metric === 'lead_time' ? clipToZero(val / 24.0) : clipToZero(val));
    const upperBound = (forecastData || []).map((it) => ({ x: new Date(it.ds), y: scaleBound(it.yhat_upper) }));
    const lowerBound = (forecastData || []).map((it) => ({ x: new Date(it.ds), y: scaleBound(it.yhat_lower) }));

    const forecastSeries = forecastDates.map((d, i) => ({ x: d, y: clipToZero(smoothedForecast[i] ?? 0) }));

    return {
      datasets: [
        {
          label: 'Historical Data',
          data: histSeries,
          borderColor: '#5794f2',
          backgroundColor: 'rgba(87, 148, 242, 0.1)',
          borderWidth: 2,
          fill: false,
          pointRadius: 3,
        },
        {
          label: 'Forecast',
          data: forecastSeries,
          borderColor: '#f59e3b',
          backgroundColor: 'rgba(245, 158, 59, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 2,
        },
        ...(upperBound.length > 0
          ? [
              {
                label: 'Upper Bound',
                data: upperBound,
                borderColor: 'rgba(245, 158, 59, 0.3)',
                backgroundColor: 'rgba(245, 158, 59, 0.05)',
                borderWidth: 1,
                fill: '+1',
                pointRadius: 0,
              },
              {
                label: 'Lower Bound',
                data: lowerBound,
                borderColor: 'rgba(245, 158, 59, 0.3)',
                backgroundColor: 'rgba(245, 158, 59, 0.05)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
              },
            ]
          : []),
      ],
    };
  };

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
          color: themes.textSecondary,
          font: { size: 12, family: 'Inter', weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        },
        position: 'top',
        align: 'start'
      },
      tooltip: {
        backgroundColor: themes.surface,
        titleColor: themes.textPrimary,
        bodyColor: themes.textSecondary,
        borderColor: themes.info,
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
            });
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const metric = selectedMetric;
            
            if (metric === 'lead_time') {
              return `${label}: ${value.toFixed(2)} days`;
            } else if (metric === 'mttr') {
              return `${label}: ${value.toFixed(2)} hours`;
            } else if (metric === 'cfr') {
              return `${label}: ${value.toFixed(2)}%`;
            } else {
              return `${label}: ${value.toFixed(2)}`;
            }
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
          tooltipFormat: 'MMM dd, yyyy'
        },
        grid: { 
          color: themes.border, 
          drawBorder: false,
          lineWidth: 1,
          drawOnChartArea: true
        },
        ticks: { 
          color: themes.textSecondary, 
          font: { size: 11, family: 'Inter', weight: '600' },
          maxRotation: 0,
          minRotation: 0,
          padding: 8
        },
        border: {
          color: themes.borderDark,
          width: 1
        }
      },
      y: {
        grid: { 
          color: themes.border, 
          drawBorder: false,
          lineWidth: 1,
          drawOnChartArea: true
        },
        ticks: { 
          color: themes.textSecondary, 
          font: { size: 11, family: 'Inter', weight: '600' },
          padding: 8,
          callback: function(value) {
            return value.toFixed(2);
          }
        },
        border: {
          color: themes.borderDark,
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
      },
      line: {
        tension: 0.4
      }
    }
  };

  const getMetricDisplayName = (metric) => {
    const names = {
      deployment_frequency: "Deployment Frequency",
      lead_time: "Lead Time",
      mttr: "MTTR",
      cfr: "Change Failure Rate"
    };
    return names[metric] || metric;
  };

  const getMetricUnit = (metric) => {
    const units = {
      deployment_frequency: "deployments",
      lead_time: "days",
      mttr: "hours",
      cfr: "%"
    };
    return units[metric] || "";
  };

  // Format AI insights text by removing markdown and making text bold
  const formatAIInsights = (text) => {
    if (!text) return "";
    
    return text
      // Remove markdown headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove asterisks and make text bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      // Remove other markdown symbols
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

  const renderFormattedText = (text) => {
    const formattedText = formatAIInsights(text);
    const paragraphs = formattedText.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      // Split by single newlines for inline formatting
      const lines = paragraph.split('\n');
      const formattedLines = lines.map((line, lineIndex) => {
        // Convert <strong> tags to actual bold text
        const parts = line.split(/(<strong>.*?<\/strong>)/);
        return (
          <span key={lineIndex}>
            {parts.map((part, partIndex) => {
              if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                const boldText = part.replace(/<\/?strong>/g, '');
                return <strong key={partIndex}>{boldText}</strong>;
              }
              return part;
            })}
          </span>
        );
      });
      
      return (
        <p key={index} className="insights-paragraph">
          {formattedLines}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="ai-insights-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading AI insights and forecasts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-insights-container">
        <div className="error-container">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-container">
      {/* Header */}
      <div className="ai-insights-header">
        <div className="header-left">
          <h1 className="ai-insights-title">AI Insights & Forecasting</h1>
          <div className="ai-insights-subtitle">
            Intelligent analysis and predictions for your DORA metrics
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="datetime-local"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="datetime-local"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
        <button onClick={fetchData} className="fetch-button">
          Update Analysis
        </button>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="insights-section">
          <h2>AI Analysis</h2>
          <div className="ai-insights-card">
            {aiInsights.ai_insights && aiInsights.ai_insights.ai_insights ? (
              <div className="insights-content">
                <h3>DORA Metrics Analysis</h3>
                {renderFormattedText(aiInsights.ai_insights.ai_insights)}
              </div>
            ) : aiInsights.ai_insights && aiInsights.ai_insights.error ? (
              <div className="insights-error">
                <h3>AI Analysis Error</h3>
                <p>{aiInsights.ai_insights.error}</p>
              </div>
            ) : aiInsights.error ? (
              <div className="insights-error">
                <h3>API Error</h3>
                <p>{aiInsights.error}</p>
              </div>
            ) : (
              <div className="insights-content">
                <h3>DORA Metrics Analysis</h3>
                <div className="insights-text">
                  <p>AI analysis is being processed...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forecasting Section */}
      <div className="forecasting-section">
        <h2>Forecasting</h2>
        <div className="metric-selector">
          <label htmlFor="metricSelect">Select Metric:</label>
          <select
            id="metricSelect"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-select"
          >
            <option value="deployment_frequency">Deployment Frequency</option>
            <option value="lead_time">Lead Time</option>
            <option value="mttr">MTTR</option>
            <option value="cfr">Change Failure Rate</option>
          </select>
        </div>

        <div className="forecast-charts">
          {Object.keys(forecasts).map(metric => {
            const forecast = forecasts[metric];
            const hasError = forecast && forecast.error;
            
            return (
              <div key={metric} className={`forecast-chart ${selectedMetric === metric ? 'active' : 'hidden'}`}>
                <div className="chart-header">
                  <h3>{getMetricDisplayName(metric)} Forecast</h3>
                  <span className="unit">({getMetricUnit(metric)})</span>
                </div>
                <div className="chart-container">
                  {hasError ? (
                    <div className="no-data error">Error: {forecast.error}</div>
                  ) : getForecastChartData(metric) ? (
                    <Line data={getForecastChartData(metric)} options={chartOptions} />
                  ) : (
                    <div className="no-data">No forecast data available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
