import React from 'react';
// Yahan apne dashboard ki image lagayen
import step2Image from '../../assets/img2.jpg';
// Yahan apne Sellbrite jese textured blob PNG ka path dein
// import blobTexture from '../../assets/blob-texture.png'; 
import './Step2Shopify.css';

export default function Step2Shopify() {
  return (
    <section className="wk-section wk-step wk-step--shopify wk-step--reverse" id="step-2">
      
      {/* Naya Image Background Texture (Bilkul Sellbrite jaisa) */}
      {/* <img src={blobTexture} alt="" className="wk-texture-blob" aria-hidden="true" /> */}
{/* Naya Left Side Abstract Blob */}
     <div className="wk-abstract-blob"></div>
      <div className="wk-abstract-blob-2"></div>
      {/* Mobile par split karne ke liye special class add ki hai */}
      <div className="wk-container wk-step__grid wk-mobile-split">
        
        {/* TEXT SECTION (Zyada text ke liye khuli jagah) */}
        <div className="wk-step__copy">
          <p className="wk-eyebrow-num">02 — Shopify</p>
          <h2 className="wk-heading wk-step__title">Connection &amp; data cleaning</h2>
          <p className="wk-body">
            Products are pulled through the Shopify Admin GraphQL API
            (<code>GET /admin/api/{'{api_version}'}/products.json</code>) and
            passed through a cleaning stage built on Cheerio, Lodash and
            Pydantic before anything touches the mapping layer.
          </p>
          <ul className="wk-step__bullets">
            <li>Remove whitespace and normalize formatting</li>
            <li>Standardize units of measurement</li>
            <li>Detect missing values</li>
            <li>Find duplicates and reconcile SKUs</li>
            <li>Preserve original source values for traceability</li>
          </ul>
          <p className="wk-step__flow-text">
            Results surface in a Data-Health Dashboard so sellers can see
            exactly what was changed and why.
          </p>
        </div>

        {/* IMAGE SECTION */}
        <div className="wk-step__media">
          <div className="wk-image-frame wk-step__image-frame">
            <img src={step2Image} alt="Data-Health Dashboard showing cleaned Shopify product data" />
          </div>
        </div>

      </div>
    </section>
  );
}