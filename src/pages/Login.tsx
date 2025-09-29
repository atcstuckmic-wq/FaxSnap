import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import AuthForm from '../components/Auth/AuthForm';
import Card from '../components/UI/Card';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Send className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">FaxSnap</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue sending faxes
          </p>
        </div>

        <Card>
          <AuthForm type="login" onSuccess={handleSuccess} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Create one now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;