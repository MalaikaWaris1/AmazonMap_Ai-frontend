import React from 'react';
import Hero from '../components/section/Hero'; // Hero section yahan import kiya hai
import Footer from '../components/layout/Footer';
import TrustedLogos from '../components/section/TrustedLogos';
import Workflow from '../components/section/Workflow';
import FeaturesBento from '../components/section/FeaturesBento';
import Benefits from '../components/section/Benefits';
import FAQSection from '../components/section/FAQSection';
import MultiChannelSection from '../components/section/MultiChannelSection';
import TestimonialsSection from '../components/section/TestimonialsSection';
import IntegrationsSection from '../components/section/IntegrationsSection';

const Home = () => {
  return (
    <div>
      <Hero /> {/* Slider sirf Home page par chale ga */}
      <TrustedLogos/>
       <Workflow/>
       <FeaturesBento/>
       <Benefits/>
       <MultiChannelSection/>
       <IntegrationsSection/>
       <TestimonialsSection/>
       <FAQSection/>
      
    </div>
  );
};

export default Home;