import React from 'react';
// Yahan apni background image ka correct path dein
import bgImage from '../../assets/img3.jpg'; 
// Placeholder — replace with your own 3D render or dashboard capture.
import heroVisual from '../../assets/img2.jpg';
import './WorkingHero.css';

export default function WorkingHero() {
  return (
    <section 
      className="wk-section wk-hero"
      style={{
        /* Left side par 95% white cover hai, center mein 75%, right par 0% */
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 45%, rgba(255, 255, 255, 0) 100%), url(${bgImage})`
      }}
    >
      <div className="wk-container wk-hero-content">
        
        {/* <p className="wk-centered-eyebrow">How does AmazonMap work?</p> */}

        <div className="wk-hero__grid">
          <div className="wk-hero__copy">
            <h1 className="wk-hero__headline">
              How does AmazonMap work?
            </h1>
            <p className="wk-body wk-hero__sub">
              AmazonMap seamlessly syncs your Shopify listings to Amazon using a combined AI and rule-based engine, passing every product through a strict six-stage pipeline to ensure perfect mapping, validation, and publishing.
            </p>
            <div className="wk-hero__cta-row">
              <a href="#step-1" className="wk-hero__cta">See the pipeline</a>
              <span className="wk-hero__cta-note">6 stages · fully auditable</span>
            </div>
          </div>

          <div className="wk-hero__media">
            <div className="wk-hero__video">
              <img
                src={heroVisual}
                alt="How It Works video preview"
                className="wk-hero__video-poster"
              />
              <div className="wk-hero__video-glass">
                <button className="wk-hero__play" aria-label="Play walkthrough video">
                  <span className="wk-hero__play-triangle" />
                </button>
                <span className="wk-hero__video-label">Watch the 3-minute walkthrough</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated Shape Divider (Wave) bilkul bottom par */}
      <div className="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="#FF9900" /* Amazon Orange */
            fillOpacity="1" 
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,170.7C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
          </path>
        </svg>
      </div>
    </section>
  );
}