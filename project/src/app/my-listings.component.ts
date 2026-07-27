import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="my-listings-container fade-in">
      <div class="page-header">
        <div class="header-content">
          <h1>My Listings</h1>
          <p>Manage your listed products</p>
        </div>
        <a routerLink="/dashboard/sell" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Listing
        </a>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Loading your listings...</p>
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.59L18 11l-6 6z"/>
            </svg>
          </div>
          <h3>No Listings Yet</h3>
          <p>Start selling on campus by creating your first listing</p>
          <a routerLink="/dashboard/sell" class="btn-primary">Create Listing</a>
        </div>
      } @else {
        <div class="listings-grid">
          @for (product of products(); track product.id) {
            <div class="listing-card">
              <a [routerLink]="['/dashboard/product', product.id]" class="listing-link">
                <div class="listing-image">
                  <img [src]="productService.getProductImage(product)" [alt]="product.title">
                  <div class="status-badge" [class.available]="product.is_available" [class.sold]="!product.is_available">
                    {{ product.is_available ? 'Available' : 'Not Available' }}
                  </div>
                </div>
                <div class="listing-info">
                  <span class="listing-category">{{ product.category?.name }}</span>
                  <h3>{{ product.title }}</h3>
                  <div class="listing-footer">
                    <div class="listing-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</div>
                    <div class="listing-date">{{ formatDate(product.created_at) }}</div>
                  </div>
                </div>
              </a>
              <div class="listing-actions">
                <button class="btn-toggle" (click)="toggleAvailability(product)">
                  {{ product.is_available ? 'Not Available' : 'Available Now' }}
                </button>
                <a [routerLink]="['/dashboard/sell']" [queryParams]="{ id: product.id }" class="btn-edit" title="Edit listing">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/>
                  </svg>
                </a>
                <button class="btn-delete" (click)="deleteProduct(product.id)" title="Delete listing">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .my-listings-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .page-header p {
      color: #64748b;
      margin: 0;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .btn-primary svg {
      width: 20px;
      height: 20px;
    }

    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .listing-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .listing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    .listing-link {
      text-decoration: none;
      color: inherit;
      flex: 1;
    }

    .listing-image {
      position: relative;
      height: 180px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .listing-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .listing-card:hover .listing-image img {
      transform: scale(1.05);
    }

    .placeholder-image { color: #cbd5e1; }
    .placeholder-image svg { width: 48px; height: 48px; }

    .status-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.375rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.available { background: #d1fae5; color: #059669; }
    .status-badge.sold { background: #fee2e2; color: #dc2626; }

    .listing-info { padding: 1.25rem; }

    .listing-category {
      font-size: 0.75rem;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .listing-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0.5rem 0;
      line-height: 1.4;
    }

    .listing-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
    }

    .listing-price { font-size: 1.125rem; font-weight: 700; color: #059669; }
    .listing-date { font-size: 0.75rem; color: #94a3b8; }

    .listing-actions {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-top: 1px solid #f1f5f9;
      background: #fafafa;
    }

    .btn-toggle {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
      background: white;
      color: #475569;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-toggle:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .btn-edit {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
      background: white;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      text-decoration: none;
    }

    .btn-edit:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .btn-delete {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1.5px solid #fee2e2;
      background: white;
      color: #dc2626;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .btn-delete:hover {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
    }

    .btn-delete svg, .btn-edit svg { width: 16px; height: 16px; }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-icon { width: 80px; height: 80px; margin: 0 auto 1rem; color: #cbd5e1; }
    .empty-icon svg { width: 100%; height: 100%; }

    .empty-state h3 { font-size: 1.25rem; color: #1e293b; margin: 0 0 0.5rem; }
    .empty-state p { color: #64748b; margin: 0 0 2rem; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in { animation: fadeIn 0.5s ease-out; }

    @media (max-width: 768px) {
      .my-listings-container {
        padding: 1.5rem 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
      }

      .btn-primary {
        width: 100%;
        justify-content: center;
      }

      .listings-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
    }
  `]
})
export class MyListingsComponent implements OnInit {
  private authService = inject(AuthService);
  productService = inject(ProductService);

  products = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit() {
    // Try user() first, fall back to profile() which is also stored in localStorage
    const user = this.authService.user();
    const profile = this.authService.profile();
    const userId = user?.id || profile?.id;

    if (!userId) {
      console.warn('MyListings: No user ID found, showing empty state');
      this.loading.set(false);
      return;
    }

    try {
      const result = await this.productService.getUserProducts(userId);
      this.products.set(result || []);
    } catch (error) {
      console.error('Failed to load listings:', error);
      this.products.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleAvailability(product: any) {
    try {
      await this.productService.updateProduct(product.id, {
        is_available: !product.is_available
      });
      // Update in signal array
      this.products.update(list =>
        list.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p)
      );
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  }

  async deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await this.productService.deleteProduct(id);
      this.products.update(list => list.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
