import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, FormsModule],
  template: `
    <div class="product-detail-container fade-in">
      @if (loading) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Loading product details...</p>
        </div>
      } @else if (product) {
        <div class="breadcrumb">
          <a routerLink="/dashboard/buy">Products</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span>{{ product.title }}</span>
        </div>

        <div class="product-layout">
          <div class="product-gallery">
            <div class="main-image">
              <img [src]="selectedImage || productService.getProductImage(product)" [alt]="product.title">
            </div>
            @if (product.images && product.images.length > 1) {
              <div class="image-thumbnails">
                @for (image of product.images; track $index) {
                  <button
                    class="thumbnail"
                    [class.active]="selectedImage === image"
                    (click)="selectedImage = image"
                  >
                    <img [src]="image" [alt]="product.title + ' thumbnail'">
                  </button>
                }
              </div>
            }
          </div>

          <div class="product-details">
            <div class="product-header">
              <span class="product-category">{{ product.category?.name }}</span>
              <h1>{{ product.title }}</h1>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;">
                <div class="condition-badge" [ngClass]="product.condition">
                  {{ formatCondition(product.condition) }}
                </div>
                @if (product.is_blocked) {
                  <div class="blocked-badge">
                    Blocked by Admin
                  </div>
                }
              </div>
            </div>

            <div class="price-section">
              <div class="price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</div>
              @if (!product.is_available) {
                <span class="sold-badge">Not Available</span>
              }
            </div>

            <div class="description-section">
              <h2>Description</h2>
              <p>{{ product.description }}</p>
            </div>

            @if (product.location) {
              <div class="location-section">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ product.location }}</span>
              </div>
            }

            <div class="seller-section">
              <h3>Seller Information</h3>
              <div class="seller-card">
                <div 
                  class="seller-avatar"
                  [style.background]="product.seller?.avatar_url ? 'url(' + product.seller.avatar_url + ') center/cover no-repeat' : (product.seller?.active_gradient || 'linear-gradient(135deg, #667eea, #764ba2)')"
                >
                  @if (!product.seller?.avatar_url) {
                    {{ getSellerInitials() }}
                  }
                </div>
                <div class="seller-details">
                  <span class="seller-name">{{ getSellerName() }}</span>
                  <span class="seller-college">{{ getSellerCollege() }}</span>
                  @if (getSellerEmail()) {
                    <a [href]="'mailto:' + getSellerEmail()" class="seller-email" style="font-size: 0.875rem; color: #6366f1; text-decoration: none; margin-top: 0.25rem; font-weight: 500;">
                      {{ getSellerEmail() }}
                    </a>
                  }
                </div>
              </div>
              @if (product.seller?.phone && isOwner) {
                <div class="contact-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{{ product.seller.phone }}</span>
                </div>
              }
            </div>

            @if (isAdmin) {
              <div class="admin-controls-card">
                <div class="admin-badge-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>ADMIN CONTROL ACTIVE</span>
                </div>
                <p class="admin-desc">You have full moderation rights over this listing.</p>
                
                @if (!product.is_blocked) {
                  <div class="admin-comment-group">
                    <label for="adminBlockReason" class="admin-comment-label">Reason for blocking (optional):</label>
                    <textarea 
                      id="adminBlockReason" 
                      [(ngModel)]="adminBlockReason" 
                      placeholder="e.g. Inappropriate content, spam, incorrect pricing..." 
                      class="admin-comment-textarea"
                      rows="3"
                    ></textarea>
                  </div>
                } @else {
                  <div class="admin-blocked-info">
                    <div class="blocked-status-indicator">
                      <span class="indicator-dot"></span>
                      <strong>Status: Blocked / Suspended</strong>
                    </div>
                    @if (product.blocked_reason) {
                      <div class="active-reason-box">
                        <strong>Reason:</strong> "{{ product.blocked_reason }}"
                      </div>
                    }
                  </div>
                }

                <div class="admin-actions-row">
                  <button class="btn-admin-block" [class.unblock]="product.is_blocked" (click)="toggleBlock()">
                    @if (product.is_blocked) {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" style="margin-right: 4px; display: inline-block; vertical-align: middle;">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      Unblock Listing
                    } @else {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" style="margin-right: 4px; display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                      Block Listing
                    }
                  </button>
                  <button class="btn-admin-delete" (click)="deleteProduct()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" style="margin-right: 4px; display: inline-block; vertical-align: middle;">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Delete Listing
                  </button>
                </div>
              </div>
            } @else if (product.is_blocked) {
              <div class="blocked-listing-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                <p>This listing has been suspended by the marketplace administrator.</p>
                @if (product.blocked_reason) {
                  <div class="blocked-reason-box">
                    <strong>Reason:</strong> {{ product.blocked_reason }}
                  </div>
                }
                @if (isOwner) {
                  <p class="edit-unblock-hint">Please edit this listing to correct any violations and request an automatic unblock.</p>
                  <a [routerLink]="['/dashboard/sell']" [queryParams]="{ id: product.id }" class="btn-edit-unblock">
                    Edit Listing to Unblock
                  </a>
                }
              </div>
            } @else if (isOwner) {
              <div class="owner-actions">
                <button class="btn-secondary" (click)="toggleAvailability()">
                  {{ product.is_available ? 'Mark as Sold' : 'Mark as Available' }}
                </button>
                <button class="btn-danger" (click)="deleteProduct()">
                  Delete Listing
                </button>
              </div>
            } @else if (product.is_available) {
              <div class="contact-seller-block">
                <button class="btn-contact-seller" (click)="contactSeller()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Contact Seller via Email
                </button>
                @if (getSellerEmail()) {
                  <p class="seller-email-hint">Opens your mail app with a pre-filled message to<br><strong>{{ getSellerEmail() }}</strong></p>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="not-found">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <a routerLink="/dashboard/buy" class="btn-primary">Browse Products</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: #764ba2;
    }

    .breadcrumb svg {
      width: 16px;
      height: 16px;
      color: #cbd5e1;
    }

    .breadcrumb span {
      color: #64748b;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    .product-gallery {
      position: sticky;
      top: 100px;
      align-self: start;
    }

    .main-image {
      aspect-ratio: 4/3;
      border-radius: 16px;
      overflow: hidden;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      color: #cbd5e1;
    }

    .placeholder-image svg {
      width: 80px;
      height: 80px;
    }

    .image-thumbnails {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
      background: none;
    }

    .thumbnail.active {
      border-color: #667eea;
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .product-header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .product-category {
      font-size: 0.875rem;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.3;
    }

    .condition-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: capitalize;
      width: fit-content;
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

    .price-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #059669;
    }

    .sold-badge {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .description-section h2, .seller-section h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1rem;
    }

    .description-section p {
      color: #475569;
      line-height: 1.8;
      margin: 0;
    }

    .location-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
    }

    .location-section svg {
      width: 20px;
      height: 20px;
    }

    .seller-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
    }

    .seller-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
    }

    .seller-details {
      display: flex;
      flex-direction: column;
    }

    .seller-name {
      font-weight: 600;
      color: #1e293b;
    }

    .seller-college {
      font-size: 0.875rem;
      color: #64748b;
    }

    .contact-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #dbeafe;
      color: #2563eb;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .contact-info svg {
      width: 18px;
      height: 18px;
    }

    .owner-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-danger:hover {
      background: #fecaca;
    }

    .btn-contact {
      margin-top: 1rem;
    }

    .contact-seller-block {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .btn-contact-seller {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem 1.5rem;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
      letter-spacing: 0.01em;
    }

    .btn-contact-seller:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(102, 126, 234, 0.5);
    }

    .btn-contact-seller:active {
      transform: translateY(0);
    }

    .seller-email-hint {
      font-size: 0.8125rem;
      color: #64748b;
      text-align: center;
      line-height: 1.5;
      margin: 0;
    }

    .seller-email-hint strong {
      color: #4648d4;
    }

    .loading-state, .not-found {
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

    .not-found h2 {
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .not-found p {
      color: #64748b;
      margin: 0 0 2rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @media (max-width: 768px) {
      .product-detail-container {
        padding: 1rem;
      }

      .product-layout {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .product-gallery {
        position: static;
      }

      .main-image {
        aspect-ratio: 16/10;
        max-height: 250px;
        border-radius: 12px;
        margin-bottom: 0.75rem;
      }

      .thumbnail {
        width: 60px;
        height: 60px;
        border-radius: 6px;
      }

      .product-details {
        gap: 1.25rem;
      }

      h1 {
        font-size: 1.35rem;
      }

      .price {
        font-size: 1.75rem;
      }

      .description-section h2, .seller-section h3 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      .seller-card {
        padding: 0.75rem;
      }

      .btn-contact-seller {
        padding: 0.875rem 1.25rem;
        font-size: 0.9375rem;
        border-radius: 12px;
      }
    }

    /* ── ADMIN MODERATION PANELS ── */
    .admin-controls-card {
      background: rgba(254, 243, 199, 0.45);
      border: 1.5px solid #fbbf24;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-top: 1rem;
      box-shadow: 0 4px 20px rgba(251, 191, 36, 0.08);
      backdrop-filter: blur(10px);
    }
    .admin-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #d97706;
      font-weight: 700;
      font-size: 0.8125rem;
      letter-spacing: 0.05em;
    }
    .admin-desc {
      font-size: 0.875rem;
      color: #78350f;
      line-height: 1.4;
      margin: 0;
    }
    .admin-comment-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }
    .admin-comment-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .admin-comment-textarea {
      width: 100%;
      padding: 0.75rem;
      border-radius: 10px;
      border: 1.5px solid #fcd34d;
      background: rgba(255, 255, 255, 0.85);
      font-family: inherit;
      font-size: 0.9rem;
      color: #1e293b;
      resize: vertical;
      transition: all 0.25s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      box-sizing: border-box;
    }
    .admin-comment-textarea:focus {
      outline: none;
      border-color: #d97706;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15), inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .admin-blocked-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: rgba(220, 38, 38, 0.05);
      border-radius: 10px;
      padding: 0.75rem;
      border: 1px solid rgba(220, 38, 38, 0.15);
    }
    .blocked-status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #b91c1c;
    }
    .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
      animation: pulse-red 2s infinite;
    }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .active-reason-box {
      font-size: 0.875rem;
      color: #7f1d1d;
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border-left: 3px solid #ef4444;
      line-height: 1.4;
    }
    .admin-actions-row {
      display: flex;
      gap: 0.75rem;
    }
    .btn-admin-block, .btn-admin-delete {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .btn-admin-block {
      background: #fbbf24;
      color: #78350f;
    }
    .btn-admin-block:hover {
      background: #f59e0b;
      transform: translateY(-1px);
    }
    .btn-admin-block.unblock {
      background: #10b981;
      color: white;
    }
    .btn-admin-block.unblock:hover {
      background: #059669;
      transform: translateY(-1px);
    }
    .btn-admin-delete {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .btn-admin-delete:hover {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
      transform: translateY(-1px);
    }
    .blocked-listing-card {
      background: #fee2e2;
      border: 1.5px solid #fca5a5;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      text-align: center;
      color: #dc2626;
      margin-top: 1rem;
    }
    .blocked-listing-card p {
      font-size: 0.9375rem;
      font-weight: 700;
      line-height: 1.5;
      margin: 0;
    }
    .blocked-badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
    }
    .blocked-reason-box {
      margin-top: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(220, 38, 38, 0.05);
      border-left: 3px solid var(--error);
      border-radius: 6px;
      font-size: 0.875rem;
      color: #7f1d1d;
      text-align: left;
      width: 100%;
    }
    .edit-unblock-hint {
      font-size: 0.8125rem !important;
      color: #991b1b !important;
      font-weight: 500 !important;
      margin-top: 0.75rem !important;
    }
    .btn-edit-unblock {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      background: var(--error);
      color: white;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      border-radius: 10px;
      margin-top: 0.5rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }
    .btn-edit-unblock:hover {
      background: #b91c1c;
      transform: translateY(-1px);
      color: white;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  productService = inject(ProductService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  product: any = null;
  loading = true;
  selectedImage = '';
  isOwner = false;
  isAdmin = false;
  adminBlockReason = '';

  async ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      this.product = await this.productService.getProductById(productId);
      if (this.product && this.product.images && this.product.images.length > 0) {
        const firstImg = this.product.images[0];
        if (firstImg && typeof firstImg === 'string' && !firstImg.includes('pexels.com')) {
          this.selectedImage = firstImg;
        } else {
          this.selectedImage = '';
        }
      }

      const currentUser = this.authService.user();
      this.isOwner = currentUser?.id === this.product?.seller_id;
      this.isAdmin = this.authService.isAdmin();
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatCondition(condition: string): string {
    return (condition || '').replace('_', ' ');
  }

  async toggleBlock() {
    if (!this.product) return;

    try {
      const isBlocking = !this.product.is_blocked;
      let reason = '';

      if (isBlocking) {
        reason = this.adminBlockReason.trim() || 'Violated marketplace community guidelines.';
      }

      const updates = {
        is_blocked: isBlocking,
        blocked_reason: isBlocking ? reason : ''
      };

      await this.productService.updateProduct(this.product.id, updates);
      this.product.is_blocked = isBlocking;
      this.product.blocked_reason = updates.blocked_reason;
      this.adminBlockReason = '';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to block product:', error);
    }
  }

  getSellerName(): string {
    if (this.product?.seller?.full_name) {
      return this.product.seller.full_name;
    }
    const id = this.product?.seller_id || 'Student';
    if (id.includes('@')) {
      return id.split('@')[0].split(/[._]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return id.split(/[._]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getSellerCollege(): string {
    return this.product?.seller?.college_name || 'Rathinam University';
  }

  getSellerEmail(): string {
    if (this.product?.seller?.email) {
      return this.product.seller.email;
    }
    if (this.product?.seller_id && this.product.seller_id.includes('@')) {
      return this.product.seller_id;
    }
    return '';
  }

  getSellerInitials(): string {
    const name = this.getSellerName();
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  async toggleAvailability() {
    if (!this.product) return;

    try {
      await this.productService.updateProduct(this.product.id, {
        is_available: !this.product.is_available
      });
      this.product.is_available = !this.product.is_available;
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  }

  async deleteProduct() {
    if (!this.product) return;

    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await this.productService.deleteProduct(this.product.id);
      this.router.navigate(['/my-listings']);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }

  contactSeller() {
    if (!this.product) return;

    const product  = this.product;
    const buyerName = this.authService.profile()?.full_name || 'A fellow student';
    const buyerEmail = this.authService.user()?.email || '';
    const sellerEmail = this.getSellerEmail();
    const sellerName  = this.getSellerName();

    if (!sellerEmail) {
      alert('This seller has not provided an email address.');
      return;
    }

    const condition = (product.condition || '').replace('_', ' ');
    const price     = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price);
    const location  = product.location ? `\nPickup Location : ${product.location}` : '';

    const subject = encodeURIComponent(`[CampusCart] Interested in your listing: "${product.title}"`);

    const body = encodeURIComponent(
`Hi ${sellerName},

I came across your listing on CampusCart and I am very interested in purchasing the following item:

--------------------------------------------------
  Product  : ${product.title}
  Category : ${product.category?.name || 'N/A'}
  Condition: ${condition}
  Price    : ${price}${location}
--------------------------------------------------

Could you please let me know:
  1. Is the item still available?
  2. When and where can we meet on campus for the exchange?
  3. Are you open to any price negotiation?

I look forward to hearing from you soon!

Best regards,
${buyerName}${buyerEmail ? '\n' + buyerEmail : ''}

---
This message was sent via CampusCart Marketplace.
https://campuscart.app`
    );

    window.open(`mailto:${sellerEmail}?subject=${subject}&body=${body}`, '_blank');
  }
}
