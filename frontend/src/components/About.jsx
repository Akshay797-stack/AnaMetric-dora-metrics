import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./About.css";

const About = () => {
  const { themes } = useTheme();

  const features = [
    {
      icon: "📊",
      title: "DORA Metrics Mastery",
      description: "Industry-standard DORA metrics with real-time tracking and trend analysis"
    },
    {
      icon: "🤖",
      title: "AI-Powered Predictions",
      description: "Predict operational issues before they impact your business with advanced AIOps"
    },
    {
      icon: "💰",
      title: "FinOps Integration",
      description: "Connect engineering performance directly to financial impact and cost optimization"
    },
    {
      icon: "🔗",
      title: "Unified Platform",
      description: "Single platform combining all three domains for complete operational visibility"
    }
  ];

  const stats = [
    { value: "10x", label: "Faster Incident Resolution" },
    { value: "25%", label: "Cost Reduction" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Monitoring & Support" }
  ];

  return (
    <div className="luxury-about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content text-center">
            <h1 className="hero-title">
              About <span className="gradient-text">AnaMetrix</span>
            </h1>
            <p className="hero-description">
              The unified platform that transforms DevOps metrics into business intelligence, 
              combining DORA engineering metrics, AIOps predictive intelligence, and FinOps cost optimization.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">
              AnaMetrix solves a real gap in the market: existing tools measure either engineering performance (DORA) 
              or cloud costs (FinOps) or provide incident intelligence (AIOps) — but none tightly combine all three 
              with predictive capabilities and a hybrid deployment model. By linking operational events to dollar impact 
              and future forecasts, AnaMetrix turns DevOps KPIs into business KPIs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose AnaMetrix?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card glass animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="container">
          <div className="vision-content text-center">
            <h2 className="section-title">Our Vision</h2>
            <p className="vision-text">
              AnaMetrix becomes the operational and financial "mission control" for software delivery. 
              Every deployment comes with a live forecast of reliability risk, cost impact, and potential business value. 
              CFOs, CTOs, and engineering leads use a common dashboard to make trade-off decisions between speed, 
              reliability, and cost.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;