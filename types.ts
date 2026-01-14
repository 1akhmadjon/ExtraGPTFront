export interface User {
  id: number;
  username: string;
  role: 'admin' | 'owner' | 'operator';
  is_active: boolean;
  business_id?: number;
}

export interface Business {
  id: number;
  name: string;
  owner_id: number;
  is_active: boolean;
}

export interface Conversation {
  id: number;
  business_id: number;
  platform: 'telegram' | 'instagram';
  external_id: string;
  customer_name: string;
  last_message: string;
  updated_at: string;
  unread_count: number;
  is_ai_active: boolean;
}

export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  sender_type: 'client' | 'ai' | 'operator';
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  topic: string;
  status: 'new' | 'contacted' | 'meeting' | 'closed' | 'lost';
  created_at: string;
  channel: 'telegram' | 'instagram';
  conversation_id?: number;
}

export interface BotConfig {
  bot_name: string;
  ai_prompt: string;
  pause_start_hour: number;
  pause_end_hour: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface DashboardStats {
  total_conversations: number;
  unread_messages: number;
  leads_this_week: number;
  active_businesses?: number;
}
