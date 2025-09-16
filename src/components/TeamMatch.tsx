import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Eye, Clock, Building2 } from 'lucide-react';

const TeamMatch: React.FC = () => {
  const teams = [
    {
      name: "React Ninjas",
      members: ["JD", "SM", "AL"],
      skills: ["React", "Node.js", "TypeScript"],
      industry: "Web & App Development",
      chemistry: "Worked together on 14 projects",
      availability: "Ready now",
      rating: 4.9
    },
    {
      name: "Full Stack Heroes",
      members: ["MK", "RP", "TL"],
      skills: ["Vue.js", "Python", "AWS"],
      industry: "Web & App Development",
      chemistry: "Worked together on 8 projects",
      availability: "Ready now",
      rating: 4.8
    },
    {
      name: "Design Masters",
      members: ["AC", "BL", "CD"],
      skills: ["UI/UX", "Figma", "Adobe Creative"],
      industry: "Marketing & Advertising",
      chemistry: "Worked together on 12 projects",
      availability: "Ready now",
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Perfect Teams Found!</h1>
          <p className="text-xl text-gray-600">AI-matched teams ready to start your project</p>
          <div className="flex items-center justify-center mt-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="ml-3 text-sm text-gray-500">Matching in real-time</span>
          </div>
        </div>

        <div className="grid gap-6">
          {teams.map((team, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-100 hover:shadow-3xl transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-green-100 text-green-800 rounded-xl">
                      <Clock className="w-3 h-3 mr-1" />
                      {team.availability}
                    </Badge>
                    <span className="text-yellow-500">★ {team.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{team.chemistry}</p>
                </div>
                <div className="flex -space-x-3">
                  {team.members.map((member, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                      {member}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <Badge className="bg-blue-100 text-blue-800 rounded-xl">
                  <Building2 className="w-3 h-3 mr-1" />
                  {team.industry}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {team.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="rounded-xl">{skill}</Badge>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" className="rounded-2xl border-purple-200">
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl"
                  onClick={() => window.location.href = `/hire/team-${index + 1}`}
                >
                  Select Team
                </Button>
                <Button variant="outline" className="rounded-2xl border-purple-200">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMatch;