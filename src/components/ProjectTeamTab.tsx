import { useEffect, useState } from 'react';
import { getProjectTeamMembers } from '@/lib/data/getProjectTeamMembers';

export default function ProjectTeamTab({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await getProjectTeamMembers(projectId);
      if (!alive) return;
      if (error) setErr(error.message ?? 'Failed to load team members');
      setMembers(data);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [projectId]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading team…</div>;
  if (err)     return <div className="p-4 text-sm text-red-600">{err}</div>;
  if (!members.length) return <div className="p-4 text-sm text-gray-500">No team members yet.</div>;

  return (
    <ul className="divide-y divide-gray-200">
      {members.map((m) => (
        <li key={m.team_member_id} className="flex items-center gap-3 p-3">
          <img
            src={m.avatar_url ?? '/avatar-placeholder.png'}
            className="h-8 w-8 rounded-full object-cover"
            alt={m.full_name ?? 'Member'}
          />
          <div className="flex-1">
            <div className="font-medium">{m.full_name}</div>
            <div className="text-xs text-gray-500">{m.role ?? 'Member'}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}