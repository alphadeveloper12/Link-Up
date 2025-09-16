import React from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import FeatureCards from './FeatureCards';
import Testimonials from './Testimonials';
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* <Navigation /> */}
      <HeroSection />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="get-started">
        <FeatureCards />
      </div>
      <Testimonials />
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            LinkUp
          </div>
          <p className="text-gray-400 mb-8">
            Assemble world-class teams in 60 seconds—anywhere, anytime.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;