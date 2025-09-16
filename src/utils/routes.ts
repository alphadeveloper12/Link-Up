export const ROUTES = {
  start: '/start',
  signup: '/signup',
  signin: '/login',         // your actual route
  projects: '/projects',
  postProject: '/projects?open=post-project',
  teamCreate: '/team-profile/create',
  teamProfile: '/team-profile/:teamId?',
  teamDashboard: '/team-dashboard',
  home: '/',
  teamMatch: '/team-match',
  analytics: '/analytics',
  admin: '/admin',
  training: '/training',
  support: '/support',
  proposals: '/proposals',
  emailCampaigns: '/email-campaigns',
  emailConsole: '/email-console',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

export type RouteKey = keyof typeof ROUTES;

// Export individual routes for compatibility
export const SIGNUP_ROUTE = ROUTES.signup;
export const SIGNIN_ROUTE = ROUTES.signin;