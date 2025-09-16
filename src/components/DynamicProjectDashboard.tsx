import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

type DashboardRow = {
  id: string;
  title: string;
  description: string | null;
  skills_required: string[];
  created_at: string;
  teams?: Array<{ team_id: string; status: string; selected_at: string | null }>;
};

export default function DynamicProjectDashboard({ dashboard }: { dashboard: DashboardRow | null }) {
  // Early return if dashboard is not loaded yet
  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  const [milestones, setMilestones] = useState<any[] | null>(null);
  const [files, setFiles] = useState<any[] | null>(null);
  const [payments, setPayments] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [m, f, p] = await Promise.all([
        supabase.from('project_milestones').select('*').eq('project_id', dashboard.id),
        supabase.from('project_files').select('*').eq('project_id', dashboard.id),
        supabase.from('project_payments').select('*').eq('project_id', dashboard.id),
      ]);

      if (!cancelled) {
        setMilestones(m.data ?? []);
        setFiles(f.data ?? []);
        setPayments(p.data ?? []);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dashboard.id]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dashboard.title}</h1>
            <p className="text-gray-600 mt-2">{dashboard.description || 'No description provided'}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Kickoff Call</Button>
            <Button>Start Chat</Button>
          </div>
        </div>
        <div className="flex gap-2">
          {Array.isArray(dashboard.skills_required) && dashboard.skills_required.length > 0 ? (
            dashboard.skills_required.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))
          ) : (
            <Badge variant="secondary">General</Badge>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
              ) : (
                <div className="space-y-2">
                  <Progress value={35} className="h-3" />
                  <p className="text-sm text-gray-600">35% complete</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading milestones…</p>
              ) : milestones?.length ? (
                <div className="space-y-3">
                  {milestones.map((m) => (
                    <div key={m.id} className="p-3 rounded-lg border bg-gray-50">
                      <div className="font-medium">{m.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{m.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No milestones yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Team Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600">
                {dashboard.teams?.length ? `${dashboard.teams.length} team(s) linked`
                 : 'No teams linked yet.'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Manager</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading files…</p>
              ) : files?.length ? (
                <div className="space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">{f.name}</span>
                      <Button variant="link" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No files uploaded.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading payments…</p>
              ) : payments?.length ? (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">{p.label || 'Milestone payment'}</span>
                      <span className="font-medium">${p.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No payments yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}