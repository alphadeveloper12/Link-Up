import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { buildAuthUrl, SIGNUP_ROUTE } from '@/utils/auth-routing';
import { POST_PROJECT_ROUTE, TEAM_CREATE_ROUTE } from '@/utils/auth-helpers';

// Use imported route constants
const ChooseYourPath: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const authUrl = buildAuthUrl(SIGNUP_ROUTE, '/start');
      navigate(authUrl);
    }
  }, [loading, isAuthenticated, navigate]);
  // Handle deep-linking with intent parameters
  useEffect(() => {
    const intent = searchParams.get('intent');
    if (intent === 'client') {
      navigate(POST_PROJECT_ROUTE);
      toast({
        title: 'Redirecting',
        description: `Going to: ${POST_PROJECT_ROUTE}`,
      });
    } else if (intent === 'team') {
      navigate(TEAM_CREATE_ROUTE);
      toast({
        title: 'Redirecting',
        description: `Going to: ${TEAM_CREATE_ROUTE}`,
      });
    }
  }, [searchParams, navigate, toast]);

  const handleHiringClick = () => {
    navigate(POST_PROJECT_ROUTE);
    toast({
      title: 'Redirecting',
      description: `Going to: ${POST_PROJECT_ROUTE}`,
    });
  };

  const handleTeamClick = () => {
    navigate(TEAM_CREATE_ROUTE);
    toast({
      title: 'Redirecting',
      description: `Going to: ${TEAM_CREATE_ROUTE}`,
    });
  };

  const handleDecideLater = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How do you want to use LinkUp?
          </h1>
          <p className="text-lg text-gray-600">
            Choose your path to get started with the right tools for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Hiring Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300" onClick={handleHiringClick}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">I'm hiring</CardTitle>
              <CardDescription className="text-lg">
                Post a project and get matched instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
                onClick={handleHiringClick}
              >
                Post a Project
              </Button>
            </CardContent>
          </Card>

          {/* Team Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300" onClick={handleTeamClick}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">I'm a Team</CardTitle>
              <CardDescription className="text-lg">
                Offer services and get matched to projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3"
                onClick={handleTeamClick}
              >
                Create Team Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={handleDecideLater}
            className="text-gray-600 hover:text-gray-800"
          >
            Decide later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChooseYourPath;