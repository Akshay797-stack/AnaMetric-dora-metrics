import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { themes } = useTheme();

  const footer = [
    { value: "10x", label: "Faster Incident Resolution" },
    { value: "25%", label: "Cost Reduction" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Monitoring & Support" }
  ];

  const quotes = [
    {
      text: "Data is the new oil, but metrics are the refinery that turns it into actionable insights.",
      author: "AnaMetrix Philosophy",
      category: "Innovation"
    },
    {
      text: "In the world of DevOps, speed without insight is chaos. Insight without action is waste.",
      author: "Engineering Excellence",
      category: "DevOps"
    },
    {
      text: "Every deployment tells a story. Every metric reveals an opportunity.",
      author: "Continuous Improvement",
      category: "Growth"
    }
  ];

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
      title: "DORA Metrics Mastery",
      description: "Transform engineering performance into business intelligence with industry-standard DORA metrics",
      color: themes.accent,
      gradient: themes.gradientAccent
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
          <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
          <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
          <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
        </svg>
      ),
      title: "AI-Powered Predictions",
      description: "Predict operational issues before they impact your business with advanced AIOps intelligence",
      color: themes.secondary,
      gradient: themes.gradientSecondary
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: "FinOps Integration",
      description: "Connect engineering performance directly to financial impact and cost optimization",
      color: themes.success,
      gradient: themes.gradientPrimary
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      title: "Unified Intelligence",
      description: "Single platform combining DORA, AIOps, and FinOps for complete operational visibility",
      color: themes.warning,
      gradient: themes.gradientSecondary
    }
  ];

  const stats = [
    {
      value: "6.2",
      unit: "deployments/day",
      label: "Deployment Frequency",
      change: "+12.5%",
      trend: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9"/>
          <path d="M13 17V5"/>
          <path d="M8 17v-3"/>
        </svg>
      )
    },
    {
      value: "2.4",
      unit: "days",
      label: "Lead Time for Changes",
      change: "-8.3%",
      trend: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      )
    },
    {
      value: "96.8",
      unit: "%",
      label: "Change Success Rate",
      change: "+1.2%",
      trend: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
      )
    },
    {
      value: "2.8",
      unit: "%",
      label: "Change Failure Rate",
      change: "+5.1%",
      trend: "negative",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    }
  ];

  return (
    <div className="luxury-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-glow"></div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🚀</span>
              <span className="badge-text">Enterprise Ready</span>
            </div>
            
            <h1 className="hero-title">
              <span className="gradient-text">AnaMetrix</span>
              <br />
              <span className="hero-subtitle-text">Unified Engineering Intelligence Platform</span>
            </h1>
            
            <p className="hero-description">
              Transform DevOps metrics into business intelligence. AnaMetrix combines DORA engineering metrics, 
              AIOps predictive intelligence, and FinOps cost optimization to help engineering, finance, and 
              executive teams quantify the business impact of software delivery.
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/dashboard")}
              >
                <span className="btn-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </span>
                Launch Dashboard
              </button>
              
              <button className="btn btn-ghost btn-lg">
                <span className="btn-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </span>
                View Documentation
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card glass animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="stat-icon" style={{ color: stat.icon === stats[0].icon ? themes.accent : stat.icon === stats[1].icon ? themes.secondary : stat.icon === stats[2].icon ? themes.success : themes.warning }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-unit">{stat.unit}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className={`stat-change ${stat.trend}`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Quote Section
      <section className="quote-section">
        <div className="container">
          <div className="quote-carousel">
            {quotes.map((quote, index) => (
              <div key={index} className="quote-card glass animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="quote-icon">💡</div>
                <blockquote className="quote-text">
                  "{quote.text}"
                </blockquote>
                <div className="quote-meta">
                  <cite className="quote-author">— {quote.author}</cite>
                  <span className="quote-category">{quote.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Choose AnaMetrix?</h2>
            <p className="section-subtitle">
              The only platform that unifies DORA metrics, AIOps predictions, and FinOps optimization
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="feature-icon-wrapper" style={{ background: feature.gradient }}>
                  <div className="feature-icon" style={{ color: themes.textInverse }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="container">
          <div className="quote-carousel">
            {quotes.map((quote, index) => (
              <div key={index} className="quote-card glass animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="quote-icon">💡</div>
                <blockquote className="quote-text">
                  "{quote.text}"
                </blockquote>
                <div className="quote-meta">
                  <cite className="quote-author">— {quote.author}</cite>
                  <span className="quote-category">{quote.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* footer Section */}
      <section className="footer-section">
        <div className="container">
          <div className="footer-grid">
            {footer.map((stat, index) => (
              <div key={index} className="stat-card glass animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="cta-title">Ready to Transform Your DevOps?</h2>
            <p className="cta-description">
              Join leading engineering teams who are already using AnaMetrix to drive continuous improvement 
              and align engineering performance with business outcomes.
            </p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/dashboard")}
              >
                Start Free Trial
              </button>
              <button className="btn btn-secondary btn-lg">
                Schedule Demo
              </button>
            </div>
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

export default Home;