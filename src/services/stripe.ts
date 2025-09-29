import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../config/supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
}

export class StripeService {
  static isConfigured(): boolean {
    return !!stripePublishableKey && stripePublishableKey.trim() !== '';
  }

  static async createCheckoutSession(packageData: TokenPackage, userId: string) {
    if (!this.isConfigured()) {
      throw new Error('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
    }

    try {
      // Call Supabase edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          packageId: packageData.id,
          tokens: packageData.tokens,
          amount: Math.round(packageData.price * 100), // Convert to cents
          userId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { sessionId } = data;
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeRedirectError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeRedirectError) {
        throw stripeRedirectError;
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  static async handleCheckoutSuccess(sessionId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
        body: { sessionId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to verify checkout session');
      }

      return data;
    } catch (error) {
      console.error('Checkout verification error:', error);
      throw error;
    }
  }
}