import React, { useState } from 'react';
import './IntegrationSection.css';

// 1. Yahan forward slashes (/) aur sahi relative path dein (apne folder structure ke mutabiq)
import shopifyImg from '../../assets/shopify-card-img.jpg';
import aiImg from '../../assets/ai-card-img.jpg';
import amazonImg from '../../assets/amazon-card-img.jpg';

const IntegrationsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const integrationData = [
    {
      id: 0,
      title: "Shopify Store Integration",
      tag: "Source Platform",
      textTagClass: "shopify-text",
      description: "Instant product import, variant syncing, and automated order fulfillment tracking directly from your Shopify backend with zero manual data entry.",
      checks: [
        "✅ Real-time inventory mapping",
        "✅ Bulk product import in seconds",
        "✅ Multi-location stock tracking"
      ],
      imageSrc: shopifyImg
    },
    {
      id: 1,
      title: "Qwen-QLora AI Core Engine",
      tag: "Core Intelligence",
      textTagClass: "ai-text",
      description: "Our fine-tuned LLM pipeline handles deep data mapping, custom rule transformations, and strict schema validation to optimize your listings automatically.",
      checks: [
        "✅ Zero-error schema structuring",
        "✅ Intelligent category matching",
        "✅ Automated SEO title optimization"
      ],
      imageSrc: aiImg
    },
    {
      id: 2,
      title: "Amazon Seller Central",
      tag: "Destination Marketplace",
      textTagClass: "amazon-text",
      description: "Publish perfectly formatted listings straight to Amazon. Manage buy-box tracking, pricing multipliers, and FBA/FBM inventory matching seamlessly.",
      checks: [
        "✅ Automated compliance checks",
        "✅ Instant live sync across channels",
        "✅ Buy-box tracking & alerts"
      ],
      imageSrc: amazonImg
    }
  ];

  return (
    <section className="integrations-section">
      <div className="integrations-container">
        
        {/* Header */}
        <div className="integrations-header">
          <span className="integrations-badge">POWERFUL ECOSYSTEM</span>
          <h2>Connected with Your Favorite <span>Platforms</span></h2>
          <p>Seamlessly bridge your Shopify store and Amazon marketplace through our advanced Qwen-QLora AI automation pipeline.</p>
        </div>

        {/* Pill Navigation Bar */}
        <div className="pill-tabs-wrapper">
          <div className="pill-tabs-container">
            <button 
              className={`pill-btn ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              🛍️ Shopify Store
            </button>
            <button 
              className={`pill-btn ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              🧠 Qwen-QLora AI
            </button>
            <button 
              className={`pill-btn ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              📦 Amazon Central
            </button>
            
            <div 
              className="active-pill-indicator"
              style={{ transform: `translateX(${activeTab * 100}%)` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Content Card */}
        <div className="integration-display-card">
          <div className="display-content">
            <span className={`flow-tag ${integrationData[activeTab].textTagClass}`}>
              {integrationData[activeTab].tag}
            </span>
            <h3>{integrationData[activeTab].title}</h3>
            <p>{integrationData[activeTab].description}</p>
            
            <ul className="flow-checks">
              {integrationData[activeTab].checks.map((check, index) => (
                <li key={index}>{check}</li>
              ))}
            </ul>
          </div>

          {/* 2. Yahan placeholder hata kar actual <img> tag active kar diya hai */}
          <div className="display-visual">
            <img 
              src={integrationData[activeTab].imageSrc} 
              alt="Platform Preview" 
              className="visual-preview-img" 
            />
            
            <div className="live-status-badge">
              <span className="pulsing-dot"></span> Active Pipeline
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default IntegrationsSection;