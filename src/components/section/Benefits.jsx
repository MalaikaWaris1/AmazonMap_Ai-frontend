import React, { useState, useEffect, useRef } from 'react';
import './Benefits.css';

// Yahan apni background image import karein
import bgImage from '../../assets/benefits-bg.jpg'; 

// Animated Number Component
const AnimatedNumber = ({ target, isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Agar section visible nahi hai, toh 0 hi dikhaye, jab visible ho tabhi start ho
    if (isVisible) {
      let start = 0;
      const duration = 2000; // 2 seconds animation
      const stepTime = Math.abs(Math.floor(duration / target)); 
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= target) {
          clearInterval(timer);
          setCount(target);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [isVisible, target]);

  return <>{count}</>;
};

const Benefits = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Ref ko ab section ke bajaye directly cards walay grid par lagayenge
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Ek dafa chalne ke baad dobara na chalay
        }
      },
      // Threshold 0.5 ka matlab hai jab cards 50% screen par aa jayenge TAB animation start hogi, us se pehle nahi.
      { threshold: 0.5 } 
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) observer.disconnect();
    };
  }, []);

  return (
    <section 
      className="benefits-section" 
      style={{ backgroundImage: `url(${bgImage})` }} 
    >
      <div className="benefits-overlay"></div>

      <div className="benefits-container">
        
        {/* Top Header Section */}
        <div className="benefits-header">
          <div className="expertise-badge">TRANSFORM YOUR AMAZON BUSINESS</div>
          <h2>Why Choose Us?</h2>
          <p>AI-powered Amazon Seller Solutions for maximum efficiency and success.</p>
        </div>

        {/* Yahan 'ref={gridRef}' lagaya hai, taake sirf cards dekhne par animation chale */}
        <div className="benefits-grid" ref={gridRef}>
          
          {/* Card 1: Time Saved */}
          <div className="benefit-card light-glass-card">
            <div className="card-top">
              <div className="card-icon">⏱️</div>
              <h3>Save 50+ Hours a Week</h3>
              <p>Automated listing creation, order processing, and analysis. Stop manual data entry.</p>
            </div>
            <div className="card-bottom">
              <div className="stat-value">
                <AnimatedNumber target={50} isVisible={isVisible} />
                <span className="plus">+</span>
              </div>
              <div className="stat-label">HOURS SAVED</div>
            </div>
          </div>

          {/* Card 2: Zero Errors (Center Focus) */}
          <div className="benefit-card dark-glass-card">
            <div className="card-top">
              <div className="ai-brain-container">
                <div className="ai-brain">🧠</div>
              </div>
              <h3>Zero Schema Errors</h3>
              <p>Perfect structured data results in increased listing visibility and successful uploads.</p>
            </div>
            
            <ul className="benefit-list">
               <li><span className="check">✅</span> Prevent rejected listings</li>
               <li><span className="check">✅</span> Strict Amazon compliance</li>
               <li><span className="check">✅</span> Auto attribute mapping</li>
            </ul>
          </div>

          {/* Card 3: Real-Time Sync */}
          <div className="benefit-card light-glass-card">
            <div className="card-top">
              <div className="card-icon sync-icon">🔄</div>
              <h3>Real-Time Syncing</h3>
              <p>Synchronized data flow between Shopify and Amazon ensures you never oversell.</p>
            </div>
            <div className="card-bottom">
              <div className="stat-value">
                <AnimatedNumber target={100} isVisible={isVisible} />
                <span className="percent">%</span>
              </div>
              <div className="stat-label">LIVE INVENTORY MATCH</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Benefits;