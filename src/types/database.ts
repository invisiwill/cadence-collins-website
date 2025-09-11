export interface MailingListSubscriber {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export interface CampaignEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  section_key: 'bio' | 'policy' | 'contact' | 'hero_intro';
  title: string;
  content: string;
  photo_data?: string; // Legacy field for backward compatibility
  photo_large?: string;
  photo_medium?: string;
  photo_small?: string;
  photo_alt?: string;
  photo_metadata?: {
    originalName: string;
    originalSize: number;
    processedSizes: {
      large: { width: number; height: number; size: number };
      medium: { width: number; height: number; size: number };
      small: { width: number; height: number; size: number };
    };
    processedAt: string;
  };
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Form interfaces
export interface MailingListSignupForm {
  email: string;
  name: string;
}

export interface EventForm {
  title: string;
  description: string;
  date: string;
  location: string;
  is_published: boolean;
}

export interface ContentForm {
  title: string;
  content: string;
  photo_data?: string;
  photo_alt?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  error_code?: string;
}