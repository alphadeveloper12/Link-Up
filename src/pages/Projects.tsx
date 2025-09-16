import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
// import Navigation from '@/components/Navigation';
import { NewProjectButton } from '@/components/NewProjectButton';

const Projects = () => {
  const navigate = useNavigate();
  const { loading, projects, error, refresh } = useProjects();

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}
      <div className="p-6">Loading your projects…</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}
      <div className="p-6 text-red-600">Error: {error}</div>
    </div>
  );

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navigation /> */}
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">My Projects</h1>
          <p>No projects yet. Create your first one.</p>
          <NewProjectButton onCreated={refresh} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">My Projects</h1>
        <NewProjectButton onCreated={refresh} />
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(p => (
            <div 
              key={p.id} 
              className="rounded-xl border p-4 bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{p.title}</h2>
                <span className="text-xs rounded bg-gray-100 px-2 py-1">
                  {p.status ?? 'unspecified'}
                </span>
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-gray-600">{p.description}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                Created {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;