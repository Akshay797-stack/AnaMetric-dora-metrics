import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const Breadcrumbs = () => {
  const location = useLocation();

  // Break the current path into parts, ignore empty segments
  const pathnames = location.pathname.split("/").filter(Boolean);

  // Capitalize and replace dashes with spaces for nicer display
  const formatName = (name) =>
    name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Get icon for each path segment
  const getPathIcon = (name) => {
    const icons = {
      dashboard: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      about: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      contact: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      home: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    };
    return icons[name.toLowerCase()] || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    );
  };

  return (
    <nav className="grafana-breadcrumbs" aria-label="breadcrumb navigation">
      <div className="breadcrumb-container">
        <Link to="/" className="breadcrumb-item">
          <span className="breadcrumb-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </span>
          <span className="breadcrumb-text">Home</span>
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          return (
            <span key={routeTo} className="breadcrumb-segment">
              <span className="separator" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </span>
              {isLast ? (
                <span className="breadcrumb-item current" aria-current="page">
                  <span className="breadcrumb-icon">{getPathIcon(name)}</span>
                  <span className="breadcrumb-text">{formatName(name)}</span>
                </span>
              ) : (
                <Link to={routeTo} className="breadcrumb-item">
                  <span className="breadcrumb-icon">{getPathIcon(name)}</span>
                  <span className="breadcrumb-text">{formatName(name)}</span>
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;