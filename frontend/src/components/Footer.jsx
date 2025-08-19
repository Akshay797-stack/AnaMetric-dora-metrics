import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Dashboard", path: "/dashboard" },
        { label: "DORA Metrics", path: "/dashboard" },
        { label: "AIOps Intelligence", path: "/dashboard" },
        { label: "FinOps Integration", path: "/dashboard" },
        { label: "API Documentation", path: "/about" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Careers", path: "/about" },
        { label: "Press Kit", path: "/about" },
        { label: "Contact", path: "/contact" },
        { label: "Blog", path: "/about" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", path: "/about" },
        { label: "Community", path: "/about" },
        { label: "Tutorials", path: "/about" },
        { label: "Webinars", path: "/about" },
        { label: "Case Studies", path: "/about" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", path: "/about" },
        { label: "Terms of Service", path: "/about" },
        { label: "Cookie Policy", path: "/about" },
        { label: "GDPR", path: "/about" },
        { label: "Security", path: "/about" }
      ]
    }
  ];

  const socialLinks = [
    {
      name: "Twitter",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
      ),
      url: "https://twitter.com"
    },
    {
      name: "LinkedIn",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
            </svg>
      ),
      url: "https://linkedin.com"
    },
    {
      name: "GitHub",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-1.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
      ),
      url: "https://github.com"
    },
    {
      name: "YouTube",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.94C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.94A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.94 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
            </svg>
      ),
      url: "https://youtube.com"
    }
  ];

  return (
    <footer className="luxury-footer">
      <div className="footer-background">
        <div className="footer-pattern"></div>
      </div>
      
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
            </svg>
              </div>
              <span className="logo-text">AnaMetrix</span>
            </div>
            <p className="brand-description">
              The unified platform that transforms DevOps metrics into business intelligence, 
              combining DORA engineering metrics, AIOps predictive intelligence, and FinOps cost optimization.
            </p>
            <div className="social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
        </div>

          {/* Footer Links */}
        <div className="footer-links">
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section">
                <h3 className="section-title">{section.title}</h3>
                <ul className="section-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.path} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest insights on DevOps, AIOps, and FinOps delivered to your inbox.
            </p>
            <form className="newsletter-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
        </div>
            </form>
      </div>
        </div> */}

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} AnaMetrix. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/about" className="footer-bottom-link">Privacy</Link>
              <Link to="/about" className="footer-bottom-link">Terms</Link>
              <Link to="/about" className="footer-bottom-link">Cookies</Link>
        </div>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 