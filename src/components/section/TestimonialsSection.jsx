import React from 'react';
import './TestimonialsSection.css';

// Yahan aap apne logos import kar sakti hain (ya direct image path de sakti hain)
import shopifyLogo from '../../assets/shopify-logo.png';
import amazonLogo from '../../assets/amazon-logo.png';
import g2Logo from '../../assets/g2-logo.png';
import capterraLogo from '../../assets/capterra-logo.png';
import getappLogo from '../../assets/getapp-logo.png';

const TestimonialsSection = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        
        {/* Header */}
        <h3 className="testimonials-heading">
          The top-rated AI solution for Shopify & Amazon sellers
        </h3>

        {/* Clean Logo & Reviews Row (No background cards) */}
        <div className="ratings-flex-row">
          
          {/* 1. Shopify */}
          <div className="rating-col">
            <div className="logo-container">
              <img src={shopifyLogo} alt="Shopify" className="platform-logo" />
              <span className="logo-placeholder-text shopify-text">shopify</span>
            </div>
            <div className="stars">★★★★★</div>
            <span className="review-count">100+ Reviews</span>
          </div>

          {/* 2. Amazon APN */}
          <div className="rating-col">
            <div className="logo-container">
              <img src={amazonLogo} alt="Amazon" className="platform-logo" />
              <span className="logo-placeholder-text amazon-text">AMAZON APN</span>
            </div>
            <div className="stars">★★★★★</div>
            <span className="review-count">60+ Reviews</span>
          </div>

          {/* 3. G2 Crowd */}
          <div className="rating-col">
            <div className="logo-container">
              <img src={g2Logo} alt="G2 Crowd" className="platform-logo" />
              <span className="logo-placeholder-text g2-text">G2 CROWD</span>
            </div>
            <div className="stars">★★★★☆</div>
            <span className="review-count">20+ Reviews</span>
          </div>

          {/* 4. Capterra */}
          <div className="rating-col">
            <div className="logo-container">
              <img src={capterraLogo} alt="Capterra" className="platform-logo" />
              <span className="logo-placeholder-text capterra-text">Capterra</span>
            </div>
            <div className="stars">★★★★★</div>
            <span className="review-count">65+ Reviews</span>
          </div>

          {/* 5. GetApp */}
          <div className="rating-col">
            <div className="logo-container">
              <img src={getappLogo} alt="GetApp" className="platform-logo" />
              <span className="logo-placeholder-text getapp-text">GetApp</span>
            </div>
            <div className="stars">★★★★☆</div>
            <span className="review-count">65+ Reviews</span>
          </div>

        </div>

        <div className="divider-line"></div>

        {/* Featured Testimonial Quote */}
        <div className="testimonial-quote-box">
          <p className="quote-text">
            “Integrating Qwen-QLora AI for our Shopify to Amazon sync has saved us countless hours. Zero schema errors and flawless real-time inventory matching!”
          </p>
          <div className="quote-author">– Sarah Jenkins, Head of E-commerce at NovaBrand</div>
          <div className="stars large-stars">★★★★★</div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;