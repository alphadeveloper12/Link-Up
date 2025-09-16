export const getDefaultRouteForRole = (role: string | undefined): string => {
  switch (role) {
    case 'client':
      return '/projects';
    case 'team':
      return '/team-dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
};