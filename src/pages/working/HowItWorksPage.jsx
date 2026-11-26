import React from 'react';
import WorkingHero from './WorkingHero';
import WorkingAnimatedFlow from './WorkingAnimatedFlow';
import Step1Auth from './Step1Auth';
import Step2Shopify from './Step2Shopify';
import Step3AIMapping from './Step3AIMapping';
import Step4RuleEngine from './Step4RuleEngine';
import Step5Validation from './Step5Validation';
import Step6AmazonPublish from './Step6AmazonPublish';
import WorkingFAQ from './WorkingFAQ';

export default function HowItWorksPage() {
  return (
    <main className="how-it-works-page">
      <WorkingHero />
      <WorkingAnimatedFlow />
      <Step1Auth />
      <Step2Shopify />
      <Step3AIMapping />
      <Step4RuleEngine />
      <Step5Validation />
      <Step6AmazonPublish />
      <WorkingFAQ />
    </main>
  );
}
