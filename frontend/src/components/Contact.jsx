import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="luxury-contact">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content text-center">
            <h1 className="hero-title">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="hero-description">
              Ready to transform your DevOps with AnaMetrix? Let's discuss how we can help 
              your engineering team achieve operational excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="section-title">Send us a Message</h2>
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company" className="form-label">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className="form-textarea"
                    placeholder="Tell us about your DevOps challenges and how AnaMetrix can help..."
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary btn-lg w-full">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info-section">
              <h2 className="section-title">Contact Information</h2>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-content">
                    <h3 className="method-title">Email</h3>
                    <p className="method-detail">anametrix.org@gamil.com</p>
                    <p className="method-description">Get in touch for sales inquiries, support, or partnerships.</p>
                  </div>
                </div>
                
                <div className="contact-method">
                  <div className="method-icon">🌐</div>
                  <div className="method-content">
                    <h3 className="method-title">Website</h3>
                    <p className="method-detail">anametrix.com</p>
                    <p className="method-description">Visit our website for more information and resources.</p>
                  </div>
                </div>
                
                <div className="contact-method">
                  <div className="method-icon">💼</div>
                  <div className="method-content">
                    <h3 className="method-title">LinkedIn</h3>
                    <p className="method-detail">linkedin.com/company/anametrix</p>
                    <p className="method-description">Follow us for industry insights and company updates.</p>
                  </div>
                </div>
                
                <div className="contact-method">
                  <div className="method-icon">🐙</div>
                  <div className="method-content">
                    <h3 className="method-title">GitHub</h3>
                    <p className="method-detail">github.com/anametrix</p>
                    <p className="method-description">Check out our open source contributions and projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;