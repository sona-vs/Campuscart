import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lost-found',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass],
  template: `
    <div class="notices-container fade-in">
      <div class="page-header-row">
        <div class="page-header">
          <div class="badge">Campus Hub</div>
          <h1>Lost & Found Board</h1>
          <p>Misplaced something or found an item on campus? Report it below to connect with the owner.</p>
        </div>
        <button class="btn-primary" (click)="toggleCreateForm()">
          {{ showForm ? 'Close Report Form' : 'Report Lost/Found Item' }}
        </button>
      </div>

      <!-- Create Report Card -->
      @if (showForm) {
        <div class="create-notice-card slide-down">
          <div class="card-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <h2>Report an Item</h2>
          </div>

          <form (ngSubmit)="submitNotice()" class="notice-form">
            <div class="form-row">
              <div class="form-group">
                <label for="title">Item Name *</label>
                <input 
                  type="text" 
                  id="title" 
                  [(ngModel)]="title" 
                  name="title" 
                  placeholder="e.g. Lost Black AirPods Pro near Library"
                  required
                >
              </div>
              <div class="form-group">
                <label for="type">Status *</label>
                <select id="type" [(ngModel)]="type" name="type" required>
                  <option value="lost">🔴 Lost</option>
                  <option value="found">🟢 Found</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="contactInfo">Contact Info * (Email / Phone)</label>
                <input 
                  type="text" 
                  id="contactInfo" 
                  [(ngModel)]="contactInfo" 
                  name="contactInfo" 
                  placeholder="e.g. Contact Sona via +91 98765 43210"
                  required
                >
              </div>
              <div class="form-group">
                <label for="location">Location Lost/Found *</label>
                <input 
                  type="text" 
                  id="location" 
                  [(ngModel)]="location" 
                  name="location" 
                  placeholder="e.g. Near Block-B Canteen bench"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label>Upload Item Photo *</label>
              <div class="image-upload-container">
                @if (!imageUrl) {
                  <label class="image-upload-dropzone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Click to upload item image</span>
                    <input type="file" accept="image/*" (change)="handleItemImageUpload($event)" style="display: none;">
                  </label>
                } @else {
                  <div class="item-image-preview">
                    <img [src]="imageUrl" alt="Preview">
                    <button type="button" class="remove-preview-btn" (click)="removeItemImage()">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="description">Detailed Description *</label>
              <textarea 
                id="description" 
                [(ngModel)]="description" 
                name="description" 
                rows="4" 
                placeholder="Describe key identifying marks, color, brand, or specific time it was lost/discovered..."
                required
              ></textarea>
            </div>

            @if (error) {
              <div class="error-message shake">{{ error }}</div>
            }
            @if (success) {
              <div class="success-message">{{ success }}</div>
            }

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="toggleCreateForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="submitting">
                @if (submitting) {
                  <span class="spinner"></span>
                } @else {
                  <span>Publish Report</span>
                }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Status Filter Badges -->
      <div class="filter-badges-row">
        <button class="badge-btn" [class.active]="activeType === 'all'" (click)="filterType('all')">
          🌐 All Items
        </button>
        <button class="badge-btn lost" [class.active]="activeType === 'lost'" (click)="filterType('lost')">
          🔴 Lost Items
        </button>
        <button class="badge-btn found" [class.active]="activeType === 'found'" (click)="filterType('found')">
          🟢 Found Items
        </button>
      </div>

      <!-- Main Notices List -->
      @if (loading) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Loading Lost & Found board...</p>
        </div>
      } @else if (filteredNotices.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h2>No Reports Found</h2>
          <p>No listings are active in this category on your campus. Be the first to post!</p>
        </div>
      } @else {
        <div class="notices-grid">
          @for (n of filteredNotices; track n.id) {
            <div class="notice-card" [ngClass]="n.type">
              <div class="notice-card-header">
                <span class="type-badge" [ngClass]="n.type">
                  {{ n.type === 'lost' ? '🔴 LOST' : '🟢 FOUND' }}
                </span>
                <span class="time-stamp">{{ n.created_at | date:'d MMM, h:mm a' }}</span>
              </div>

              <div class="notice-card-body">
                <h3>{{ n.title }}</h3>
                <p class="notice-desc">{{ n.description }}</p>

                @if (n.image_url) {
                  <div class="notice-img-wrap">
                    <img [src]="n.image_url" [alt]="n.title">
                  </div>
                }

                <div class="notice-meta">
                  @if (n.location) {
                    <div class="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>Location: <strong>{{ n.location }}</strong></span>
                    </div>
                  }
                  <div class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>Contact: <strong>{{ n.contact_info }}</strong></span>
                  </div>
                </div>
              </div>

              <div class="notice-card-footer">
                <div class="author-info">
                  <div class="avatar-sm" [style.background]="n.creator?.active_gradient || 'linear-gradient(135deg, #667eea, #764ba2)'">
                    @if (n.creator?.avatar_url) {
                      <img [src]="n.creator.avatar_url" alt="avatar">
                    } @else {
                      {{ getAuthorInitials(n) }}
                    }
                  </div>
                  <div class="author-details">
                    <span class="author-name">{{ n.creator?.full_name || 'Student' }}</span>
                    <span class="author-college">{{ n.creator?.college_name || 'Rathinam University' }}</span>
                  </div>
                </div>

                @if (isCreator(n)) {
                  <button class="btn-delete" (click)="deleteNotice(n.id)" title="Remove Report">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Delete
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Gorgeous Success Animation Overlay -->
    @if (showSuccessOverlay) {
      <div class="success-overlay-backdrop">
        <div class="success-overlay-card">
          <!-- Pulsing Checkmark Ring -->
          <div class="success-checkmark-wrapper">
            <div class="success-checkmark-pulse"></div>
            <div class="success-checkmark-circle">
              <svg class="checkmark-icon" viewBox="0 0 52 52">
                <circle class="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>
          
          <h2 class="overlay-title">Report Published!</h2>
          <p class="overlay-message">
            Your item report has been successfully published to the campus Lost & Found board.
          </p>

          <!-- Decorative floating sparkles -->
          <div class="sparkles-container">
            <span class="sparkle s1">✨</span>
            <span class="sparkle s2">🎉</span>
            <span class="sparkle s3">✨</span>
          </div>
          
          <div class="loading-bar-wrapper">
            <div class="loading-bar-fill"></div>
          </div>
          <span class="redirect-hint">Updating Lost & Found Board...</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .notices-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .page-header {
      text-align: left;
    }

    .badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      background: #fee2e2;
      color: #dc2626;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      border: 1px solid rgba(239, 68, 68, 0.2);
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
      max-width: 600px;
      margin: 0;
    }

    /* ── CREATE NOTICE FORM ── */
    .create-notice-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 2rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.75rem;
    }

    .card-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .notice-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .form-group input, .form-group textarea, .form-group select {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      font-family: inherit;
      font-size: 0.9375rem;
      color: #0f172a;
      transition: all 0.25s ease;
      box-sizing: border-box;
      background: #fafafa;
    }

    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: #ef4444;
      background: white;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      padding: 0.75rem 1rem;
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      border-radius: 6px;
      color: #742a2a;
      font-size: 0.875rem;
    }

    .success-message {
      padding: 0.75rem 1rem;
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      border-radius: 6px;
      color: #14532d;
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    /* ── FILTER BADGES ── */
    .filter-badges-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .badge-btn {
      padding: 0.6rem 1.25rem;
      border-radius: 50px;
      border: 1.5px solid #e2e8f0;
      background: white;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.25s ease;
    }

    .badge-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .badge-btn.active {
      background: #4648d4;
      border-color: #4648d4;
      color: white;
      box-shadow: 0 4px 12px rgba(70, 72, 212, 0.2);
    }

    .badge-btn.lost.active { background: #ef4444; border-color: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
    .badge-btn.found.active { background: #10b981; border-color: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }

    /* ── NOTICES GRID ── */
    .notices-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .notice-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.015);
      border-left: 5px solid #cbd5e1;
      transition: all 0.25s ease;
    }

    .notice-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.04);
    }

    .notice-card.lost { border-left-color: #ef4444; }
    .notice-card.found { border-left-color: #10b981; }

    .notice-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .type-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }

    .type-badge.lost { background: #fee2e2; color: #dc2626; }
    .type-badge.found { background: #d1fae5; color: #059669; }

    .time-stamp {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .notice-card-body h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .notice-desc {
      font-size: 0.95rem;
      color: #334155;
      line-height: 1.6;
      margin: 0 0 1rem;
    }

    .notice-img-wrap {
      max-height: 350px;
      overflow: hidden;
      border-radius: 12px;
      margin-bottom: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      justify-content: center;
    }

    .notice-img-wrap img {
      max-width: 100%;
      height: auto;
      max-height: 350px;
      object-fit: contain;
    }

    .notice-meta {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: #64748b;
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .meta-item svg {
      color: #94a3b8;
    }

    /* ── FOOTER AUTHOR ── */
    .notice-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.85rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      overflow: hidden;
    }

    .avatar-sm img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-details {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.2;
    }

    .author-college {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.2;
    }

    .btn-delete {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s;
    }

    .btn-delete:hover {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
    }

    /* ── MISC UTILS ── */
    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(236, 72, 153, 0.4);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: white;
      border-radius: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      border: 1px solid #e2e8f0;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #f43f5e;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.25rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: #64748b;
      margin: 0;
      font-size: 0.9375rem;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      background: #f1f5f9;
      color: #94a3b8;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon svg {
      width: 32px;
      height: 32px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .slide-down {
      animation: slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .shake { animation: shake 0.4s ease-in-out; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in { animation: fadeIn 0.4s ease-out; }

    .image-upload-container {
      margin-top: 0.25rem;
      width: 100%;
    }
    .image-upload-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem 1.5rem;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      cursor: pointer;
      background: #fafafa;
      color: #64748b;
      transition: all 0.2s ease;
      text-align: center;
    }
    .image-upload-dropzone:hover {
      background: #f1f5f9;
      border-color: #f43f5e;
      color: #f43f5e;
    }
    .image-upload-dropzone svg {
      color: #94a3b8;
      transition: color 0.2s;
    }
    .image-upload-dropzone:hover svg {
      color: #f43f5e;
    }
    .image-upload-dropzone span {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .item-image-preview {
      position: relative;
      width: 100%;
      max-height: 200px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .item-image-preview img {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
    }
    .remove-preview-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    }

    /* ── SUCCESS OVERLAY & MICRO-ANIMATION ── */
    .success-overlay-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: backdropFadeIn 0.3s ease-out both;
    }

    .success-overlay-card {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(99, 102, 241, 0.15);
      border-radius: 28px;
      padding: 3rem 2.5rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      position: relative;
      overflow: hidden;
      animation: cardScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .success-checkmark-wrapper {
      position: relative;
      width: 90px;
      height: 90px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success-checkmark-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(16, 185, 129, 0.15);
      border-radius: 50%;
      animation: pingPulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    .success-checkmark-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
      z-index: 1;
    }

    .checkmark-icon {
      width: 44px;
      height: 44px;
      stroke: white;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .checkmark-circle-path {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 4;
      stroke-miterlimit: 10;
      stroke: rgba(255,255,255,0.4);
      fill: none;
      animation: strokeCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check-path {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: strokeCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
    }

    .overlay-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }

    .overlay-message {
      color: #475569;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 2rem;
    }

    /* Loading / progress bar */
    .loading-bar-wrapper {
      width: 100%;
      height: 6px;
      background: #f1f5f9;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .loading-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #10b981);
      width: 0%;
      border-radius: 10px;
      animation: fillProgress 2.2s linear forwards;
    }

    .redirect-hint {
      color: #64748b;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      display: inline-block;
    }

    /* Sparkles / confetti */
    .sparkles-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .sparkle {
      position: absolute;
      font-size: 1.5rem;
      opacity: 0;
    }

    .s1 {
      top: 25%;
      left: 15%;
      animation: floatSparkle1 2s ease-out infinite;
    }

    .s2 {
      top: 20%;
      right: 15%;
      animation: floatSparkle2 2.2s ease-out infinite 0.3s;
    }

    .s3 {
      bottom: 30%;
      left: 20%;
      animation: floatSparkle3 1.8s ease-out infinite 0.6s;
    }

    /* ── ANIMATION KEYFRAMES ── */
    @keyframes backdropFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes cardScaleIn {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes pingPulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    @keyframes strokeCircle {
      100% { stroke-dashoffset: 0; }
    }

    @keyframes strokeCheck {
      100% { stroke-dashoffset: 0; }
    }

    @keyframes fillProgress {
      0% { width: 0%; }
      100% { width: 100%; }
    }

    @keyframes floatSparkle1 {
      0% { transform: translate(0, 20px) scale(0.6); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translate(-10px, -20px) scale(1); opacity: 0; }
    }

    @keyframes floatSparkle2 {
      0% { transform: translate(0, 20px) scale(0.6); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translate(15px, -25px) scale(1.1); opacity: 0; }
    }

    @keyframes floatSparkle3 {
      0% { transform: translate(0, 15px) scale(0.6); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translate(-5px, -15px) scale(1); opacity: 0; }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      .form-actions {
        flex-direction: column-reverse;
      }
      .form-actions button {
        width: 100%;
      }

      /* Responsive success overlay settings for mobile */
      .success-overlay-card {
        padding: 2.25rem 1.5rem;
        max-width: 320px;
        border-radius: 24px;
      }

      .overlay-title {
        font-size: 1.4rem;
      }

      .overlay-message {
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }

      .success-checkmark-wrapper {
        width: 70px;
        height: 70px;
      }

      .success-checkmark-circle {
        width: 60px;
        height: 60px;
      }

      .checkmark-icon {
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class NoticesComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  noticesList: any[] = [];
  filteredNotices: any[] = [];
  
  activeType: 'all' | 'lost' | 'found' = 'all';
  showForm = false;
  loading = true;
  showSuccessOverlay = false;

  // Posting Form State
  title = '';
  type: 'lost' | 'found' = 'lost';
  contactInfo = '';
  location = '';
  imageUrl = '';
  description = '';

  submitting = false;
  error = '';
  success = '';

  async ngOnInit() {
    await this.loadNotices();
  }

  async loadNotices() {
    this.loading = true;
    try {
      this.noticesList = await this.productService.loadNotices();
      this.applyFilter();
    } catch (e) {
      console.error('Failed to load notices:', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  filterType(type: 'all' | 'lost' | 'found') {
    this.activeType = type;
    this.applyFilter();
  }

  applyFilter() {
    // Only display lost and found items (filter out old legacy mock posts if any, keeping it strict)
    const validNotices = this.noticesList.filter(n => n.type === 'lost' || n.type === 'found');
    
    if (this.activeType === 'all') {
      this.filteredNotices = validNotices;
    } else {
      this.filteredNotices = validNotices.filter(n => n.type === this.activeType);
    }
    this.cdr.detectChanges();
  }

  toggleCreateForm() {
    this.showForm = !this.showForm;
    this.resetFormState();
    this.cdr.detectChanges();
  }

  resetFormState() {
    this.title = '';
    this.type = 'lost';
    this.contactInfo = '';
    this.location = '';
    this.imageUrl = '';
    this.description = '';
    this.error = '';
    this.success = '';
  }

  isCreator(notice: any): boolean {
    const curUser = this.authService.user();
    return curUser?.id === notice.created_by;
  }

  async submitNotice() {
    this.error = '';
    this.success = '';

    if (!this.title || !this.type || !this.contactInfo || !this.location || !this.description) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (!this.imageUrl) {
      this.error = 'Please upload a photo of the lost/found item';
      return;
    }

    this.submitting = true;
    try {
      const payload = {
        title: this.title.trim(),
        type: this.type,
        contact_info: this.contactInfo.trim(),
        location: this.location.trim(),
        image_url: this.imageUrl,
        description: this.description.trim()
      };

      const newNotice = await this.productService.createNotice(payload);
      
      const nWithCreator = {
        ...newNotice,
        creator: this.authService.profile()
      };
      
      this.noticesList.unshift(nWithCreator);
      this.applyFilter();
      
      // Trigger gorgeous success overlay animation
      this.showSuccessOverlay = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.showSuccessOverlay = false;
        this.toggleCreateForm();
      }, 2200);
    } catch (err: any) {
      this.error = err.message || 'Failed to publish report. Please try again.';
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }

  async deleteNotice(id: string) {
    if (!confirm('Are you sure you want to remove this report?')) return;

    try {
      await this.productService.deleteNotice(id);
      this.noticesList = this.noticesList.filter(n => n.id !== id);
      this.applyFilter();
    } catch (e) {
      console.error('Failed to delete notice:', e);
    }
  }

  handleItemImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 3 * 1024 * 1024) {
      this.error = 'Item image size should be less than 3MB';
      target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  removeItemImage() {
    this.imageUrl = '';
    this.cdr.detectChanges();
  }

  getAuthorInitials(notice: any): string {
    const name = notice.creator?.full_name || 'Student';
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
