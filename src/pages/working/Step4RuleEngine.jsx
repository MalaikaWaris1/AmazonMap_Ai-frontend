import React from 'react';
// Placeholder — replace with a visual of the Rule Engine's JSON output.
import step4Image from '../../assets/img2.jpg';
import './Step4RuleEngine.css';

export default function Step4RuleEngine() {
  return (
    <section className="wk-section wk-step wk-step--rules wk-step--reverse" id="step-4">
      
      {/* CSS Blobs added here */}
      <div className="wk-abstract-blob"></div>
      <div className="wk-abstract-blob-2"></div>

      {/* wk-mobile-split class added for mobile text/image splitting */}
      <div className="wk-container wk-step__grid wk-mobile-split">
        
        {/* Text Section (Mobile par pehle aayega) */}
        <div className="wk-step__copy">
          <p className="wk-eyebrow-num">04 — Rule Engine</p>
          <h2 className="wk-heading wk-step__title">
            Deterministic transformation &amp; JSON construction
          </h2>
          <p className="wk-body">
            Once the AI layer has identified what each field means, the
            Rule Engine takes over. It places approved values into the
            correct Amazon JSON paths using fixed, predictable logic.
          </p>
          <ul className="wk-step__bullets">
            <li>Map approved attributes to their Amazon fields</li>
            <li>Convert data types</li>
            <li>Apply predefined formatting rules</li>
            <li>Normalize controlled values</li>
            <li>Remove unsupported fields</li>
            <li>Prevent incorrect insertions</li>
          </ul>
          <p className="wk-step__flow-text">
            Shopify data → AI understands meaning → Rule Engine transforms
            structure → Amazon JSON.
          </p>
        </div>

        {/* Image Section (Mobile par neeche aayega) */}
        <div className="wk-step__media">
          <div className="wk-image-frame wk-step__image-frame">
            <img src={step4Image} alt="Rule Engine constructing the Amazon JSON payload" />
          </div>
        </div>

      </div>
    </section>
  );
}