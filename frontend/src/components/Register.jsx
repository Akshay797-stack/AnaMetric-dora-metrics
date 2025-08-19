import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const Register = () => {
  const location = useLocation();
  const emailPrefill = location.state?.emailPrefill || "";

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState(emailPrefill);
  const [emailOtpVisible, setEmailOtpVisible] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [phoneOtpVisible, setPhoneOtpVisible] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [numEmployees, setNumEmployees] = useState("");
  const [wishPack, setWishPack] = useState("SaaS");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder submit; integrate backend later
    await new Promise((r) => setTimeout(r, 500));
    try {
      // Store registered email locally for sign-in existence checks
      let existing = [];
      try {
        const raw = localStorage.getItem("registeredEmails");
        if (raw) existing = JSON.parse(raw);
      } catch (_) {
        // ignore
      }
      const next = Array.from(new Set([...(existing || []), companyEmail].filter(Boolean)));
      localStorage.setItem("registeredEmails", JSON.stringify(next));
      alert("Registered (demo). Backend integration pending.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div className="card" style={{ maxWidth: 680, margin: "0 auto" }}>
        <h2 className="card-title" style={{ marginBottom: 8 }}>Register</h2>
        <p className="card-subtitle" style={{ marginBottom: 24 }}>Create your company account.</p>

        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="Auth-label">Company Name</label>
              <input
                className="Auth-input"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="Auth-label">Number of Employees</label>
              <input
                className="Auth-input"
                type="number"
                min="1"
                placeholder="100"
                value={numEmployees}
                onChange={(e) => setNumEmployees(e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="Auth-label">Company Address</label>
              <input
                className="Auth-input"
                placeholder="123 Business St, City, Country"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="Auth-label">Company Email</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="Auth-input"
                  type="email"
                  placeholder="you@company.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-secondary" onClick={() => setEmailOtpVisible(true)}>
                  Verify
                </button>
              </div>
              {emailOtpVisible && (
                <div style={{ marginTop: 8 }}>
                  <input
                    className="Auth-input"
                    placeholder="Enter OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="Auth-label">Company Contact Number</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="Auth-input"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-secondary" onClick={() => setPhoneOtpVisible(true)}>
                  Verify
                </button>
              </div>
              {phoneOtpVisible && (
                <div style={{ marginTop: 8 }}>
                  <input
                    className="Auth-input"
                    placeholder="Enter OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="Auth-label">Wish Pack</label>
              <select className="Auth-input" value={wishPack} onChange={(e) => setWishPack(e.target.value)}>
                <option value="SaaS">SaaS</option>
                <option value="Self-Host">Self-Host</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;


