import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">

      <!-- Left decorative panel -->
      <div class="left-panel">
        <div class="left-inner">
          <div class="brand">
            <img src="assets/images/campus-logo.svg" alt="CampusCart" class="brand-logo">
            <span class="brand-name">CampusCart</span>
          </div>
          <div class="left-body">
            <h2 class="left-title">Start trading<br>smarter today.</h2>
            <p class="left-desc">Join thousands of students buying and selling on campus — for free, always.</p>
            <div class="steps">
              <div class="step">
                <div class="step-num">1</div>
                <div>
                  <strong>Create your account</strong>
                  <p>Just your name, email and college</p>
                </div>
              </div>
              <div class="step">
                <div class="step-num">2</div>
                <div>
                  <strong>List or browse items</strong>
                  <p>Post in seconds or find great deals</p>
                </div>
              </div>
              <div class="step">
                <div class="step-num">3</div>
                <div>
                  <strong>Meet &amp; exchange on campus</strong>
                  <p>Safe, fast, community-driven</p>
                </div>
              </div>
            </div>
          </div>
          <div class="left-footer">© 2026 CampusCart · All rights reserved</div>
        </div>
        <div class="left-blob blob1"></div>
        <div class="left-blob blob2"></div>
      </div>

      <!-- Right form panel -->
      <div class="right-panel">
        <div class="form-card fade-in">

          <div class="form-header">
            <h1>Create your account 🎓</h1>
            <p>Join CampusCart — it's completely free</p>
          </div>

          <form (ngSubmit)="handleRegister()" class="auth-form" autocomplete="on">

            <!-- Full Name -->
            <div class="field-group">
              <label for="fullName">Full Name <span class="req">*</span></label>
              <div class="input-wrap">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  id="fullName"
                  [(ngModel)]="fullName"
                  name="fullName"
                  placeholder="e.g. Muttakka Rani"
                  required
                  autocomplete="name"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="field-group">
              <label for="email">Email Address <span class="req">*</span></label>
              <div class="input-wrap">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="you@college.edu"
                  required
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- College Name -->
            <div class="field-group">
              <label for="collegeName">College / University <span class="req">*</span></label>
              <div class="input-wrap">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <input
                  type="text"
                  id="collegeName"
                  [(ngModel)]="collegeName"
                  name="collegeName"
                  placeholder="e.g. Rathinam University"
                  required
                  autocomplete="organization"
                />
              </div>
            </div>

            @if (error) {
              <div class="alert alert-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ error }}
              </div>
            }

            @if (success) {
              <div class="alert alert-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ success }}
              </div>
            }

            <button type="submit" class="btn-submit" [disabled]="loading">
              @if (loading) {
                <span class="spinner"></span>
                <span>Creating account…</span>
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                <span>Create Account</span>
              }
            </button>

            <p class="terms-note">
              By signing up you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div class="divider"><span>or</span></div>

          <p class="switch-link">
            Already have an account?
            <a routerLink="/login">Sign in →</a>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

    :host {
      --primary: #4648d4;
      --primary-dark: #2f2ebe;
      --primary-light: #e1e0ff;
      --surface: #f7f8ff;
      --outline: #dde0f0;
      --text: #0c1027;
      --text-muted: #5b6080;
      --error: #dc2626;
      --error-bg: #fef2f2;
      --success: #16a34a;
      --success-bg: #f0fdf4;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page {
      min-height: 100vh;
      display: flex;
      font-family: 'Inter', sans-serif;
    }

    /* ── LEFT PANEL ── */
    .left-panel {
      width: 44%;
      background: linear-gradient(145deg, #2d2f9e 0%, #5a25b0 55%, #3a3bc0 100%);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      padding: 3rem;
    }

    .left-inner {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .brand-logo { width: 40px; height: 40px; object-fit: contain; }
    .brand-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .left-body {
      margin: auto 0;
      padding: 3rem 0 2rem;
    }

    .left-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      line-height: 1.2;
      margin-bottom: 1.25rem;
    }

    .left-desc {
      font-size: 1.0625rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.7;
      margin-bottom: 2.5rem;
      max-width: 28rem;
    }

    .steps { display: flex; flex-direction: column; gap: 1.25rem; }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      color: white;
    }
    .step-num {
      width: 32px; height: 32px;
      min-width: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .step strong { display: block; font-size: 0.9375rem; font-weight: 700; margin-bottom: 2px; }
    .step p { font-size: 0.8125rem; color: rgba(255,255,255,0.65); }

    .left-footer {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
    }

    .left-blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .blob1 { width: 400px; height: 400px; bottom: -120px; right: -100px; }
    .blob2 { width: 200px; height: 200px; top: -60px; right: 40px; }

    /* ── RIGHT PANEL ── */
    .right-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface);
      padding: 2rem;
    }

    .form-card {
      width: 100%;
      max-width: 440px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeIn 0.45s ease-out; }

    .form-header { margin-bottom: 2rem; }
    .form-header h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 0.4rem;
    }
    .form-header p { color: var(--text-muted); font-size: 0.9375rem; }

    .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }

    .field-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text);
      letter-spacing: 0.02em;
    }
    .req { color: var(--error); }

    .input-wrap { position: relative; }
    .field-icon {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9094b0;
      pointer-events: none;
    }
    input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      border: 1.5px solid var(--outline);
      border-radius: 12px;
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--text);
      background: white;
      transition: all 0.2s;
    }
    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(70,72,212,0.1);
    }
    input::placeholder { color: #b0b3c8; }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .alert-error   { background: var(--error-bg);   color: var(--error); }
    .alert-success { background: var(--success-bg);  color: var(--success); }

    .btn-submit {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem;
      border: none;
      border-radius: 12px;
      background: var(--primary);
      color: white;
      font-size: 1rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.25s;
      margin-top: 0.25rem;
      box-shadow: 0 6px 20px rgba(70,72,212,0.3);
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(70,72,212,0.4);
    }
    .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px;
      border: 2.5px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .terms-note {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.6;
    }
    .terms-note a { color: var(--primary); text-decoration: none; }
    .terms-note a:hover { text-decoration: underline; }

    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.25rem 0;
      color: #b0b3c8;
      font-size: 0.8125rem;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--outline);
    }

    .switch-link {
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .switch-link a {
      color: var(--primary);
      font-weight: 700;
      text-decoration: none;
      transition: color 0.2s;
    }
    .switch-link a:hover { color: var(--primary-dark); }

    @media (max-width: 768px) {
      .left-panel { display: none; }
      .right-panel { padding: 1.5rem; }
      .form-header h1 { font-size: 1.625rem; }
    }
  `]
})
export class RegisterComponent {
  fullName   = '';
  email      = '';
  collegeName = '';
  error      = '';
  success    = '';
  loading    = false;

  private authService = inject(AuthService);
  private router      = inject(Router);

  async handleRegister() {
    this.error = '';
    this.success = '';

    if (!this.fullName.trim()) {
      this.error = 'Full name is required.';
      return;
    }
    if (!this.email.trim()) {
      this.error = 'Email address is required.';
      return;
    }
    if (!this.collegeName.trim()) {
      this.error = 'College/University name is required.';
      return;
    }

    this.loading = true;
    try {
      await this.authService.signUp(this.email.trim(), undefined, this.fullName.trim(), this.collegeName.trim());
      this.success = '🎉 Account created! Taking you to your dashboard…';
      setTimeout(() => this.router.navigate(['/dashboard']), 1400);
    } catch (err: any) {
      this.error = err.message || 'Failed to create account. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
