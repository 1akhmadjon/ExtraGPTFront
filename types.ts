// ==================== USER & AUTH ====================

export interface User {
  id: number;
  username: string;
  phone: string;
  role: 'admin' | 'owner' | 'operator';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ==================== BUSINESS ====================

export interface Business {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  owner?: User;
  bot_config?: BotConfig;
  settings?: BusinessSettings;
}

export interface BusinessUser {
  id: number;
  business_id: number;
  user_id: number;
  created_at: string;
}

// ==================== BOT CONFIG ====================

export interface BotConfig {
  id: number;
  business_id: number;
  bot_name: string;
  prompt: string;
  telegram_token: string | null;
  telegram_webhook_set: boolean;
  instagram_access_token: string | null;
  instagram_business_id: string | null;
  created_at: string;
}

export interface BusinessSettings {
  id: number;
  business_id: number;
  daily_report_time: string; // HH:MM format
  ai_pause_from: string | null; // HH:MM
  ai_pause_to: string | null; // HH:MM
  followup_template: string | null;
  created_at: string;
}

// ==================== CONVERSATIONS & MESSAGES ====================

export interface Conversation {
  id: number;
  business_id: number;
  channel: 'telegram' | 'instagram';
  client_id: string;
  client_name: string | null;
  ai_enabled: boolean;
  followup_only: boolean;
  followup_sent: boolean;
  created_at: string;
  last_message?: {
    text: string;
    sender_type: 'client' | 'ai' | 'operator';
    created_at: string;
  };
  message_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'client' | 'ai' | 'operator';
  sender_id: number | null;
  text: string;
  created_at: string;
}

// ==================== LEADS ====================

export type LeadStatus = 'need_to_call' | 'contacted' | 'continuing' | 'finished' | 'rejected';

export interface Lead {
  id: number;
  business_id: number;
  conversation_id: number | null;
  channel: 'telegram' | 'instagram';
  full_name: string | null;
  phone: string | null;
  topic: string | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
  conversation?: Conversation;
}

export interface LeadStats {
  need_to_call: number;
  contacted: number;
  continuing: number;
  finished: number;
  rejected: number;
}

// ==================== INSTAGRAM ====================

export interface InstagramStatus {
  configured: boolean;
  has_access_token: boolean;
  has_business_id: boolean;
  instagram_business_id: string | null;
  ready: boolean;
  message: string;
}

// ==================== GLOBAL BOT ====================

export interface GlobalBotStatus {
  registered: boolean;
  telegram_chat_id: string | null;
  report_time: string;
  business_id: number;
  business_name: string;
}

// ==================== DASHBOARD ====================

export interface DashboardStats {
  total_conversations: number;
  active_conversations: number;
  total_leads: number;
  new_leads_today: number;
  ai_enabled_count: number;
  telegram_count: number;
  instagram_count: number;
}

// ==================== API RESPONSES ====================

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessagesResponse {
  conversation: Conversation;
  messages: Message[];
  total: number;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  stats: LeadStats;
}

export interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[];
}

// ==================== API REQUEST PAYLOADS ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  phone: string;
  password: string;
  role: 'admin' | 'owner' | 'operator';
}

export interface CreateBusinessRequest {
  name: string;
  owner_id: number;
}

export interface UpdateBotConfigRequest {
  business_id: number;
  bot_name?: string;
  prompt?: string;
}

export interface UpdateBusinessSettingsRequest {
  business_id: number;
  daily_report_time?: string;
  ai_pause_from?: string | null;
  ai_pause_to?: string | null;
  followup_template?: string | null;
}

export interface SendMessageRequest {
  conversation_id: number;
  text: string;
}

export interface ToggleAIRequest {
  conversation_id: number;
  ai_enabled: boolean;
}

export interface UpdateLeadStatusRequest {
  status: LeadStatus;
}

export interface UpdateLeadRequest {
  full_name?: string;
  phone?: string;
  topic?: string;
  notes?: string;
}
