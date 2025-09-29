interface ConnectionTestResult {
  service: string;
  status: 'configured' | 'not_configured' | 'error';
  message: string;
  details?: string;
}

export class ConnectionTester {
  static testSupabase(): ConnectionTestResult {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Check if variables exist
    if (!url || !key) {
      return {
        service: 'Supabase',
        status: 'not_configured',
        message: 'Environment variables missing',
        details: `Missing: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'VITE_SUPABASE_ANON_KEY' : ''}`.trim()
      };
    }

    // Check for placeholder values
    const placeholderPatterns = [
      'your-project', 'YOUR_PROJECT', 'your_anon_key', 'YOUR_ANON_KEY',
      'xxxxx', 'placeholder', 'PLACEHOLDER'
    ];

    const hasPlaceholder = placeholderPatterns.some(pattern => 
      url.includes(pattern) || key.includes(pattern)
    );

    if (hasPlaceholder) {
      return {
        service: 'Supabase',
        status: 'not_configured',
        message: 'Placeholder values detected',
        details: 'Please replace with your actual Supabase credentials'
      };
    }

    // Validate URL format
    if (!url.includes('supabase.co') || !url.startsWith('https://')) {
      return {
        service: 'Supabase',
        status: 'error',
        message: 'Invalid Supabase URL format',
        details: 'Should be: https://project-id.supabase.co'
      };
    }

    // Validate key format (JWT should start with 'eyJ')
    if (!key.startsWith('eyJ') || key.length < 100) {
      return {
        service: 'Supabase',
        status: 'error',
        message: 'Invalid anon key format',
        details: 'Should be a long JWT token starting with "eyJ"'
      };
    }

    return {
      service: 'Supabase',
      status: 'configured',
      message: 'Properly configured'
    };
  }

  static testStripe(): ConnectionTestResult {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      return {
        service: 'Stripe',
        status: 'not_configured',
        message: 'Not configured (optional for testing)'
      };
    }

    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
      return {
        service: 'Stripe',
        status: 'error',
        message: 'Invalid Stripe key format',
        details: 'Should start with "pk_test_" or "pk_live_"'
      };
    }

    return {
      service: 'Stripe',
      status: 'configured',
      message: key.startsWith('pk_test_') ? 'Test mode configured' : 'Live mode configured'
    };
  }

  static testTelnyx(): ConnectionTestResult {
    const key = import.meta.env.VITE_TELNYX_API_KEY;
    const number = import.meta.env.VITE_TELNYX_FROM_NUMBER;

    if (!key && !number) {
      return {
        service: 'Telnyx',
        status: 'not_configured',
        message: 'Not configured (optional for testing)'
      };
    }

    if (!key) {
      return {
        service: 'Telnyx',
        status: 'error',
        message: 'API key missing',
        details: 'VITE_TELNYX_API_KEY required'
      };
    }

    if (!number) {
      return {
        service: 'Telnyx',
        status: 'error',
        message: 'From number missing',
        details: 'VITE_TELNYX_FROM_NUMBER required'
      };
    }

    if (!number.startsWith('+')) {
      return {
        service: 'Telnyx',
        status: 'error',
        message: 'Invalid phone number format',
        details: 'Should start with + (e.g., +1234567890)'
      };
    }

    return {
      service: 'Telnyx',
      status: 'configured',
      message: 'Configured'
    };
  }

  static runAllTests(): ConnectionTestResult[] {
    return [
      this.testSupabase(),
      this.testStripe(),
      this.testTelnyx()
    ];
  }

  static logResults(results: ConnectionTestResult[]): void {
    console.log('\n🔍 Connection Test Results:');
    console.log('═'.repeat(50));
    
    results.forEach(result => {
      const emoji = result.status === 'configured' ? '✅' : 
                    result.status === 'not_configured' ? '⚪' : '❌';
      
      console.log(`${emoji} ${result.service}: ${result.message}`);
      if (result.details) {
        console.log(`   📋 ${result.details}`);
      }
    });

    const criticalErrors = results.filter(r => 
      r.service === 'Supabase' && r.status !== 'configured'
    );

    if (criticalErrors.length > 0) {
      console.log('\n🚨 CRITICAL: Supabase must be configured for the app to work!');
      console.log('📖 See QUICKSTART.md for 5-minute setup guide');
    }

    console.log('═'.repeat(50));
  }
}