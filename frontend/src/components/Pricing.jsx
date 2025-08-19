// C:\Programming\AnaMetric\frontend\src\components\Pricing.jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./Pricing.css";

const Pricing = () => {
  const { themes } = useTheme();

  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for small teams getting started with DORA metrics",
      features: [
        "Up to 5 team members",
        "Basic DORA metrics tracking",
        "Standard dashboards",
        "Email support",
        "Community forum access"
      ],
      cta: "Get Started Free",
      popular: false,
      gradient: themes.gradientPrimary
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      description: "Ideal for growing engineering teams",
      features: [
        "Up to 25 team members",
        "Advanced DORA analytics",
        "AIOps predictions",
        "Custom dashboards",
        "Priority support",
        "API access",
        "Team collaboration tools"
      ],
      cta: "Start Free Trial",
      popular: true,
      gradient: themes.gradientSecondary
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "annual",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited team members",
        "Full DORA + AIOps + FinOps",
        "Custom integrations",
        "Advanced security & compliance",
        "Dedicated support",
        "On-premise deployment",
        "Custom training & onboarding"
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: themes.gradientAccent
    }
  ];

  return (
    <div className="luxury-pricing">
      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="container">
          <div className="hero-content text-center">
            <h1 className="hero-title">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h1>
            <p className="hero-description">
              Choose the plan that fits your team's needs. Start free and scale as you grow.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pricing-tiers">
        <div className="container">
          <div className="pricing-grid">
            {pricingTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`pricing-card ${tier.popular ? 'popular' : ''}`}
                style={{ 
                  '--tier-gradient': tier.gradient,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {tier.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                
                <div className="tier-header">
                  <h3 className="tier-name">{tier.name}</h3>
                  <div className="tier-price">
                    <span className="price-amount">{tier.price}</span>
                    <span className="price-period">/{tier.period}</span>
                  </div>
                  <p className="tier-description">{tier.description}</p>
                </div>

                <ul className="tier-features">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="feature-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`btn btn-primary btn-lg w-full ${tier.popular ? 'popular-btn' : ''}`}
                  style={{ background: tier.gradient }}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Can I change plans at any time?</h3>
              <p className="faq-answer">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is there a free trial?</h3>
              <p className="faq-answer">
                Professional plan comes with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What payment methods do you accept?</h3>
              <p className="faq-answer">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you offer discounts for nonprofits?</h3>
              <p className="faq-answer">
                Yes, we offer special pricing for educational institutions and nonprofit organizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing-cta">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join thousands of engineering teams who trust AnaMetrix to drive continuous improvement.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-lg">Start Free Trial</button>
              <button className="btn btn-secondary btn-lg">Schedule Demo</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
