// Route detection utilities for finding auth routes dynamically

// Route candidates to check in order of preference
const SIGNUP_CANDIDATES = ['/signup', '/sign-up', '/register', '/auth/signup'];
const SIGNIN_CANDIDATES = ['/signin', '/sign-in', '/login', '/auth/signin', '/auth/login'];

// Get all routes from the router - this is a simplified approach
// In a real app, you'd access the router's route table
const getDefinedRoutes = (): string[] => {
  // For this implementation, we'll check against known routes from App.tsx
  // In a more complex app, you'd dynamically read from the router
  return [
    '/',
    '/login',
    '/signup', 
    '/analytics',
    '/training',
    '/start',
    '/support',
    '/proposals',
    '/team-match',
    '/team-profile',
    '/project/:projectId',
    '/project-dashboard/:projectId',
    '/email-campaigns',
    '/projects',
    '/team-dashboard',
    '/admin',
    '/admin/email-console'
  ];
};

const routeExists = (path: string): boolean => {
  const definedRoutes = getDefinedRoutes();
  return definedRoutes.includes(path);
};

export const detectAuthRoutes = (): { signupRoute: string; signinRoute: string } => {
  // Find first existing signup route
  let signupRoute = SIGNUP_CANDIDATES.find(route => routeExists(route)) || '/';
  
  // Find first existing signin route  
  let signinRoute = SIGNIN_CANDIDATES.find(route => routeExists(route)) || '/';
  
  // Fallback logic if routes not found
  if (signupRoute === '/' && signinRoute !== '/') {
    signupRoute = signinRoute;
  }
  if (signinRoute === '/' && signupRoute !== '/') {
    signinRoute = signupRoute;
  }
  
  return { signupRoute, signinRoute };
};

// Show debug toast with detected routes (call once at app start)
export const showAuthRoutesDebug = () => {
  const { signupRoute, signinRoute } = detectAuthRoutes();
  console.log('Auth Routes Detected:', { signupRoute, signinRoute });
};