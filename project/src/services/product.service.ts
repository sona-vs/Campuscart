import { Injectable, signal } from '@angular/core';
import { Product, Category, Profile } from '../types/database';

/** Resolves API base URL dynamically so it works on localhost AND mobile via network IP */
function apiBase(): string {
  return `http://${window.location.hostname}:3001/api`;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  categories       = signal<Category[]>([]);
  products         = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  loading          = signal(false);

  /** Category fallback images (used when a product has no uploaded image) */
  private categoryImages: Record<string, string> = {
    'books':         'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=60',
    'gadgets':       'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&auto=format&fit=crop&q=60',
    'room-sharing':  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=60',
    'cycle-rentals': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60',
    'event-tickets': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    'lab-records':   'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60',
    'default':       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
  };

  // ── helpers ────────────────────────────────────────────────────────────────

  /** Returns the right display image for a product */
  getProductImage(product: any): string {
    const firstImg = product?.images?.[0];
    if (firstImg && typeof firstImg === 'string' && firstImg.trim() !== '' && !firstImg.includes('pexels.com')) {
      return firstImg;
    }
    const slug = product?.category?.slug || '';
    return this.categoryImages[slug] || this.categoryImages['default'];
  }

  getCategoryDefaultImage(slug: string): string {
    return this.categoryImages[slug] || this.categoryImages['default'];
  }

  private getCurrentUserId(): string {
    const saved = localStorage.getItem('cc_profile');
    return saved ? JSON.parse(saved).id : 'guest';
  }

  private async apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${apiBase()}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API error');
    return data;
  }

  // ── public API ─────────────────────────────────────────────────────────────

  async loadCategories() {
    try {
      const cats = await this.apiFetch('/categories');
      this.categories.set(cats);
      return cats;
    } catch (e) {
      console.error('loadCategories failed', e);
      return [];
    }
  }

  async loadProducts(categoryId?: string) {
    this.loading.set(true);
    try {
      const qs = categoryId ? `?category=${categoryId}` : '';
      const list = await this.apiFetch(`/products${qs}`);
      this.products.set(list);
      return list;
    } catch (e) {
      console.error('loadProducts failed', e);
      this.products.set([]);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async loadFeaturedProducts() {
    try {
      const list = await this.apiFetch('/products?featured=1');
      this.featuredProducts.set(list);
      return list;
    } catch (e) {
      console.error('loadFeaturedProducts failed', e);
      return [];
    }
  }

  async getProductById(id: string) {
    try {
      return await this.apiFetch(`/products/${id}`);
    } catch (e) {
      console.error('getProductById failed', e);
      return null;
    }
  }

  async createProduct(product: Partial<Product>) {
    const sellerId = this.getCurrentUserId();
    const body = {
      title:       product.title || '',
      description: product.description || '',
      price:       Number(product.price) || 0,
      category_id: product.category_id || '',
      seller_id:   sellerId,
      condition:   product.condition || 'good',
      location:    product.location || '',
      is_available: true,
      images:      product.images || [],
    };
    return this.apiFetch('/products', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    return this.apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  }

  async deleteProduct(id: string) {
    return this.apiFetch(`/products/${id}`, { method: 'DELETE' });
  }

  async getUserProducts(userId: string) {
    try {
      const all = await this.apiFetch('/products?limit=200&all=1');
      return all.filter((p: any) => p.seller_id === userId);
    } catch (e) {
      console.error('getUserProducts failed', e);
      return [];
    }
  }

  async loadVerificationPendingProducts() {
    try {
      const all = await this.apiFetch('/products?limit=250&all=1');
      return all.filter((p: any) => p.verification_pending === true);
    } catch (e) {
      console.error('loadVerificationPendingProducts failed', e);
      return [];
    }
  }

  async searchProducts(query: string) {
    try {
      return await this.apiFetch(`/products?search=${encodeURIComponent(query)}`);
    } catch (e) {
      console.error('searchProducts failed', e);
      return [];
    }
  }

  async loadNotifications(userId: string) {
    try {
      return await this.apiFetch(`/notifications?user_id=${userId}`);
    } catch (e) {
      console.error('loadNotifications failed', e);
      return [];
    }
  }

  async markAllNotificationsAsRead(userId: string) {
    try {
      return await this.apiFetch('/notifications/read-all', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
      });
    } catch (e) {
      console.error('markAllNotificationsAsRead failed', e);
      return null;
    }
  }

  async loadNotices(type?: string) {
    try {
      const qs = type ? `?type=${type}` : '';
      return await this.apiFetch(`/notices${qs}`);
    } catch (e) {
      console.error('loadNotices failed', e);
      return [];
    }
  }

  async createNotice(notice: any) {
    const creatorId = this.getCurrentUserId();
    const body = {
      title: notice.title || '',
      description: notice.description || '',
      type: notice.type || 'lost',
      contact_info: notice.contact_info || '',
      location: notice.location || '',
      image_url: notice.image_url || '',
      created_by: creatorId,
    };
    return this.apiFetch('/notices', { method: 'POST', body: JSON.stringify(body) });
  }

  async deleteNotice(id: string) {
    return this.apiFetch(`/notices/${id}`, { method: 'DELETE' });
  }

  async loadAllProfiles() {
    try {
      return await this.apiFetch('/auth/profiles');
    } catch (e) {
      console.error('loadAllProfiles failed', e);
      return [];
    }
  }
}
