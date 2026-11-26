import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Banner (Without Close Button) */}
      <div className="top-announcement-banner">
        <div className="banner-content">
         
          <p>
            <span>🚀 99.9% Mapping Accuracy</span> &nbsp;|&nbsp; 
            <span>🔒 Enterprise-grade Data Confidentiality</span> &nbsp;|&nbsp; 
            <span>⚡ Seamless Shopify to Amazon Sync</span>
          </p>
        </div>
      </div>

      <header className={`custom-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          
          {/* LEFT: Hamburger Menu + Logo */}
          <div className="header-left">
            <button 
              className="mobile-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="16" y2="18"></line>
                </svg>
              )}
            </button>

            <div className="logo">
              <span className="logo-icon">A</span>
              <h1>AmazonMap<span className="logo-highlight">Ai</span></h1>
            </div>
          </div>

          {/* MIDDLE: Desktop Nav Links */}
          <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <ul>
              <li><Link to="/">Integrations</Link></li>
              
              <li><Link to="/how-it-works">How it works</Link></li>

              <li className={`dropdown ${isFeaturesOpen ? 'mobile-open' : ''}`}>
                <span 
                  className="dropbtn" 
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                >
                  Features 
                  <span style={{ fontSize: '11px', marginLeft: '6px' }}>
                    {isFeaturesOpen ? '▲' : '▼'}
                  </span>
                </span>

                <div className="dropdown-content">
                  <Link to="/">AI Data Mapping</Link>
                  <Link to="/">Rule Transformation</Link>
                  <Link to="/">Amazon Schema Validation</Link>
                  <Link to="/">Live Sync Status</Link>
                </div>
              </li>

              <li><Link to="/">Workflow</Link></li>
            </ul>
          </nav>

          {/* RIGHT: Auth Buttons */}
          <div className="auth-buttons">
            <Link to="auth" className="btn-login">Login</Link>
            <Link to="dashboard" className="btn-signin">Sign in</Link>
          </div>

        </div>
      </header>
    </>
  );
};

export default Header;