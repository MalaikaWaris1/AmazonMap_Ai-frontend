import React from 'react';
import './MultiChannelSection.css';

const MultiChannelSection = () => {
  return (
    <section className="multichannel-section">
      <div className="multichannel-container">
        
        {/* Left Side: Floating Cards Visual (Qwen-QLora & Shopify/Amazon vibe) */}
        <div className="multichannel-visual">
          <div className="floating-card card-1">
            <div className="card-top-icon">🛍️</div>
            <div className="bar short"></div>
            <div className="bar medium"></div>
            <div className="bar long"></div>
          </div>

          <div className="floating-card card-2 main-card">
            <div className="card-top-icon ai-icon">🧠</div>
            <div className="bar medium"></div>
            <div className="bar long"></div>
          </div>

          <div className="floating-card card-3">
            <div className="card-top-icon">📦</div>
            <div className="bar short"></div>
            <div className="bar long"></div>
          </div>
        </div>

        {/* Right Side: Content tailored to Shopify, Amazon & Qwen-QLora */}
        <div className="multichannel-content">
          <h2>Seamlessly Sync Shopify Inventory to Amazon Using Qwen-QLora AI</h2>
          <p>
            Scale your e-commerce business effortlessly. Our advanced <strong>Qwen-QLora AI model</strong> automatically optimizes your product descriptions, maps categories, and eliminates schema errors, allowing you to list products in bulk from Shopify straight to Amazon in seconds.
          </p>
          <button className="mc-action-btn">Explore AI Listing Engine</button>
        </div>

      </div>
    </section>
  );
};

export default MultiChannelSection;