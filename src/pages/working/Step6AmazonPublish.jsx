import React from 'react';
// Placeholder — replace with a screenshot of the publish / error-repair queue.
import step6Image from '../../assets/img2.jpg';
import './Step6AmazonPublish.css';

export default function Step6AmazonPublish() {
  return (
    <section className="wk-section wk-step wk-step--amazon wk-step--reverse" id="step-6">
      
      {/* Abstract Blobs added here */}
      <div className="wk-abstract-blob"></div>
      <div className="wk-abstract-blob-2"></div>

      {/* wk-mobile-split added for mobile text/image splitting */}
      <div className="wk-container wk-step__grid wk-mobile-split">
        
        {/* Text Section (Mobile par pehle aayega) */}
        <div className="wk-step__copy">
          <p className="wk-eyebrow-num">06 — Amazon</p>
          <h2 className="wk-heading wk-step__title">Publish &amp; the error repair loop</h2>
          <p className="wk-body">
            Valid products are submitted through the Amazon SP-API, with
            all internal metadata stripped out before submission.
          </p>
          <p className="wk-body">
            Listings Amazon rejects don't dead-end — they enter an Error
            Repair Loop for correction, re-derivation from the original
            Shopify data, or a targeted question back to the seller, then
            re-enter the pipeline for resubmission.
          </p>
        </div>

        {/* Image Section (Mobile par neeche aayega) */}
        <div className="wk-step__media">
          <div className="wk-image-frame wk-step__image-frame">
            <img src={step6Image} alt="Amazon publish queue with the error repair loop" />
          </div>
        </div>

      </div>
    </section>
  );
}