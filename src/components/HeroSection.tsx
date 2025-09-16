import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AnimatedIconSection from './AnimatedIconSection';
import { buildAuthUrl, SIGNUP_ROUTE } from '@/utils/auth-routing';
import { useToast } from '@/hooks/use-toast';
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetEarlyAccess = () => {
    const authUrl = buildAuthUrl(SIGNUP_ROUTE, '/start');
    toast({
      title: 'Going to auth',
      description: `Going to auth: ${authUrl}`,
    });
    // Use window.location.href for full URLs instead of navigate()
    window.location.href = authUrl;
  };
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Assemble World-Class Teams in{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            60 Seconds
          </span>
          —Anywhere, Anytime.
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
          Instant, compliant, AI-matched teams for every urgent project. From startups to Fortune 500.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            onClick={handleGetEarlyAccess}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 text-lg shadow-xl"
          >
            Get Early Access
          </Button>
          <Button 
            onClick={() => {
              const element = document.getElementById('how-it-works');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            variant="outline" 
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-2xl px-8 py-4 text-lg"
          >
            See How It Works
          </Button>
        </div>

        <AnimatedIconSection />
      </div>
    </section>
  );
};

export default HeroSection;