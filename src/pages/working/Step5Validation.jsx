import React from 'react';
// Placeholder — replace with a visual of the seller-facing question flow.
import step5Image from '../../assets/img2.jpg';
import './Step5Validation.css';

export default function Step5Validation() {
  return (
    <section className="wk-section wk-step wk-step--validation" id="step-5">
      <div className="wk-container wk-step__grid">
        <div className="wk-step__copy">
          <p className="wk-eyebrow-num">05 — Validation</p>
          <h2 className="wk-heading wk-step__title">Validation &amp; seller review</h2>
          <p className="wk-body">
            Pydantic models and custom business rules check every field,
            type and format against Amazon's requirements before a listing
            is allowed to proceed.
          </p>
          <p className="wk-body">
            When validation finds a missing or ambiguous field, a
            rule-based chatbot selects an appropriate question template and
            asks the seller directly. The seller's answer updates the
            product, and validation runs again — until the listing passes
            clean.
          </p>
        </div>

        <div className="wk-step__media">
          <div className="wk-image-frame wk-step__image-frame">
            <img src={step5Image} alt="Seller review chatbot resolving a validation question" />
          </div>
        </div>
      </div>
    </section>
  );
}
