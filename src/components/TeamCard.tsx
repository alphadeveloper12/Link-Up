import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Star, Eye } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  bio?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  completedDate: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  skills: string[];
  availability: string;
  rating: number;
  completedProjects: number;
  hourlyRate: string;
  location?: string;
  bio?: string;
  pastProjects?: Project[];
  isAvailableNow?: boolean;
  description?: string;
  hourly_rate?: string;
  availability_status?: string;
}

interface TeamCardProps {
  team: Team;
  onSelect: (teamId: string) => void;
  onViewDetails: (team: Team) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onSelect, onViewDetails }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{team.rating}</span>
          </div>
        </div>
        
        {/* Show only top 2-3 member avatars */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {team.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{team.members.length - 3}</span>
              </div>
            )}
          </div>
          
          {/* Available Now Badge */}
          {team.isAvailableNow && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Available Now
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {team.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {team.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{team.skills.length - 4} more
            </Badge>
          )}
        </div>
        
        {/* Team Details */}
        <div className="space-y-1 text-sm text-gray-600">
          <p>{team.description || 'No description provided yet.'}</p>
          <p>{team.hourly_rate ? `$${team.hourly_rate}/hr` : 'Rate not set'}</p>
          <p>{team.availability_status || 'Availability not set'}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{team.availability}</span>
          </div>
          <span>•</span>
          <span>{team.completedProjects} projects</span>
        </div>
        
        <div className="text-lg font-semibold text-gray-900">
          {team.hourlyRate}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline"
          onClick={() => onViewDetails(team)}
          className="flex-1 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Team Details
        </Button>
        <Button 
          onClick={() => onSelect(team.id)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Select Team
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamCard;