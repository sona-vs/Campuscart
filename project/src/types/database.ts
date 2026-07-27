export interface Profile {
  id: string;
  email: string;
  full_name: string;
  college_name: string;
  phone?: string;
  avatar_url?: string;
  active_gradient?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  seller_id: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  location?: string;
  is_available: boolean;
  is_blocked?: boolean;
  blocked_reason?: string;
  images: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: Profile;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  contact_info: string;
  location?: string;
  image_url?: string;
  created_by: string;
  created_at: string;
  creator?: Profile;
}
