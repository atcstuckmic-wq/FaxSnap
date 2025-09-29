import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Zap, Shield, Clock, Check, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import TokenPackages from '../components/TokenPurchase/TokenPackages';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Send fax documents in seconds, not minutes',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Bank-level security with 99.9% delivery guarantee',
    },
    {
      icon: Clock,
      title: 'No Monthly Fees',
      description: 'Pay only for what you use, no subscriptions required',
    },
  ];

  const handleSelectPackage = (packageId: string) => {
    // In real app, this would redirect to payment flow
    console.log('Selected package:', packageId);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Send Fax Documents
              <span className="block text-primary-200">Instantly</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              No monthly subscriptions. No complicated setup. Just upload your document and send - 
              starting at just $0.35 per fax.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-center space-x-8 text-primary-200">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-success-400" />
                <span>No Setup Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-success-400" />
                <span>Global Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-success-400" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FaxSnap?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern fax technology that actually works the way you expect it to
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center" hover>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Buy tokens once, use them forever. No monthly fees, no hidden costs.
            </p>
          </div>

          <TokenPackages onSelectPackage={handleSelectPackage} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Send Your First Fax?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who've ditched expensive monthly fax services. 
            Get started in less than 2 minutes.
          </p>
          
          {!user && (
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Create Free Account
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;