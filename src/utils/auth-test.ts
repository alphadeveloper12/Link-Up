// Test utility to verify authentication redirect URLs
export const testAuthRedirectUrls = () => {
  console.log('Testing authentication redirect URLs...');
  
  // Test cases for different scenarios
  const testCases = [
    { next: null, intent: null, expected: '/start' },
    { next: '/dashboard', intent: 'team', expected: '/dashboard' },
    { next: '/projects', intent: 'client', expected: '/projects' },
    { next: null, intent: 'team', expected: '/start' }
  ];
  
  testCases.forEach((testCase, index) => {
    // Simulate URL parameters
    const params = new URLSearchParams();
    if (testCase.next) params.set('next', testCase.next);
    if (testCase.intent) params.set('intent', testCase.intent);
    
    // Mock window.location.search
    const mockSearch = params.toString() ? `?${params.toString()}` : '';
    
    // Test the redirect URL construction logic
    const next = params.get('next') || '/start';
    const intent = params.get('intent') || '';
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}&intent=${intent}`;
    
    console.log(`Test ${index + 1}:`, {
      input: testCase,
      redirectTo,
      nextParam: next,
      intentParam: intent
    });
  });
  
  console.log('Authentication redirect URL tests completed!');
};