import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9"/>
          <path d="M13 17V5"/>
          <path d="M8 17v-3"/>
        </svg>
      ),
      title: "DORA Metrics",
      description: "Track deployment frequency, lead time, change failure rate, and MTTR",
      color: "var(--grafana-accent-blue)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9"/>
          <path d="M13 17V5"/>
          <path d="M8 17v-3"/>
        </svg>
      ),
      title: "Real-time Analytics",
      description: "Monitor your DevOps performance with live data updates",
      color: "var(--grafana-accent-green)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      title: "Custom Dashboards",
      description: "Create personalized views for your team's specific needs",
      color: "var(--grafana-accent-orange)"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      title: "Performance Insights",
      description: "Get actionable insights to improve your development process",
      color: "var(--grafana-accent-purple)"
    }
  ];

  return (
    <div className="grafana-home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </div>
          <h1 className="hero-title">AnaMetrix</h1>
          <p className="hero-subtitle">
            Advanced DORA metrics visualization and analytics platform
          </p>
          <div className="hero-actions">
            <button 
              className="primary-btn"
              onClick={() => navigate("/dashboard")}
            >
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </span>
              Launch Dashboard
            </button>
            <button className="secondary-btn">
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </span>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="metric-preview">
            <div className="preview-card">
              <div className="preview-header">
                <span className="preview-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                  </svg>
                </span>
                <span className="preview-title">Deployment Frequency</span>
              </div>
              <div className="preview-value">6.2</div>
              <div className="preview-unit">deployments/day</div>
              <div className="preview-change positive">+12.5%</div>
            </div>
            <div className="preview-card">
              <div className="preview-header">
                <span className="preview-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </span>
                <span className="preview-title">Lead Time</span>
              </div>
              <div className="preview-value">2.4</div>
              <div className="preview-unit">days</div>
              <div className="preview-change positive">-8.3%</div>
            </div>
            <div className="preview-card">
              <div className="preview-header">
                <span className="preview-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </span>
                <span className="preview-title">Success Rate</span>
              </div>
              <div className="preview-value">96.8</div>
              <div className="preview-unit">%</div>
              <div className="preview-change positive">+1.2%</div>
            </div>
            <div className="preview-card">
  <div className="preview-header">
    <span className="preview-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
      </svg>
    </span>
    <span className="preview-title">Change Failure Rate</span>
  </div>
  <div className="preview-value">2.8%</div>
  <div className="preview-unit">failures/deployment</div>
  <div className="preview-change negative">+5.1%</div>
</div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card grafana-panel">
              <div 
                className="feature-icon"
                style={{ backgroundColor: feature.color + '20' }}
              >
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to optimize your DevOps?</h2>
          <p>Start monitoring your DORA metrics today and drive continuous improvement.</p>
          <button 
            className="cta-btn"
            onClick={() => navigate("/dashboard")}
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;