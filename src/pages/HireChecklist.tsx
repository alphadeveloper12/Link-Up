import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OnboardingChecklist from '@/components/OnboardingChecklist';

export default function HireChecklist() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const q = new URLSearchParams(useLocation().search);
  const projectName = q.get('project') || 'New Project';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Before you hire</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Complete these items to kick off with your selected team.
      </p>

      <OnboardingChecklist />

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