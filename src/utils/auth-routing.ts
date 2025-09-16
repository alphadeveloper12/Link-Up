// Auth routing utilities with centralized routes
import { ROUTES } from './routes';
import { getCurrentDomain, buildDomainUrl } from './domain-config';

export const SIGNUP_ROUTE = ROUTES.signup;
export const SIGNIN_ROUTE = ROUTES.signin;

export const buildNextUrl = (base: string, params: Record<string, string>): string => {
  const url = new URL(base, getCurrentDomain());
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.pathname + url.search;
};

export const buildAuthUrl = (authRoute: string, next?: string, intent?: string): string => {
  const params: Record<string, string> = {};
  
  if (next) params.next = next;
  if (intent) params.intent = intent;
  
  return buildDomainUrl(authRoute, params);
};