import React, { useState, useEffect } from 'react';
import { Send, History, Coins, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import SendFaxForm from '../components/Fax/SendFaxForm';
import TokenPackages from '../components/TokenPurchase/TokenPackages';

const Dashboard: React.FC = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'tokens'>('send');
  const [faxHistory, setFaxHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadFaxHistory();
    }
  }, [user, activeTab]);

  const loadFaxHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faxes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load fax history:', error);
      } else {
        setFaxHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading fax history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaxSent = async () => {
    await refreshUserProfile();
    await loadFaxHistory();
    setActiveTab('history');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'send', label: 'Send Fax', icon: Send },
    { id: 'history', label: 'History', icon: History },
    { id: 'tokens', label: 'Buy Tokens', icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mx-auto mb-4">
              <Coins className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{userProfile?.tokens || 0}</h3>
            <p className="text-gray-600">Available Tokens</p>
          </Card>

          <Card className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-full mx-auto mb-4">
              <Send className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{faxHistory.length}</h3>
            <p className="text-gray-600">Faxes Sent</p>
          </Card>

          <Card className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {faxHistory.filter(f => f.status === 'delivered').length}
            </h3>
            <p className="text-gray-600">Delivered</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="inline h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'send' && (
            <SendFaxForm
              userTokens={userProfile?.tokens || 0}
              onFaxSent={handleFaxSent}
            />
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Fax History</h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading fax history...</p>
                  </div>
                ) : faxHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No faxes yet</h3>
                    <p className="text-gray-600 mb-6">
                      Send your first fax to see it appear here
                    </p>
                    <Button onClick={() => setActiveTab('send')}>
                      Send Your First Fax
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faxHistory.map((fax) => (
                      <div
                        key={fax.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(fax.status)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {fax.recipient_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(fax.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {getStatusText(fax.status)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {fax.tokens_used} token{fax.tokens_used === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Buy More Tokens</h2>
                <p className="text-gray-600">
                  Choose the package that works best for you. Tokens expire after 6 months.
                </p>
              </div>
              
              <TokenPackages />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;