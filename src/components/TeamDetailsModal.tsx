import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Calendar, DollarSign } from 'lucide-react';

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
  description?: string;
  hourly_rate?: string;
  availability_status?: string;
}

interface TeamDetailsModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (teamId: string) => void;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ 
  team, 
  isOpen, 
  onClose, 
  onSelect 
}) => {
  const navigate = useNavigate();
  
  if (!team) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{team.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Team Overview */}
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{team.rating}</span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{team.completedProjects} projects completed</span>
                {team.location && (
                  <>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-gray-600">{team.location}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{team.availability}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-semibold">{team.hourlyRate}</span>
                </div>
              </div>
              
              {team.bio && (
                <p className="text-gray-700 mb-4">{team.bio}</p>
              )}
              
              {/* Team Details */}
              <div className="space-y-2 text-sm">
                <p>{team.description || 'No description provided yet.'}</p>
                <p>{team.hourly_rate ? `$${team.hourly_rate}/hr` : 'Rate not set'}</p>
                <p>{team.availability_status || 'Availability not set'}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Skills & Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {team.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Team Members</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    {member.bio && (
                      <p className="text-xs text-gray-500 mt-1">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Projects */}
          {team.pastProjects && team.pastProjects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Projects</h3>
              <div className="space-y-4">
                {team.pastProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{project.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Completed: {project.completedDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                // if you have a selected project name, append ?project=...
                navigate(`/hire/${team.id}`);
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Select This Team
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetailsModal;