import React from 'react';
import { Check, Star } from 'lucide-react';
import { TOKEN_PACKAGES } from '../../config/constants';
import { StripeService } from '../../services/stripe';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Card from '../UI/Card';
import toast from 'react-hot-toast';

interface TokenPackagesProps {
  onSelectPackage?: (packageId: string) => void;
}

const TokenPackages: React.FC<TokenPackagesProps> = ({ onSelectPackage }) => {
  const { user } = useAuth();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculatePricePerToken = (tokens: number, price: number) => {
    return formatPrice(price / tokens);
  };

  const handlePurchase = async (pkg: any) => {
    if (!user) {
      toast.error('Please sign in to purchase tokens');
      return;
    }

    // Check if Stripe is configured
    if (!StripeService.isConfigured()) {
      toast.error('Payment system is not configured. Please contact support.');
      console.warn('⚠️ Stripe not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to environment variables.');
      return;
    }

    try {
      toast.loading('Redirecting to checkout...', { id: 'checkout' });
      await StripeService.createCheckoutSession(pkg, user.id);
    } catch (error) {
      toast.dismiss('checkout');
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      toast.error(errorMessage);
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {TOKEN_PACKAGES.map((pkg) => (
        <Card
          key={pkg.id}
          className={`relative ${
            pkg.popular 
              ? 'ring-2 ring-primary-500 shadow-lg animate-pulse-scale' 
              : 'hover:shadow-md'
          } transition-all duration-200`}
          hover={!pkg.popular}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Most Popular</span>
              </div>
            </div>
          )}

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {pkg.tokens} Tokens
            </h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(pkg.price)}
              </span>
            </div>
            
            {pkg.savings && (
              <div className="mb-4">
                <span className="bg-success-100 text-success-800 px-2 py-1 rounded-full text-sm font-medium">
                  {pkg.savings}
                </span>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-6">
              <p>{calculatePricePerToken(pkg.tokens, pkg.price)} per token</p>
              <p className="text-xs text-amber-600 mt-1">Expires 6 months after purchase</p>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center space-x-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-success-500 flex-shrink-0" />
                <span>{pkg.tokens} fax{pkg.tokens === 1 ? '' : 'es'}</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-success-500 flex-shrink-0" />
                <span>Global delivery</span>
              </li>
            </ul>

            <Button
              variant="primary"
              size="lg"
              onClick={() => onSelectPackage ? onSelectPackage(pkg.id) : handlePurchase(pkg)}
              className={`w-full font-semibold shadow-lg transition-all duration-200 ${
                pkg.popular 
                  ? 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 animate-pulse' 
                  : 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700'
              }`}
            >
              Purchase Now
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TokenPackages;