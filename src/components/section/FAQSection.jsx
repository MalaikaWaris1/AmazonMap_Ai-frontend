import React, { useState } from 'react';
import './FAQSection.css';

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  // View More / View Less toggle state
  const [showAll, setShowAll] = useState(false);

  // Full FAQ list (Pehle 4 default dikhenge, baqi "View More" par)
  const faqs = [
    {
      question: "How does the AI map Shopify products to Amazon categories?",
      answer: "Our explainable AI engine analyzes your Shopify product titles, descriptions, and attributes in seconds, automatically matching them to the most precise Amazon category nodes with high accuracy."
    },
    {
      question: "Will this prevent Amazon schema and upload errors?",
      answer: "Yes! Our built-in Amazon Schema Validator pre-checks all your listings against Amazon's strict requirements and formatting rules before publishing, guaranteeing zero upload errors."
    },
    {
      question: "How does real-time inventory syncing work?",
      answer: "The platform maintains a continuous, synchronized data flow between your Shopify store and Amazon. Whenever an item is sold on either channel, stock levels update instantly across both platforms to prevent overselling."
    },
    {
      question: "Can I set custom pricing and title rules for Amazon?",
      answer: "Absolutely. Our Rule Transformation feature allows you to apply custom logic to automatically adjust pricing multipliers, optimize product titles for Amazon SEO, and set inventory buffers."
    },
    {
      question: "How long does it take to sync thousands of products?",
      answer: "What traditionally takes weeks of manual mapping is completed in just minutes. You can bulk-process thousands of products seamlessly through our automated pipeline."
    },
    {
      question: "Do I need technical or coding knowledge to use this?",
      answer: "Not at all. The pipeline is designed to be beautifully simple and plug-and-play. Just connect your Shopify store, and our AI guides you through the rest."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Agar showAll false hai toh sirf pehle 4 FAQs dikhayega
  const displayedFaqs = showAll ? faqs : faqs.slice(0, 4);

  return (
    <section className="faq-section">
      <div className="faq-container">
        
        {/* Left Column: Alag Background Color wala box */}
        <div className="faq-left-card">
          <div className="faq-tag">SUPPORT & HELP</div>
          <h2 className="faq-title">
            Questions? We've Got <span>Answers.</span>
          </h2>
          <p className="faq-description">
            Get clear answers about our AI-powered Shopify to Amazon pipeline, from mapping to real-time syncing.
          </p>
        </div>

        {/* Right Column: Accordion Questions */}
        <div className="faq-right">
          <div className="faq-list">
            {displayedFaqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => toggleAccordion(index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <span className="faq-icon">{activeIndex === index ? '−' : '+'}</span>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Functional View More / View Less Button */}
          <button 
            className="faq-view-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'View Less' : 'View More'}
          </button>

          {/* Bottom Support Card */}
          <div className="faq-support-bar">
            <div className="support-left">
              <div className="support-icon">🎧</div>
              <div className="support-text">
                <span className="support-label">Email Support</span>
                <span className="support-email">support@ai-amazonsync.com</span>
              </div>
            </div>
            <div className="support-badges">
              <span className="badge-pill shopify-badge">Shopify Verified</span>
              <span className="badge-pill amazon-badge">APN Partner</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FAQSection;