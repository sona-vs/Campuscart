import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CurrencyPipe, SlicePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, SlicePipe, NgClass],
  template: `
    <div class="buy-container fade-in">
      <div class="page-header">
        <div class="header-content">
          <h1>Browse Products</h1>
          <p>Find great deals from fellow students</p>
        </div>
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search products..."
            (input)="handleSearch()"
          />
        </div>
      </div>

      <div class="filters-section">
        <div class="categories-filter">
          <button
            class="category-btn"
            [class.active]="selectedCategory === ''"
            (click)="filterByCategory('')"
          >
            All
          </button>
          @for (category of categories(); track category.id) {
            <button
              class="category-btn"
              [class.active]="selectedCategory === category.id"
              (click)="filterByCategory(category.id)"
            >
              {{ category.name }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Loading products...</p>
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
            </svg>
          </div>
          <h3>No Products Found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <a [routerLink]="['/dashboard/product', product.id]" class="product-card">
              <div class="product-image">
                <img [src]="productService.getProductImage(product)" [alt]="product.title">
                <div class="condition-badge" [ngClass]="product.condition">
                  {{ formatCondition(product.condition) }}
                </div>
              </div>
              <div class="product-info">
                <span class="product-category">{{ product.category?.name }}</span>
                <h3>{{ product.title }}</h3>
                <p class="product-description">{{ product.description | slice:0:80 }}...</p>
                <div class="product-footer">
                  <div class="product-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</div>
                  <div class="seller-info">
                    <div class="seller-avatar">
                      {{ getSellerInitials(product) }}
                    </div>
                    <span class="seller-name">{{ product.seller?.full_name }}</span>
                  </div>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .buy-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
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

    .search-bar {
      position: relative;
      width: 100%;
      max-width: 400px;
    }

    .search-bar svg {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: #94a3b8;
    }

    .search-bar input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .categories-filter {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: white;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }

    .product-image {
      position: relative;
      height: 200px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.1);
    }

    .placeholder-image {
      color: #cbd5e1;
    }

    .placeholder-image svg {
      width: 64px;
      height: 64px;
    }

    .condition-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.375rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .condition-badge.new {
      background: #d1fae5;
      color: #059669;
    }

    .condition-badge.like_new {
      background: #dbeafe;
      color: #2563eb;
    }

    .condition-badge.good {
      background: #fef3c7;
      color: #d97706;
    }

    .condition-badge.fair {
      background: #fee2e2;
      color: #dc2626;
    }

    .product-info {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-category {
      font-size: 0.75rem;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .product-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem;
      line-height: 1.4;
    }

    .product-description {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 1rem;
      line-height: 1.5;
      flex: 1;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .product-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #059669;
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .seller-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 600;
    }

    .seller-name {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      color: #cbd5e1;
    }

    .empty-icon svg {
      width: 100%;
      height: 100%;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: #64748b;
      margin: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @media (max-width: 768px) {
      .buy-container {
        padding: 1.5rem 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .search-bar {
        max-width: 100%;
      }

      .categories-filter {
        flex-wrap: nowrap;
        overflow-x: auto;
        padding: 0.25rem 0.25rem 0.75rem;
        margin: 0 -1rem;
        padding-left: 1rem;
        padding-right: 1rem;
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
      }

      .categories-filter::-webkit-scrollbar {
        display: none;
      }

      .category-btn {
        flex-shrink: 0;
        scroll-snap-align: start;
        padding: 0.625rem 1.25rem;
        font-size: 0.8125rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
    }
  `]
})
export class BuyComponent implements OnInit {
  productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  products = this.productService.products;
  categories = this.productService.categories;
  loading = this.productService.loading;

  searchQuery = '';
  selectedCategory = '';
  private searchTimeout: any;

  ngOnInit() {
    if (this.categories().length === 0) {
      this.productService.loadCategories();
    }
    // Read category from query param (set by dashboard category cards)
    this.route.queryParams.subscribe(params => {
      const catId = params['category'];
      if (catId) {
        // Wait for categories to load if needed, then filter
        const doFilter = () => {
          this.selectedCategory = catId;
          this.productService.loadProducts(catId);
        };
        if (this.categories().length > 0) {
          doFilter();
        } else {
          // Poll briefly until categories are loaded
          const interval = setInterval(() => {
            if (this.categories().length > 0) {
              clearInterval(interval);
              doFilter();
            }
          }, 100);
          setTimeout(() => clearInterval(interval), 3000);
        }
      } else {
        this.selectedCategory = '';
        this.productService.loadProducts();
      }
    });
  }

  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.productService.loadProducts(categoryId || undefined);
  }

  handleSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(async () => {
      if (this.searchQuery.trim()) {
        const results = await this.productService.searchProducts(this.searchQuery);
        this.productService.products.set(results || []);
      } else {
        this.productService.loadProducts(this.selectedCategory || undefined);
      }
    }, 300);
  }

  formatCondition(condition: string): string {
    return condition.replace('_', ' ');
  }

  getSellerInitials(product: any): string {
    const name = product.seller?.full_name || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
