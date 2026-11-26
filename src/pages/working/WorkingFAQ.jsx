import React from 'react';
import './WorkingFAQ.css';

const FAQ_ITEMS = [
  {
    question: 'How is my Shopify and Amazon data secured?',
    answer:
      "Shopify and Amazon credentials are stored per seller account and never shared across sellers. Every sync, mapping and submission is tied to your account's session history, so you can trace exactly what happened and when.",
  },
  {
    question: 'How fast is the sync between Shopify and Amazon?',
    answer:
      'Cleaning, mapping and rule transformation run in seconds per product. Overall speed depends on validation — listings that need a seller answer move as fast as you respond to the chatbot.',
  },
  {
    question: 'What happens when Amazon rejects a listing?',
    answer:
      'Rejected listings enter the Error Repair Loop. The system attempts correction or re-derives the field from the original Shopify data; if it can\u2019t resolve it alone, it asks you a direct question before resubmitting.',
  },
  {
    question: 'How accurate is the AI mapping?',
    answer:
      'Qwen with QLoRA is scoped to semantic understanding only — matching meaning between Shopify and Amazon fields. It never freely writes the final JSON; the deterministic Rule Engine builds the actual structure, which keeps output consistent and checkable.',
  },
];

export default function WorkingFAQ() {
  return (
    <section className="wk-section wk-faq">
      <div className="wk-container">
        <h2 className="wk-faq__heading">
          Still not sure? Read some frequently asked questions.
        </h2>

        {/* Center vertical line container */}
        <div className="wk-faq__grid-wrapper">
          <div className="wk-faq__vertical-line"></div>

          <div className="wk-faq__grid">
            {FAQ_ITEMS.map((item, index) => (
              <div className="wk-faq__item" key={index}>
                {/* Question ke sath circle indicator */}
                <div className="wk-faq__indicator"></div>
                <div className="wk-faq__content">
                  <p className="wk-faq__question">{item.question}</p>
                  <p className="wk-faq__answer">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}