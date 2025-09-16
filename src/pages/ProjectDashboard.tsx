import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectDashboard from '@/components/ProjectDashboard';

const ProjectDashboardPage: React.FC = () => {
  const { projectId } = useParams();
  
  // In a real app, you'd fetch project data based on projectId
  // For now, using mock data
  
  return <ProjectDashboard />;
};

export default ProjectDashboardPage;