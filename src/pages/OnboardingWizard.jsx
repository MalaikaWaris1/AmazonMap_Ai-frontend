import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './OnboardingWizard.css';

const STEPS = ['Account', 'Shopify', 'Amazon', 'Complete'];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Account States
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  // Step 2 & 3: Connection States with URLs
  const [shopifyUrl, setShopifyUrl] = useState('');
  const [isShopifyConnecting, setIsShopifyConnecting] = useState(false);
  const [isShopifyConnected, setIsShopifyConnected] = useState(false);

  const [amazonSellerId, setAmazonSellerId] = useState('');
  const [isAmazonConnecting, setIsAmazonConnecting] = useState(false);
  const [isAmazonConnected, setIsAmazonConnected] = useState(false);

  // Step 4: Catalogs States
  

  

  const handleNext = () => { if (currentStep < 5) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // Simulate Shopify OAuth Flow
  const handleShopifyConnect = () => {
    if (!shopifyUrl.trim()) return;
    setIsShopifyConnecting(true);
    // Fake 1.5s delay to simulate redirecting to Shopify and back
    setTimeout(() => {
      setIsShopifyConnecting(false);
      setIsShopifyConnected(true);
    }, 1500);
  };

  // Simulate Amazon OAuth Flow
  const handleAmazonConnect = () => {
    if (!amazonSellerId.trim()) return;
    setIsAmazonConnecting(true);
    setTimeout(() => {
      setIsAmazonConnecting(false);
      setIsAmazonConnected(true);
    }, 1500);
  };



  const finishOnboarding = () => {
    localStorage.setItem('amazonMap_user', JSON.stringify({ 
      name: sellerName, 
      email: sellerEmail,
      shopify: shopifyUrl,
      amazon: amazonSellerId
    }));
    navigate('/dashboard');
  };

  const isNextDisabled = () => {
    if (currentStep === 1 && (!sellerName.trim() || !sellerEmail.trim())) return true;
    if (currentStep === 2 && !isShopifyConnected) return true;
    if (currentStep === 3 && !isAmazonConnected) return true;
   
    return false;
  };

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-container">
        
        {/* Stepper Header */}
        <div className="stepper-header">
          {STEPS.map((stepName, index) => {
            const stepNum = index + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <React.Fragment key={stepName}>
                <div className="stepper-item">
                  <div className={`step-circle ${isActive || isCompleted ? 'active' : ''}`}>
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span className={`step-label ${isActive ? 'active-text' : ''}`}>{stepName}</span>
                </div>
                {stepNum < 5 && <div className={`step-line ${isCompleted ? 'line-active' : ''}`}></div>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="step-content-card">
          
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="step-body">
              <h2>Welcome to AmazonMap AI!</h2>
              <p>Let's set up your workspace before we start syncing products.</p>
              <div className="setup-form">
                <div className="input-group">
                  <label>Seller Profile Name</label>
                  <input type="text" placeholder="e.g. Talar Ali" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Work Email Address</label>
                  <input type="email" placeholder="name@company.com" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Shopify Integration */}
          {currentStep === 2 && (
            <div className="step-body text-center">
              <h2>Connect your Shopify Store</h2>
              <p>Authorize access to your Shopify catalog via Admin GraphQL API.</p>
              
              {!isShopifyConnected ? (
                isShopifyConnecting ? (
                  <div className="loading-state">
                    <div className="spinner shopify-spinner"></div>
                    <p>Redirecting to Shopify for Authorization...</p>
                  </div>
                ) : (
                  <div className="setup-form mx-auto">
                    <div className="input-group text-left">
                      <label>Shopify Store URL</label>
                      <div className="url-input-wrapper">
                        <input 
                          type="text" 
                          placeholder="your-store-name" 
                          value={shopifyUrl}
                          onChange={(e) => setShopifyUrl(e.target.value)}
                        />
                        <span className="url-suffix">.myshopify.com</span>
                      </div>
                    </div>
                    <button className="btn-connect shopify-btn" onClick={handleShopifyConnect}>
                      🛍️ Connect Shopify
                    </button>
                  </div>
                )
              ) : (
                <div className="connected-profile-card">
                  <div className="store-avatar shopify-bg">S</div>
                  <div className="store-info text-left">
                    <h4>{shopifyUrl}.myshopify.com</h4>
                    <span className="status-green">● Connected via GraphQL API</span>
                  </div>
                  <button className="btn-disconnect" onClick={() => setIsShopifyConnected(false)}>Disconnect</button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Amazon Integration */}
          {currentStep === 3 && (
            <div className="step-body text-center">
              <h2>Connect Amazon Seller Central</h2>
              <p>Link your Amazon SP-API to allow automated publishing.</p>
              
              {!isAmazonConnected ? (
                isAmazonConnecting ? (
                  <div className="loading-state">
                    <div className="spinner amazon-spinner"></div>
                    <p>Verifying Amazon SP-API Credentials...</p>
                  </div>
                ) : (
                  <div className="setup-form mx-auto">
                    <div className="input-group text-left">
                      <label>Amazon Seller ID / Merchant Token</label>
                      <input 
                        type="text" 
                        placeholder="e.g. A1B2C3D4E5F6G7" 
                        value={amazonSellerId}
                        onChange={(e) => setAmazonSellerId(e.target.value)}
                      />
                    </div>
                    <button className="btn-connect amazon-btn" onClick={handleAmazonConnect}>
                      📦 Connect Amazon SP-API
                    </button>
                  </div>
                )
              ) : (
                <div className="connected-profile-card">
                  <div className="store-avatar amazon-bg">A</div>
                  <div className="store-info text-left">
                    <h4>Seller ID: {amazonSellerId}</h4>
                    <span className="status-green">● SP-API Link Active</span>
                  </div>
                  <button className="btn-disconnect" onClick={() => setIsAmazonConnected(false)}>Disconnect</button>
                </div>
              )}
            </div>
          )}

         
          

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="step-body text-center">
              <h2>🎉 All Set, {sellerName || 'Seller'}!</h2>
              <p>Your accounts ({shopifyUrl} & Amazon) are connected and catalogs are queued.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="stepper-footer">
          {currentStep > 1 && currentStep < 5 && <button className="btn-secondary" onClick={handleBack}>Back</button>}
          {currentStep < 5 ? (
            <button className="btn-primary" onClick={handleNext} disabled={isNextDisabled()} style={{ marginLeft: 'auto' }}>Continue</button>
          ) : (
            <button className="btn-primary" onClick={finishOnboarding} style={{ margin: '0 auto', display: 'block' }}>Go to Dashboard</button>
          )}
        </div>
      </div>
    </div>
  );
}