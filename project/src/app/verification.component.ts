import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="verification-container fade-in">
      <div class="page-header">
        <div class="badge">Moderator Control Panel</div>
        <h1>Moderation Control</h1>
        <p>Review products that were suspended and recently edited by sellers, or view the active student registry.</p>
      </div>

      <!-- Admin Moderator Navigation Tab Bar -->
      <div class="mod-tab-bar">
        <button class="mod-tab-btn" [class.active]="activeTab === 'verification'" (click)="setTab('verification')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          Verification Queue ({{ pendingProducts.length }})
        </button>
        <button class="mod-tab-btn" [class.active]="activeTab === 'directory'" (click)="setTab('directory')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          User Directory ({{ allUsers.length }})
        </button>
      </div>

      @if (activeTab === 'verification') {
        @if (loading) {
          <div class="loading-state">
            <div class="spinner-large"></div>
            <p>Loading pending reviews...</p>
          </div>
        } @else if (pendingProducts.length === 0) {
          <div class="empty-state">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>All Caught Up!</h2>
            <p>There are no listings waiting for moderator verification right now.</p>
          </div>
        } @else {
          <div class="review-grid">
            @for (product of pendingProducts; track product.id) {
              <div class="review-card">
                <div class="card-image-wrap">
                  <img [src]="productService.getProductImage(product)" [alt]="product.title">
                  <span class="category-badge">{{ product.category?.name }}</span>
                </div>
                
                <div class="card-body">
                  <div class="card-title-row">
                    <h3>{{ product.title }}</h3>
                    <span class="price-badge">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                  
                  <div class="seller-meta">
                    <span class="label">Seller:</span>
                    <strong>{{ getSellerName(product) }}</strong>
                    <span class="college">({{ getSellerCollege(product) }})</span>
                  </div>

                  <div class="violator-warning">
                    <div class="warning-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Previous Suspended Reason:
                    </div>
                    <p class="warning-reason">"{{ product.blocked_reason || 'Violated community guidelines.' }}"</p>
                  </div>

                  <div class="description-preview">
                    <span class="label">Updated Description:</span>
                    <p class="desc-text">{{ product.description }}</p>
                  </div>

                  <div class="decision-box">
                    <div class="feedback-group">
                      <label for="reject-reason-{{product.id}}" class="feedback-label">Mod Comment (if rejecting):</label>
                      <input 
                        type="text" 
                        [id]="'reject-reason-' + product.id"
                        [(ngModel)]="feedbackReasons[product.id]" 
                        placeholder="Why is this still blocked? (e.g. Price still too high)" 
                        class="feedback-input"
                      >
                    </div>

                    <div class="actions-row">
                      <button class="btn-approve" (click)="approveProduct(product)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Approve & Unblock
                      </button>
                      <button class="btn-reject" (click)="rejectProduct(product)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Reject & Keep Blocked
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      @if (activeTab === 'directory') {
        <div class="directory-section slide-down">
          <!-- Stat Banner -->
          <div class="stat-banner">
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Registered Students</span>
                <span class="stat-value">{{ allUsers.length }}</span>
              </div>
            </div>
          </div>

          <!-- User List Table/Cards -->
          <div class="users-list-card">
            <div class="list-header">
              <h2>Student Registry</h2>
              <p>Overview of all active accounts in the campus ecosystem</p>
            </div>
            
            <div class="table-responsive">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Student Profile</th>
                    <th>Email Address</th>
                    <th>Campus/College</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of allUsers; track user.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div 
                            class="user-avatar" 
                            [style.background]="user.avatar_url ? 'url(' + user.avatar_url + ') center/cover no-repeat' : (user.active_gradient || 'linear-gradient(135deg, #6366f1, #a855f7)')"
                          >
                            @if (!user.avatar_url) {
                              {{ getUserInitials(user) }}
                            }
                          </div>
                          <div class="user-details">
                            <span class="user-name">{{ user.full_name }}</span>
                            <span class="user-id">ID: @{{ user.id }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="user-email-text">{{ user.email || 'N/A' }}</span>
                      </td>
                      <td>
                        <span class="college-tag">{{ user.college_name || 'Rathinam University' }}</span>
                      </td>
                      <td>
                        <span class="joined-date">{{ user.created_at | date:'d MMM YYYY' }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .verification-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    
    .page-header {
      margin-bottom: 2.5rem;
      text-align: left;
    }
    
    .badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      background: #fef3c7;
      color: #d97706;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      border: 1px solid #fcd34d;
    }
    
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }
    
    .page-header p {
      color: #475569;
      font-size: 1rem;
      line-height: 1.6;
      max-width: 700px;
      margin: 0;
    }
    
    .loading-state {
      text-align: center;
      padding: 5rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }
    
    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.25rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: #f0fdf4;
      border: 1.5px dashed #bbf7d0;
      border-radius: 24px;
      color: #166534;
      max-width: 600px;
      margin: 2rem auto;
    }
    
    .success-icon {
      width: 64px;
      height: 64px;
      background: #dcfce7;
      color: #15803d;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    
    .success-icon svg {
      width: 32px;
      height: 32px;
    }
    
    .empty-state h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }
    
    .empty-state p {
      color: #166534;
      opacity: 0.85;
      margin: 0;
      font-size: 0.95rem;
    }
    
    .review-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .review-card {
      display: grid;
      grid-template-columns: 280px 1fr;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      transition: all 0.3s ease;
    }
    
    .review-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    
    .card-image-wrap {
      position: relative;
      background: #f8fafc;
      overflow: hidden;
    }
    
    .card-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      min-height: 220px;
    }
    
    .category-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      letter-spacing: 0.02em;
    }
    
    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .card-title-row h3 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
    }
    
    .price-badge {
      font-size: 1.25rem;
      font-weight: 700;
      color: #10b981;
      white-space: nowrap;
    }
    
    .seller-meta {
      font-size: 0.875rem;
      color: #64748b;
      background: #f8fafc;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      width: fit-content;
    }
    
    .seller-meta .label {
      color: #94a3b8;
      margin-right: 0.25rem;
    }
    
    .seller-meta .college {
      color: #94a3b8;
      margin-left: 0.25rem;
    }
    
    .violator-warning {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 12px;
      padding: 0.75rem 1rem;
    }
    
    .warning-title {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .warning-reason {
      font-size: 0.875rem;
      color: #78350f;
      margin: 0.35rem 0 0;
      font-style: italic;
      font-weight: 500;
    }
    
    .description-preview {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .description-preview .label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .desc-text {
      font-size: 0.9rem;
      color: #334155;
      line-height: 1.5;
      margin: 0;
    }
    
    .decision-box {
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-radius: 14px;
      padding: 1rem;
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .feedback-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    
    .feedback-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    
    .feedback-input {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
      font-family: inherit;
      font-size: 0.85rem;
      color: #1e293b;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    
    .feedback-input:focus {
      outline: none;
      border-color: #cbd5e1;
      box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
    }
    
    .actions-row {
      display: flex;
      gap: 0.75rem;
    }
    
    .btn-approve, .btn-reject {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      transition: all 0.25s ease;
    }
    
    .btn-approve {
      background: #10b981;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
    
    .btn-approve:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
    }
    
    .btn-reject {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    
    .btn-reject:hover {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    /* ── ADMIN MOD NAVIGATION TABS ── */
    .mod-tab-bar {
      display: flex;
      gap: 1rem;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }

    .mod-tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      color: #64748b;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .mod-tab-btn:hover {
      background: #f1f5f9;
      color: #334155;
    }

    .mod-tab-btn.active {
      background: #e0e7ff;
      color: #4f46e5;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
    }

    /* ── USER DIRECTORY ── */
    .stat-banner {
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 1.5rem 2rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
      width: fit-content;
      min-width: 320px;
    }

    .stat-icon {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      background: #e0e7ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.1);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }

    .users-list-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
      margin-bottom: 2.5rem;
    }

    .list-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1rem;
    }

    .list-header h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem;
    }

    .list-header p {
      color: #64748b;
      margin: 0;
      font-size: 0.9rem;
    }

    .table-responsive {
      overflow-x: auto;
      width: 100%;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .users-table th {
      padding: 1rem;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #f1f5f9;
    }

    .users-table td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      font-size: 0.9375rem;
      vertical-align: middle;
    }

    .users-table tbody tr:hover {
      background: #f8fafc;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .user-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .user-id {
      font-size: 0.75rem;
      color: #94a3b8;
      font-family: monospace;
    }

    .user-email-text {
      color: #475569;
      font-weight: 500;
    }

    .college-tag {
      background: #f1f5f9;
      color: #475569;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
      border: 1px solid #e2e8f0;
      display: inline-block;
    }

    .joined-date {
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .slide-down {
      animation: slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
    }
    
    @media (max-width: 768px) {
      .review-card {
        grid-template-columns: 1fr;
      }
      .card-image-wrap img {
        min-height: 180px;
        max-height: 200px;
      }
    }
  `]
})
export class VerificationComponent implements OnInit {
  productService = inject(ProductService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  pendingProducts: any[] = [];
  feedbackReasons: Record<string, string> = {};
  loading = true;

  activeTab: 'verification' | 'directory' = 'verification';
  allUsers: any[] = [];

  async ngOnInit() {
    await Promise.all([
      this.loadPending(),
      this.loadUsers()
    ]);
  }

  async loadPending() {
    this.loading = true;
    try {
      this.pendingProducts = await this.productService.loadVerificationPendingProducts();
    } catch (error) {
      console.error('Failed to load pending reviews:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadUsers() {
    try {
      this.allUsers = await this.productService.loadAllProfiles();
    } catch (e) {
      console.error('Failed to load user profiles:', e);
    }
  }

  setTab(tab: 'verification' | 'directory') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  getUserInitials(user: any): string {
    const name = user.full_name || 'Student';
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getSellerName(product: any): string {
    if (product.seller?.full_name) return product.seller.full_name;
    return product.seller_id || 'Student';
  }

  getSellerCollege(product: any): string {
    return product.seller?.college_name || 'Rathinam University';
  }

  async approveProduct(product: any) {
    try {
      const updates = {
        is_blocked: false,
        blocked_reason: '',
        verification_pending: false
      };
      await this.productService.updateProduct(product.id, updates);
      this.pendingProducts = this.pendingProducts.filter(p => p.id !== product.id);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to approve product:', error);
    }
  }

  async rejectProduct(product: any) {
    try {
      const customReason = this.feedbackReasons[product.id]?.trim() || '';
      const updates = {
        is_blocked: true,
        blocked_reason: customReason || product.blocked_reason || 'Violated marketplace community guidelines.',
        verification_pending: false
      };
      await this.productService.updateProduct(product.id, updates);
      this.pendingProducts = this.pendingProducts.filter(p => p.id !== product.id);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to reject product:', error);
    }
  }
}
