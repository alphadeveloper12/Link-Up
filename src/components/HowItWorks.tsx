import React, { useState } from 'react';
import { FileText, Users, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostProjectModal from './PostProjectModal';
import { buildAuthUrl, SIGNUP_ROUTE } from '@/utils/auth-routing';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handlePostProject = () => {
    const authUrl = buildAuthUrl('/projects?open=post-project', 'client');
    window.location.href = authUrl;
  };

  const handleMatchWithTeam = () => {
    const authUrl = buildAuthUrl('/team-match', 'client');
    window.location.href = authUrl;
  };

  const handleStartWorking = () => {
    const authUrl = buildAuthUrl('/start');
    window.location.href = authUrl;
  };

  const steps = [
    {
      icon: FileText,
      title: "Post Project",
      description: "Describe your project needs in 60 seconds with our smart form"
    },
    {
      icon: Users,
      title: "Match with a Team",
      description: "AI instantly matches you with pre-vetted, ready-to-work teams"
    },
    {
      icon: Rocket,
      title: "Start Working Instantly",
      description: "One-click onboarding, NDAs signed, and your team starts immediately"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From project idea to working team in under 60 seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="text-center group cursor-pointer"
              onClick={
                index === 0 ? handlePostProject : 
                index === 1 ? handleMatchWithTeam : 
                handleStartWorking
              }
            >
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-6 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 w-fit mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <PostProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </section>
  );
};

export default HowItWorks;