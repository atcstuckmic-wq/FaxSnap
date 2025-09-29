import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
}

export class StripeService {
  static async createCheckoutSession(packageData: TokenPackage, userId: string) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageData.id,
          tokens: packageData.tokens,
          amount: Math.round(packageData.price * 100), // Convert to cents
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  static async handleCheckoutSuccess(sessionId: string) {
    try {
      const response = await fetch('/api/verify-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Checkout verification error:', error);
      throw error;
    }
  }
}