export interface User {
  id: string;
  email: string;
  tokens: number;
  created_at: string;
}

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

export interface Fax {
  id: string;
  user_id: string;
  recipient_number: string;
  document_url: string;
  telnyx_fax_id?: string;
  status: 'pending' | 'sending' | 'delivered' | 'failed';
  tokens_used: number;
  created_at: string;
  cover_message?: string;
}

export interface TokenPurchase {
  id: string;
  user_id: string;
  tokens_count: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface FaxFormData {
  recipientNumber: string;
  coverMessage?: string;
  file: File;
}