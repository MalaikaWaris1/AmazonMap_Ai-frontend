import React, { useState, useEffect } from 'react';
import './Hero.css';

// Apne assets folder mein ye 5 images rakh lijiye
import bg1 from '../../assets/img6.jpg';
import bg2 from '../../assets/img1.jpg';
import bg3 from '../../assets/img3.jpg';
import bg4 from '../../assets/img4.jpg';
import bg5 from '../../assets/img5.jpg';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [bg1, bg2, bg3, bg4, bg5];

  // 4 seconds ke baad smoothly image change karne ka logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero-section">
      {/* Background Slider */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide})` }}
        ></div>
      ))}

      {/* Gradient Overlay left side text readability ke liye */}
      <div className="hero-overlay"></div>

      {/* Left Aligned Content */}
      <div className="hero-content">
        <div className="badge">
          <span className="badge-icon">✦</span> AI-powered catalog operations
        </div>
        
        <h1>
          Turn Shopify Products <br />
          into Amazon Listings <br />
          with AI
        </h1>
        
        <p>
          Understand, map, transform, validate, review and publish your catalog through one explainable workflow.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary1">
            Start demo workflow <span className="arrow">→</span>
          </button>
          <button className="btn-secondary">
            Explore dashboard
          </button>
        </div>
      </div>

      {/* Slide Indicators (...) */}
      <div className="slide-indicators">
        {slides.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>

      {/* Animated Shape Divider (Wave) bilkul bottom par */}
     {/* Animated Shape Divider (Wave) bilkul bottom par */}
      <div className="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="#FF9900" /* Yahan Amazon Orange color diya gaya hai */
            fillOpacity="1" 
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,170.7C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
          </path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;