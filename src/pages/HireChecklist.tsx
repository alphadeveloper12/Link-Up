import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OnboardingChecklist from '@/components/OnboardingChecklist';

export default function HireChecklist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, teamId } = location.state || {};

  console.log('Project ID:', projectId);
  console.log('Team ID:', teamId);

  if (!projectId || !teamId) {
    return <div className="p-6 text-red-500">Missing project or team data!</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Before you hire</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Complete these items to kick off with your selected team.
      </p>

      <OnboardingChecklist projectId={projectId} teamId={teamId} />

      <div className="mt-8 flex justify-end">
        <button
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
          onClick={() => navigate(`/projects`)}
        >
          Continue to Project
        </button>
      </div>
    </div>
  );
}
