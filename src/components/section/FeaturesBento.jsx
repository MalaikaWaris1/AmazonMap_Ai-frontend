import React, { useState, useEffect } from 'react';
import './FeaturesBento.css';

// Yahan se aap apne assets folder ki images import kar rahi hain
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.jpg';
import img3 from '../../assets/img3.jpg';
import img4 from '../../assets/img4.jpg';

const FeaturesBento = () => {
  const validationImages = [img1, img2, img3, img4];
  const [currentImg, setCurrentImg] = useState(0);

  // Smooth image change interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % validationImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [validationImages.length]);

  return (
    <section className="bento-section">
      <div className="bento-bg-glow shopify-glow"></div>
      <div className="bento-bg-glow amazon-glow"></div>

      <div className="bento-container">
        <div className="bento-header">
          <h2>Everything you need to <span>Scale</span></h2>
          <p>Powerful features packed in a beautifully simple, explainable AI pipeline.</p>
        </div>

        <div className="bento-grid">
          
          {/* Card 1: AI Data Mapping */}
          <div className="bento-card bento-wide card-mapping">
            <div className="card-content">
              <h3>AI Data Mapping</h3>
              <p>Intelligently map thousands of Shopify products to precise Amazon categories in seconds, not weeks.</p>
            </div>
            <div className="card-3d-visual">
              <div className="mapping-nodes float-layer-1">
                 <div className="node shopify-node">S</div>
                 <div className="line"></div>
                 <div className="node ai-node">AI</div>
                 <div className="line"></div>
                 <div className="node amazon-node">A</div>
              </div>
            </div>
          </div>

          {/* Card 2: Amazon Schema Validation */}
          <div className="bento-card bento-tall card-validation">
            <div className="card-content">
              <h3>Amazon Schema Validation</h3>
              <p>Pre-validate your listings against Amazon's strict requirements to guarantee zero upload errors.</p>
            </div>
            
            <div className="card-3d-visual validation-visual">
               {/* Flicker-free smooth slideshow */}
               <div className="validation-slideshow float-layer-1">
                 {validationImages.map((img, index) => (
                   <img 
                     key={index}
                     src={img} 
                     alt={`Validation Mockup ${index + 1}`} 
                     className={`validation-img ${index === currentImg ? 'active' : ''}`} 
                   />
                 ))}
               </div>
               
               {/* Glassmorphic SKU Validation Stack with 5 fields */}
               <div className="validation-stack float-layer-2">
                  <div className="validate-box glass-effect">
                    <span className="check-icon">✅</span> 
                    <span className="val-text">SKU Format Validated</span>
                  </div>
                  <div className="validate-box glass-effect">
                    <span className="check-icon">✅</span> 
                    <span className="val-text">Title Length Optimized</span>
                  </div>
                  <div className="validate-box glass-effect">
                    <span className="check-icon">✅</span> 
                    <span className="val-text">Required Attributes Mapped</span>
                  </div>
                  {/* 2 New Fields Added */}
                  <div className="validate-box glass-effect">
                    <span className="check-icon">✅</span> 
                    <span className="val-text">Category Restrictions Checked</span>
                  </div>
                  <div className="validate-box glass-effect">
                    <span className="check-icon">✅</span> 
                    <span className="val-text">Image Specifications Met</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Card 3: Rule Transformation */}
          <div className="bento-card card-rules">
            <div className="card-content">
              <h3>Rule Transformation</h3>
              <p>Apply custom logic to adjust pricing, titles, and inventory buffers automatically.</p>
            </div>
            <div className="card-3d-visual">
               <div className="gear-icon float-layer-2">⚙️</div>
            </div>
          </div>

          {/* Card 4: Live Sync Status */}
          <div className="bento-card card-sync">
            <div className="card-content">
              <h3>Live Sync Status</h3>
              <p>Real-time updates keep your Shopify and Amazon inventory perfectly in sync.</p>
            </div>
            <div className="card-3d-visual">
               <div className="sync-badge float-layer-2">
                 <span className="live-dot"></span> LIVE
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;