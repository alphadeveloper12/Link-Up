import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    // The publishable key will be set via Supabase secrets
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export default getStripe;