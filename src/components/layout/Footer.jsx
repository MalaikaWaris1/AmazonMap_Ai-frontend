import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
// Yahan apne assets folder se image ka sahi path dijiye
import myGraphic from '../../assets/img6.jpg'; 

const Footer = () => {
  return (
    <footer className="footer-section">
      {/* Floating Call-to-Action Card */}
      <div className="footer-card-wrapper">
        <div className="footer-cta-card">
          
          {/* Left Side: Text and Button (Aligned vertically) */}
          <div className="footer-cta-content">
            <h2>Transform Shopify to Amazon with AI</h2>
            <p>Automate mapping, schema validation, and live syncing with 99.9% accuracy.</p>
            <button className="footer-cta-btn">
              Start free demo <span className="arrow">→</span>
            </button>
          </div>

          {/* Right Side: Circular Curved Image */}
          <div className="footer-cta-graphic">
            <img src={myGraphic} alt="AI Mapping Graphic" className="cta-circular-img" />
          </div>

        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-icon">A</span>
              <h3>AmazonMap<span className="logo-highlight">Ai</span></h3>
            </div>
            <p className="footer-desc">
              The ultimate explainable AI pipeline to turn your Shopify product catalogs into fully optimized Amazon listings.
            </p>
            <div className="system-status">
              <span className="status-dot"></span> All Systems Operational
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Services</Link></li>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">How it works</Link></li>
              <li><Link to="/">Workflow</Link></li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div className="footer-col">
            <h4>Features</h4>
            <ul>
              <li><Link to="/">AI Data Mapping</Link></li>
              <li><Link to="/">Rule Transformation</Link></li>
              <li><Link to="/">Amazon Schema Validation</Link></li>
              <li><Link to="/">Live Sync Status</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Social */}
          <div className="footer-col">
            <h4>Legal & Trust</h4>
            <ul>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Data Confidentiality</Link></li>
              <li><Link to="/">Security Compliance</Link></li>
            </ul>
          </div>

        </div>

        {/* Subfooter (Bottom Line) */}
        <div className="subfooter">
          <div className="footer-container subfooter-flex">
            <p>© 2026 AmazonMapAi. All rights reserved.</p>
            <div className="subfooter-links">
              <p>AI-powered Amazon listing.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;