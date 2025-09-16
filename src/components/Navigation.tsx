import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolutionsDropdown } from '@/components/SolutionsDropdown';
import { SearchModal } from '@/components/SearchModal';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { buildAuthUrl, SIGNUP_ROUTE, SIGNIN_ROUTE } from '@/utils/auth-routing';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Navigation: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasTeamProfile, setHasTeamProfile] = useState(false);
  const [hasPostedProjects, setHasPostedProjects] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { isAdmin } = useAdmin();

  // Check user's dashboard eligibility
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user?.id) {
        console.log('Navigation: User not authenticated or no user ID');
        return;
      }

      console.log('Navigation: Checking user status for user ID:', user.id);

      try {
        // Check if user has a team profile
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('created_by', user.id)
          .single();
        
        console.log('Navigation: Team data:', teamData, 'Error:', teamError);
        setHasTeamProfile(!!teamData);

        // Check if user has posted projects
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', user.id)
          .limit(1);
        
        console.log('Navigation: Project data:', projectData, 'Error:', projectError);
        setHasPostedProjects(!!projectData && projectData.length > 0);
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user?.id]);

  const handleGetStarted = () => {
    const authUrl = buildAuthUrl(SIGNUP_ROUTE, '/start');
    window.location.href = authUrl;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account."
    });
    navigate('/');
  };

  const goTeamCreate = () => {
    const target = '/team-profile/create';
    if (!isAuthenticated) {
      window.location.href = buildAuthUrl(SIGNUP_ROUTE, target, 'team');
      return;
    }
    navigate(target);
  };

  return (
    <>
      <nav className="sticky top-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100 z-50 shadow-sm">
        <div className="mx-auto px-8 py-5" style={{ maxWidth: '100rem' }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
            >
              LinkUp
            </Link>


            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                How It Works
              </Link>
               <button 
                 onClick={goTeamCreate}
                 className="text-gray-700 hover:text-blue-600 font-medium"
               >
                 Team Profile
                </button>
                
                
                {/* Dashboard Navigation Tabs - Always show when authenticated for testing */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-4 py-2 border border-blue-200 shadow-sm">
                    <Link 
                      to="/team-dashboard" 
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 font-medium px-4 py-2 rounded-full text-sm shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer no-underline"
                      onClick={(e) => {
                        console.log('Team Dashboard clicked');
                        e.preventDefault();
                        navigate('/team-dashboard');
                      }}
                    >
                      Team Dashboard
                    </Link>
                    <Link 
                      to="/project-dashboard" 
                      className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 font-medium px-4 py-2 rounded-full text-sm shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer no-underline"
                      onClick={(e) => {
                        console.log('Project Dashboard clicked');
                        e.preventDefault();
                        navigate('/project-dashboard');
                      }}
                    >
                      Project Dashboard
                    </Link>
                  </div>
                )}
                
                {/* Debug Info - Shows authentication and user status */}
                {isAuthenticated && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Auth: ✓ | Team: {hasTeamProfile ? '✓' : '✗'} | Projects: {hasPostedProjects ? '✓' : '✗'}
                  </div>
                )}
               <SolutionsDropdown />
              
              {/* Admin Navigation - Only visible to admin users */}
              {isAdmin && (
                <Link 
                  to="/admin/email-console" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Authentication State */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* User Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  
                  {/* Sign Out */}
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-600 font-medium flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  {/* Sign In */}
                  <Link to={SIGNIN_ROUTE}>
                    <Button 
                      variant="ghost" 
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>

                  {/* Get Started */}
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navigation;