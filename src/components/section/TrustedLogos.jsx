import React from 'react';
import './TrustedLogos.css';

const TrustedLogos = () => {
  // Logos array ko 2 dafa map karenge taake infinite scroll seamless chalay
  const logos = [
    { name: "Shopify Partners", icon: "🛍️", hoverColor: "#96bf48" },
    { name: "Amazon Selling Partner", icon: "📦", hoverColor: "#FF9900" },
    { name: "AWS Cloud", icon: "☁️", hoverColor: "#FF9900" },
    { name: "Vertex AI", icon: "🧠", hoverColor: "#4285F4" }, // Google Cloud skill boost context
    { name: "Stripe", icon: "💳", hoverColor: "#635BFF" },
    { name: "Enterprise Ready", icon: "🏢", hoverColor: "#96bf48" }
  ];

  return (
    <section className="trusted-section">
      <div className="trusted-container">
        <p className="trusted-heading">POWERING CATALOG TRANSFORMATION ACROSS TOP PLATFORMS</p>
        
        <div className="slider-wrapper">
          {/* Left and Right Fade overlays for premium look */}
          <div className="fade-left"></div>
          <div className="fade-right"></div>
          
          <div className="logos-track">
            {/* Original Set */}
            {logos.map((logo, index) => (
              <div 
                key={`org-${index}`} 
                className="logo-item"
                style={{"--hover-color": logo.hoverColor}}
              >
                <span className="logo-emoji">{logo.icon}</span>
                <span className="logo-text">{logo.name}</span>
              </div>
            ))}
            
            {/* Duplicated Set for Seamless Infinite Scroll */}
            {logos.map((logo, index) => (
              <div 
                key={`dup-${index}`} 
                className="logo-item"
                style={{"--hover-color": logo.hoverColor}}
              >
                <span className="logo-emoji">{logo.icon}</span>
                <span className="logo-text">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedLogos;