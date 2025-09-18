import React, { useState } from 'react';
import LandingPage from './LandingPage';
import PostProject from './PostProject';
import TeamMatch from './TeamMatch';
import ProjectDashboard from './ProjectDashboard';
import PaymentEscrow from './PaymentEscrow';
import { NotificationSystem } from './NotificationSystem';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { TrainingPortal } from './TrainingPortal';
import { ChatBot } from './ChatBot';

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState('landing');

  const renderView = () => {
    switch (currentView) {
      case 'post-project':
        return <PostProject />;
      case 'team-match':
        return <TeamMatch />;
      case 'dashboard':
        return <ProjectDashboard />;
      case 'payment':
        return <PaymentEscrow />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'training':
        return <TrainingPortal />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* <div className="fixed top-4 right-4 z-50">
        <NotificationSystem />
      </div> */}
      {renderView()}
      {/* Floating AI Chatbot - available on all pages */}
      <ChatBot isFloating={true} />
    </div>
  );
};

export default AppLayout;