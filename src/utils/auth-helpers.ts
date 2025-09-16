// Authentication flow constants - using centralized routes
import { ROUTES } from './routes';
import { buildDomainUrl } from './domain-config';

export const SIGNUP_ROUTE = ROUTES.signup;
export const SIGNIN_ROUTE = ROUTES.signin;
export const POST_PROJECT_ROUTE = ROUTES.postProject;
export const TEAM_CREATE_ROUTE = ROUTES.teamCreate;
// Draft storage keys
export const DRAFT_PROJECT_KEY = 'draft_project';
export const DRAFT_TEAM_KEY = 'draft_team_profile';

// Helper to add query parameters to URL
export const addParams = (baseUrl: string, params: Record<string, string>): string => {
  return buildDomainUrl(baseUrl, params);
};

// Get current URL with query params
export const currentUrl = (): string => {
  return window.location.pathname + window.location.search;
};

// Guess intent from current route
export const guessIntentFromRoute = (route?: string): string => {
  const currentRoute = route || window.location.pathname;
  if (currentRoute.includes('team') || currentRoute.includes('profile')) {
    return 'team';
  }
  if (currentRoute.includes('project')) {
    return 'client';
  }
  return 'client'; // default
};