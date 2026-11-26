import React from 'react';
// Placeholder — replace with a screenshot of the login / account screen.
import step1Image from '../../assets/img2.jpg';
import './Step1Auth.css';

export default function Step1Auth() {
  return (
    <section className="wk-section wk-step wk-step--auth" id="step-1">
      <div className="wk-container wk-step__grid">
        <div className="wk-step__copy">
          <p className="wk-eyebrow-num">01 — Account</p>
          <h2 className="wk-heading wk-step__title">User authentication</h2>
          <p className="wk-body">
            The system provides secure user registration and login. Each
            seller has an account through which Shopify connections,
            imported products, mappings, validation results, seller
            answers, Amazon submissions, and session history are
            associated.
          </p>
        </div>

        <div className="wk-step__media">
          <div className="wk-image-frame wk-step__image-frame">
            <img src={step1Image} alt="Seller account and authentication screen placeholder" />
          </div>
        </div>
      </div>
    </section>
  );
}
