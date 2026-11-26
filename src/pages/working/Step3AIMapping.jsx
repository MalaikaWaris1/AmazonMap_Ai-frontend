import React from 'react';
// Placeholder — replace with a visual of the semantic mapping output.
import step3Image from '../../assets/img2.jpg';
import './Step3AIMapping.css';

export default function Step3AIMapping() {
  return (
    <section className="wk-section wk-step wk-step--ai" id="step-3">
      <div className="wk-container wk-step__grid">
        <div className="wk-step__copy">
          <p className="wk-eyebrow-num">03 — AI Mapping</p>
          <h2 className="wk-heading wk-step__title">Qwen + QLoRA semantic mapping</h2>
          <p className="wk-body">
            A fine-tuned Qwen model, adapted with QLoRA, identifies the
            semantic relationship between Shopify product information and
            Amazon's attribute schema — matching meaning, not just field
            names.
          </p>
          <p className="wk-step__flow-text">
            The model handles semantic understanding only. It does not
            freely generate the final Amazon JSON structure — that
            responsibility belongs to the Rule Engine in the next stage.
          </p>
        </div>

        <div className="wk-step__media">
          <div className="wk-image-frame wk-step__image-frame">
            <img src={step3Image} alt="Qwen QLoRA semantic mapping visualization placeholder" />
          </div>
        </div>
      </div>
    </section>
  );
}
