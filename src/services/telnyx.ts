interface TelnyxFaxRequest {
  to: string;
  from: string;
  media_url: string;
  webhook_url?: string;
  store_media?: boolean;
}

interface TelnyxFaxResponse {
  data: {
    id: string;
    record_type: string;
    to: string;
    from: string;
    status: string;
    created_at: string;
  };
}

class TelnyxService {
  private apiKey: string;
  private baseUrl = 'https://api.telnyx.com/v2';

  constructor() {
    this.apiKey = import.meta.env.VITE_TELNYX_API_KEY || '';
  }

  async sendFax(data: TelnyxFaxRequest): Promise<TelnyxFaxResponse> {
    if (!this.apiKey) {
      throw new Error('Telnyx API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/faxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getFaxStatus(faxId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Telnyx API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/faxes/${faxId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get fax status: ${response.statusText}`);
    }

    return response.json();
  }
}

export const telnyxService = new TelnyxService();