import React, { useState, useEffect } from 'react';
import './Workflow.css';

// Aapki imported images
import step1Img from '../../assets/img1.jpg';
import step2Img from '../../assets/img2.jpg';
import step3Img from '../../assets/img3.jpg';
import step4Img from '../../assets/img4.jpg';
import step5Img from '../../assets/img5.jpg';
import step6Img from '../../assets/img6.jpg';

const Workflow = () => {
  const [activeStep, setActiveStep] = useState(0);

  // TABDEELI: bgImage mein imported variables laga diye aur icon wapas le aaye
  const steps = [
    { id: '01', title: 'Connect Shopify', desc: 'Securely link your Shopify store with just one click.', icon: '🛍️', theme: '#4a7c1b', bgImage: step1Img },
    { id: '02', title: 'Import Products', desc: 'Auto-fetch your entire product catalog, variants, and images.', icon: '📥', theme: '#1a56db', bgImage: step2Img },
    { id: '03', title: 'AI Mapping', desc: 'Our AI engine intelligently maps Shopify fields to Amazon schema.', icon: '🧠', theme: '#4f46e5', bgImage: step3Img },
    { id: '04', title: 'Transform & Validate', desc: 'Apply custom rules and validate data to ensure zero errors.', icon: '⚙️', theme: '#e11d48', bgImage: step4Img },
    { id: '05', title: 'Seller Review', desc: 'Human-in-the-loop review for 100% accuracy before publishing.', icon: '👀', theme: '#7c3aed', bgImage: step5Img },
    { id: '06', title: 'Publish to Amazon', desc: 'Go live on Amazon and keep inventory synced automatically.', icon: '🚀', theme: '#cc7a00', bgImage: step6Img },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section className="workflow-section">
      <div className="workflow-container">
        <div className="workflow-header">
          <h2>How AmazonMap<span>Ai</span> Works</h2>
          <p>An explainable, 6-step AI pipeline to automate your catalog synchronization.</p>
        </div>

        <div className="workflow-content">
          <div className="steps-timeline">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`step-item ${activeStep === index ? 'active' : ''}`}
                onClick={() => setActiveStep(index)}
              >
                <div className="step-number" style={activeStep === index ? { backgroundColor: step.theme, color: '#fff', borderColor: step.theme } : {}}>
                  {step.id}
                </div>
                <div className="step-text">
                  <h3 style={activeStep === index ? { color: step.theme } : {}}>{step.title}</h3>
                  {activeStep === index && <p className="step-desc">{step.desc}</p>}
                </div>
              </div>
            ))}
            <div className="timeline-line">
               <div 
                  className="timeline-progress" 
                  style={{ height: `${(activeStep / (steps.length - 1)) * 100}%`, backgroundColor: steps[activeStep].theme }}
               ></div>
            </div>
          </div>

          <div className="workflow-3d-showcase">
            <div className="scene-3d">
              <div className="glow-effect" style={{ backgroundColor: steps[activeStep].theme }}></div>
              <div className="dashboard-3d">
                
                {/* Background images ab aapki imported images se aayengi */}
                {steps.map((step, index) => (
                  <div 
                    key={`bg-${index}`}
                    className={`showcase-bg-image ${activeStep === index ? 'active-bg' : ''}`}
                    style={{ backgroundImage: `url(${step.bgImage})` }}
                  ></div>
                ))}

                <div className="dashboard-header" style={{ position: 'relative', zIndex: 2 }}>
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <div className="address-bar">app.amazonmap.ai/workflow</div>
                </div>
                
                <div className="dashboard-body" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="dashboard-step-image-container">
                     {/* TABDEELI: img tag ko hata kar wapas icon (emoji) laga diya hai */}
                     <span className="dashboard-step-emoji">{steps[activeStep].icon}</span>
                  </div>
                  <h3 className="dashboard-step-title">{steps[activeStep].title}</h3>
                  <div className="fake-ui-lines">
                    <div className="ui-line skeleton" style={{ width: '80%' }}></div>
                    <div className="ui-line skeleton" style={{ width: '60%' }}></div>
                    <div className="ui-line skeleton" style={{ width: '90%' }}></div>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: `${steps[activeStep].theme}15`, color: steps[activeStep].theme, borderColor: steps[activeStep].theme }}>
                    Status: Processing...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;