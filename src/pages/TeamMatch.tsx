import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'; // make sure you have these

const TeamMatch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // no relationships, just fetch teams as you had before
        const { data, error } = await supabase.from('teams').select('*');
        if (error) throw error;
        setTeams(data || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <div className="p-6">Loading teams...</div>;

  const filteredTeams = teams.filter((team) =>
    team.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Find Your Perfect Team
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold">
                {team.name || 'Unnamed Team'}
              </h3>
              <p className="text-gray-600 mt-2">
                {team.description || 'No description provided yet.'}
              </p>

              <Tabs defaultValue="select" className="mt-4">
                <TabsList>
                  <TabsTrigger value="select">Select Team</TabsTrigger>
                  <TabsTrigger value="details">View Details</TabsTrigger>
                </TabsList>

                <TabsContent value="select">
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-500">
                      {team.hourly_rate
                        ? `$${team.hourly_rate}/hr`
                        : 'Rate not set'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {team.availability_status || 'Availability not set'}
                    </p>
                    {team.skills && team.skills.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Skills: {team.skills.join(', ')}
                      </p>
                    )}
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => navigate(`/hire/${team.id}`)}
                  >
                    Select Team
                  </Button>
                </TabsContent>

                <TabsContent value="details">
                  <div className="mt-3 space-y-2">
                    {/* here you can render credentials/projects once you have them */}
                    <p className="text-sm text-gray-500">
                      Credentials: {team.credentials || 'Not uploaded'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Past Projects: {team.past_projects || 'Not uploaded'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No teams found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMatch;
