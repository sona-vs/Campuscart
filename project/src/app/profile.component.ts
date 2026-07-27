import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="profile-container fade-in">
      <div class="page-header">
        <div class="badge">Student Profile</div>
        <h1>Your Campus Identity</h1>
        <p>Manage your public campus identity, view trade stats, and update your details.</p>
      </div>

      <div class="profile-layout">
        <!-- Sidebar stats -->
        <div class="profile-sidebar">
          <div class="avatar-card">
            <div class="avatar-preview-wrap">
              <div 
                class="avatar-display" 
                [style.background]="avatarUrl ? 'url(' + avatarUrl + ') center/cover no-repeat' : activeGradient"
              >
                @if (!avatarUrl) {
                  <span>{{ getInitials() }}</span>
                }
              </div>
              <label class="avatar-upload-btn" title="Upload Custom Photo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <input type="file" accept="image/*" (change)="handleAvatarUpload($event)" style="display: none;">
              </label>
            </div>

            <h2>{{ profile()?.full_name }}</h2>
            <p class="college-sub">{{ profile()?.college_name || 'Rathinam University' }}</p>
            <div class="trust-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Verified Student Trader</span>
            </div>

            <!-- Gradient Pickers -->
            <div class="gradient-picker-label">Preset Avatar Gradients:</div>
            <div class="gradient-pickers">
              @for (g of presetGradients; track g) {
                <button 
                  class="gradient-dot" 
                  [style.background]="g" 
                  [class.active]="activeGradient === g && !avatarUrl"
                  (click)="selectGradient(g)"
                  title="Apply Gradient Preset"
                ></button>
              }
              @if (avatarUrl) {
                <button class="clear-photo-btn" (click)="clearCustomPhoto()" title="Reset to Preset">Reset</button>
              }
            </div>
          </div>

          <!-- Trade Stats Cards -->
          <div class="stats-panel">
            <h3>Campus Trade Stats</h3>
            <div class="stats-grid">
              <div class="stat-card blue">
                <div class="stat-num">{{ stats.total }}</div>
                <div class="stat-label">Total Listed</div>
              </div>
              <div class="stat-card green">
                <div class="stat-num">{{ stats.active }}</div>
                <div class="stat-label">Active Listings</div>
              </div>
              <div class="stat-card teal">
                <div class="stat-num">{{ stats.sold }}</div>
                <div class="stat-label">Items Sold</div>
              </div>
              <div class="stat-card red">
                <div class="stat-num">{{ stats.blocked }}</div>
                <div class="stat-label">Suspended</div>
              </div>
            </div>

            <div class="score-card">
              <div class="score-header">
                <span>Campus Trust Rating</span>
                <strong>4.9 / 5.0</strong>
              </div>
              <div class="score-bar">
                <div class="score-fill" style="width: 98%;"></div>
              </div>
              <p class="score-desc">Based on fast responses and accurate item descriptions.</p>
            </div>
          </div>
        </div>

        <!-- Main Form & Settings -->
        <div class="profile-main">
          <div class="settings-card">
            <div class="settings-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <h2>Personal Information</h2>
            </div>

            <form (ngSubmit)="saveProfile()" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="fullName">Full Name *</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    [(ngModel)]="fullName" 
                    name="fullName" 
                    placeholder="e.g. Sona"
                    required
                  >
                </div>
                <div class="form-group">
                  <label for="email">College Email (Read-only)</label>
                  <input 
                    type="email" 
                    id="email" 
                    [value]="profile()?.email || 'N/A'" 
                    disabled 
                    class="disabled-input"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="collegeName">College / University *</label>
                  <input 
                    type="text" 
                    id="collegeName" 
                    [(ngModel)]="collegeName" 
                    name="collegeName" 
                    placeholder="e.g. Rathinam College of Arts & Science"
                    required
                  >
                </div>
                <div class="form-group">
                  <label for="phone">Phone Number (For pickup exchanges)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    [(ngModel)]="phone" 
                    name="phone" 
                    placeholder="e.g. +91 98765 43210"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="bio">Student Bio / Description</label>
                <textarea 
                  id="bio" 
                  [(ngModel)]="bio" 
                  name="bio" 
                  rows="4" 
                  placeholder="Tell campus buyers a bit about yourself (e.g. Hosteller, open to negotiating, available for trade near Main Gate...)"
                ></textarea>
              </div>

              @if (error) {
                <div class="error-message shake">{{ error }}</div>
              }
              @if (success) {
                <div class="success-message">{{ success }}</div>
              }

              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="loading">
                  @if (loading) {
                    <span class="spinner"></span>
                  } @else {
                    <span>Save Profile Changes</span>
                  }
                </button>
              </div>
            </form>
          </div>

          <!-- Trust Guidelines / Info -->
          <div class="info-card">
            <h3>Campus Safety & Trust Guidelines</h3>
            <ul>
              <li>
                <div class="bullet-title">Exchanges on Campus</div>
                <p>Always perform pickup trades in populated public areas like the college library, food courts, or hostel lobbies.</p>
              </li>
              <li>
                <div class="bullet-title">Accurate Descriptions</div>
                <p>Be completely transparent about textbook conditions or phone details to keep your Campus Trust Rating high!</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1100px;
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
      background: #e1e0ff;
      color: #4648d4;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      border: 1px solid rgba(70, 72, 212, 0.2);
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

    .profile-layout {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 2.5rem;
    }

    /* ── SIDEBAR STATS ── */
    .profile-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .avatar-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 2rem 1.5rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .avatar-preview-wrap {
      position: relative;
      margin-bottom: 1.25rem;
    }

    .avatar-display {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2.25rem;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(70, 72, 212, 0.2);
      border: 3px solid white;
    }

    .avatar-upload-btn {
      position: absolute;
      bottom: 2px;
      right: 2px;
      background: #4648d4;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid white;
      transition: all 0.2s ease;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }

    .avatar-upload-btn:hover {
      background: #2f2ebe;
      transform: scale(1.08);
    }

    .avatar-card h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem;
    }

    .college-sub {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 1rem;
    }

    .trust-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.4rem 0.85rem;
      border-radius: 50px;
      background: #f0fdf4;
      color: #166534;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid #bbf7d0;
    }

    .gradient-picker-label {
      align-self: flex-start;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin: 1.5rem 0 0.5rem;
      letter-spacing: 0.02em;
    }

    .gradient-pickers {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .gradient-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid white;
      outline: 1.5px solid #cbd5e1;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s ease;
    }

    .gradient-dot.active {
      transform: scale(1.2);
      outline-color: #4648d4;
      outline-width: 2px;
    }

    .clear-photo-btn {
      background: #f1f5f9;
      color: #475569;
      border: none;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 0.25rem;
    }

    .clear-photo-btn:hover {
      background: #e2e8f0;
    }

    .stats-panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }

    .stats-panel h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      padding: 1rem 0.75rem;
      border-radius: 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-card.blue { background: rgba(70, 72, 212, 0.05); color: #4648d4; }
    .stat-card.green { background: rgba(16, 185, 129, 0.05); color: #10b981; }
    .stat-card.teal { background: rgba(20, 184, 166, 0.05); color: #14b8a6; }
    .stat-card.red { background: rgba(239, 68, 68, 0.05); color: #ef4444; }

    .stat-num {
      font-size: 1.5rem;
      font-weight: 800;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      opacity: 0.85;
    }

    .score-card {
      background: #fafafa;
      border-radius: 12px;
      padding: 0.85rem;
      border: 1px solid #f0f0f0;
    }

    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8125rem;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .score-header strong {
      color: #0f172a;
    }

    .score-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, #4648d4, #10b981);
      border-radius: 3px;
    }

    .score-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    /* ── MAIN SECTION ── */
    .profile-main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }

    .settings-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4648d4;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.75rem;
    }

    .settings-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .profile-form {
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

    .form-group input, .form-group textarea {
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

    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #4648d4;
      background: white;
      box-shadow: 0 0 0 3px rgba(70, 72, 212, 0.1);
    }

    .disabled-input {
      background: #f1f5f9 !important;
      color: #64748b !important;
      cursor: not-allowed;
      border-color: #e2e8f0 !important;
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
      margin-top: 0.75rem;
    }

    .btn-primary {
      padding: 0.85rem 1.75rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .info-card {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 20px;
      padding: 1.5rem;
    }

    .info-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 1rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .info-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bullet-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 0.25rem;
    }

    .info-card p {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
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

    @media (max-width: 768px) {
      .profile-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .form-row {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  profile = this.authService.profile;

  // Form Fields
  fullName = '';
  collegeName = '';
  phone = '';
  bio = '';
  avatarUrl = ''; // Custom base64 photo upload
  activeGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // default

  // Avatar Gradients Presets
  presetGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  ];

  stats = {
    total: 0,
    active: 0,
    sold: 0,
    blocked: 0
  };

  loading = false;
  error = '';
  success = '';

  async ngOnInit() {
    // Populate form fields
    const p = this.profile();
    if (p) {
      this.fullName = p.full_name || '';
      this.collegeName = p.college_name || '';
      this.phone = p.phone || '';
      this.bio = (p as any).bio || '';
      this.avatarUrl = p.avatar_url || '';
      if ((p as any).active_gradient) {
        this.activeGradient = (p as any).active_gradient;
      }
      
      // Load user trade stats
      await this.loadTradeStats(p.id);
    }
  }

  async loadTradeStats(userId: string) {
    try {
      const userProducts = await this.productService.getUserProducts(userId);
      this.stats.total = userProducts.length;
      this.stats.active = userProducts.filter((p: any) => p.is_available !== false && p.is_blocked !== true).length;
      this.stats.sold = userProducts.filter((p: any) => p.is_available === false).length;
      this.stats.blocked = userProducts.filter((p: any) => p.is_blocked === true).length;
    } catch (e) {
      console.error('Failed to load trade stats:', e);
    }
  }

  selectGradient(gradient: string) {
    this.avatarUrl = ''; // Clear custom uploaded photo to use gradient
    this.activeGradient = gradient;
    this.cdr.detectChanges();
  }

  clearCustomPhoto() {
    this.avatarUrl = '';
    this.cdr.detectChanges();
  }

  async handleAvatarUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.error = 'Profile picture size should be less than 2MB';
      target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  async saveProfile() {
    this.error = '';
    this.success = '';

    if (!this.fullName || !this.collegeName) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    try {
      const updates = {
        full_name: this.fullName.trim(),
        college_name: this.collegeName.trim(),
        phone: this.phone.trim(),
        bio: this.bio.trim(),
        avatar_url: this.avatarUrl,
        active_gradient: this.activeGradient
      };

      await this.authService.updateProfile(updates);
      this.success = 'Profile updated successfully!';
      this.cdr.detectChanges();
    } catch (err: any) {
      this.error = err.message || 'Failed to update profile. Please try again.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getInitials(): string {
    const name = this.fullName || '';
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
