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

    try {
      toast.loading('Redirecting to checkout...', { id: 'checkout' });
      await StripeService.createCheckoutSession(pkg, user.id);
    } catch (error) {
      toast.dismiss('checkout');
      toast.error('Failed to start checkout. Please try again.');
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
              variant={pkg.popular ? 'primary' : 'outline'}
              size="lg"
              onClick={() => onSelectPackage ? onSelectPackage(pkg.id) : handlePurchase(pkg)}
              className="w-full"
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