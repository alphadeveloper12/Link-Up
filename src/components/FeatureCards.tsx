import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, CreditCard, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeatureCards: React.FC = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Shield,
      title: "One-click onboarding & NDAs",
      description: "Instant legal compliance with drag-and-drop e-signatures"
    },
    {
      icon: Users,
      title: "Pre-vetted high trust global teams",
      description: "Rigorously screened professionals ready to deliver excellence"
    },
    {
      icon: CreditCard,
      title: "Escrow & instant payments",
      description: "Secure milestone-based payments with automated escrow protection"
    },
    {
      icon: Globe,
      title: "Secure-compliant, global-ready",
      description: "GDPR compliant, enterprise-grade security across all regions"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to scale your business with confidence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => window.location.href = '/start'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 text-lg shadow-xl"
          >
            Get Early Access
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;