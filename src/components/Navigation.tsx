import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchModal } from '@/components/SearchModal';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { buildAuthUrl, SIGNUP_ROUTE, SIGNIN_ROUTE } from '@/utils/auth-routing';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { NotificationSystem } from './NotificationSystem';

const Navigation: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasTeamProfile, setHasTeamProfile] = useState(false);
  const [hasPostedProjects, setHasPostedProjects] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user?.id) return;

      try {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id')
          .eq('created_by', user.id)
          .single();
        setHasTeamProfile(!!teamData);

        const { data: projectData } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', user.id)
          .limit(1);
        setHasPostedProjects(!!projectData && projectData.length > 0);
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user?.id]);

  // close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetStarted = () => {
    const authUrl = buildAuthUrl(SIGNUP_ROUTE, '/start');
    window.location.href = authUrl;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out successfully',
      description: 'You have been logged out of your account.',
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
            <div className="hidden md:flex flex-wrap items-center gap-x-6 lg:gap-x-12 gap-y-2">
              {isAuthenticated && (
                <button
                  onClick={goTeamCreate}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Team Profile
                </button>
              )}

              {isAuthenticated && (
                <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-3 py-2 border border-blue-200 shadow-sm">
                  <Link
                    to="/team-dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 font-medium px-3 py-2 rounded-full text-sm shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/team-dashboard');
                    }}
                  >
                    Team Dashboard
                  </Link>
                  <Link
                    to="/project-dashboard"
                    className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 font-medium px-3 py-2 rounded-full text-sm shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/project-dashboard');
                    }}
                  >
                    Project Dashboard
                  </Link>
                </div>
              )}

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

            {/* Right Side */}
            <div className="flex items-center space-x-6">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Search className="h-5 w-5" />
              </Button>

              {isAuthenticated ? (
                <>
                  {/* Notification Icon */}
                  <NotificationSystem />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setProfileMenuOpen((prev) => !prev)}
                      className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
                    >
                      <User className="h-4 w-4 text-white" />
                    </button>
                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                        <a
                          href="#features"
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Features
                        </a>
                        <Link
                          to="/analytics"
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Analytics
                        </Link>
                        <Link
                          to="/training"
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Training
                        </Link>
                        <Link
                          to="/support"
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Support
                        </Link>
                        <a
                          href="#testimonials"
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Testimonials
                        </a>

                        <div className="border-t border-gray-100 my-2" />

                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to={SIGNIN_ROUTE}>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>
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
