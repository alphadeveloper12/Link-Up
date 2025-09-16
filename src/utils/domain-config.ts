// Domain configuration utilities for multi-domain support

export const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') {
    return 'https://teams-remote-urgent.deploypad.app'; // fallback for SSR
  }
  return window.location.origin;
};

export const buildDomainUrl = (path: string, params?: Record<string, string>): string => {
  const origin = getCurrentDomain();
  const url = new URL(path, origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.toString();
};

export const isCurrentDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.origin === getCurrentDomain();
  } catch {
    return false;
  }
};

// Supported domains for this application
export const SUPPORTED_DOMAINS = [
  'https://teams-remote-urgent.deploypad.app',
  'https://quickenquotes.com',
  'https://www.quickenquotes.com'
];

export const isSupportedDomain = (domain?: string): boolean => {
  const checkDomain = domain || getCurrentDomain();
  return SUPPORTED_DOMAINS.includes(checkDomain);
};