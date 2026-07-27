import { Component, inject, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CurrencyPipe],
  template: `
    <div class="dashboard-wrapper">
      <!-- Mobile nav overlay -->
      <div class="mobile-overlay" [class.open]="menuOpen" (click)="closeMenu()"></div>

      <!-- Mobile nav drawer -->
      <nav class="mobile-drawer" [class.open]="menuOpen">
        <div class="drawer-header">
          <div class="drawer-brand">
            <img src="assets/images/campus-logo.svg" alt="CampusCart Logo" style="width:36px;height:36px;object-fit:contain;">
            <span class="logo-text">CampusCart</span>
          </div>
          <button class="drawer-close" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="drawer-user" routerLink="/dashboard/profile" (click)="closeMenu()" style="cursor: pointer;">
          <div 
            class="drawer-avatar" 
            [style.background]="profile()?.avatar_url ? 'url(' + profile()?.avatar_url + ') center/cover no-repeat' : (profile()?.active_gradient || 'linear-gradient(135deg, var(--primary), var(--tertiary))')"
          >
            @if (!profile()?.avatar_url) {
              {{ getInitials() }}
            }
          </div>
          <div>
            <div class="drawer-user-name">{{ profile()?.full_name }}</div>
            <div class="drawer-user-college">{{ profile()?.college_name }}</div>
          </div>
        </div>

        <div class="drawer-links">
          <a routerLink="/dashboard" class="drawer-link" [class.drawer-active]="!isActive('/dashboard/buy') && !isActive('/dashboard/sell') && !isActive('/dashboard/my-listings') && !isActive('/dashboard/verification')" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a routerLink="/dashboard/buy" class="drawer-link" [class.drawer-active]="isActive('/dashboard/buy')" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Buy
          </a>
          <a routerLink="/dashboard/sell" class="drawer-link" [class.drawer-active]="isActive('/dashboard/sell')" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Sell
          </a>
          <a routerLink="/dashboard/my-listings" class="drawer-link" [class.drawer-active]="isActive('/dashboard/my-listings')" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
            My Listings
          </a>
          <a routerLink="/dashboard/lost-found" class="drawer-link" [class.drawer-active]="isActive('/dashboard/lost-found')" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Lost & Found
          </a>
          @if (isAdmin()) {
            <a routerLink="/dashboard/verification" class="drawer-link" [class.drawer-active]="isActive('/dashboard/verification')" style="color: #d97706;" (click)="closeMenu()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Verification
            </a>
          }
        </div>

        <button class="drawer-logout" (click)="handleLogout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </nav>

      <!-- Header -->
      <header class="site-header" [class.scrolled]="isScrolled">
        <div class="header-inner">
          <div class="logo-area" routerLink="/dashboard">
            <img src="assets/images/campus-logo.svg" alt="CampusCart Logo" class="logo-img">
            <span class="logo-text">CampusCart</span>
          </div>

          <nav class="main-nav">
            <a routerLink="/dashboard" class="nav-item" [class.nav-active]="!isActive('/dashboard/buy') && !isActive('/dashboard/sell') && !isActive('/dashboard/my-listings') && !isActive('/dashboard/verification') && !isActive('/dashboard/profile') && !isActive('/dashboard/lost-found')">Home</a>
            <a routerLink="/dashboard/buy" class="nav-item" [class.nav-active]="isActive('/dashboard/buy')">Buy</a>
            <a routerLink="/dashboard/sell" class="nav-item" [class.nav-active]="isActive('/dashboard/sell')">Sell</a>
            <a routerLink="/dashboard/my-listings" class="nav-item" [class.nav-active]="isActive('/dashboard/my-listings')">My Listings</a>
            <a routerLink="/dashboard/lost-found" class="nav-item" [class.nav-active]="isActive('/dashboard/lost-found')">Lost & Found</a>
            @if (isAdmin()) {
              <a routerLink="/dashboard/verification" class="nav-item" [class.nav-active]="isActive('/dashboard/verification')" style="color: #d97706; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Verification
              </a>
            }
          </nav>

          <div class="header-right">
            <div class="profile-chip" routerLink="/dashboard/profile" style="cursor: pointer;">
              <div 
                class="profile-avatar" 
                [style.background]="profile()?.avatar_url ? 'url(' + profile()?.avatar_url + ') center/cover no-repeat' : (profile()?.active_gradient || 'linear-gradient(135deg, var(--primary), var(--tertiary))')"
              >
                @if (!profile()?.avatar_url) {
                  {{ getInitials() }}
                }
              </div>
              <div class="profile-info">
                <span class="profile-name">{{ profile()?.full_name }}</span>
                <span class="profile-college">{{ profile()?.college_name }}</span>
              </div>
            </div>

            <!-- Notifications Bell -->
            <div class="notifications-container">
              <button class="icon-btn bell-btn" (click)="toggleNotifications($event)" title="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                @if (unreadCount() > 0) {
                  <span class="bell-badge">{{ unreadCount() }}</span>
                }
              </button>

              <!-- Notifications Dropdown -->
              <div class="notifications-dropdown" [class.open]="showNotifications" (click)="$event.stopPropagation()">
                <div class="dropdown-header">
                  <h3>Notifications</h3>
                  @if (unreadCount() > 0) {
                    <button class="btn-text" (click)="markAllAsRead()">Mark all as read</button>
                  }
                </div>
                <div class="dropdown-list">
                  @if (notificationsList().length === 0) {
                    <div class="empty-notifications">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <p>All caught up!</p>
                      <span>No new notifications</span>
                    </div>
                  } @else {
                    @for (n of notificationsList(); track n.id) {
                      <div class="notification-item" [class.unread]="!n.is_read" (click)="clickNotification(n)">
                        <div class="notification-dot"></div>
                        <div class="notification-content">
                          <strong class="notification-title">{{ n.title }}</strong>
                          <p class="notification-message">{{ n.message }}</p>
                          <span class="notification-time">{{ formatTime(n.created_at) }}</span>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>

            <button class="icon-btn logout-btn" (click)="handleLogout()" title="Sign out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
            <!-- Hamburger (mobile only) -->
            <button class="hamburger-btn" (click)="toggleMenu()" [class.is-open]="menuOpen" aria-label="Open menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main -->
      <main class="site-main">
        @if (!isChildRoute()) {
          <!-- Hero Section -->
          <section class="hero-section">
            <div class="container">
              <div class="hero-grid">
                <div class="hero-content fade-up">
                  <span class="hero-badge">Official Student Exchange</span>
                  <h1 class="hero-title">
                    The Smartest Way to<br>
                    <span class="text-primary">Trade on Campus.</span>
                  </h1>
                  <p class="hero-desc">
                    Connect with fellow students to buy and sell textbooks, electronics, and dorm essentials. Safe, verified, and community-focused.
                  </p>
                  <div class="hero-actions">
                    <a routerLink="/dashboard/buy" class="btn btn-primary">Start Shopping</a>
                    <a routerLink="/dashboard/sell" class="btn btn-outline">Post an Ad</a>
                  </div>
                </div>
                <div class="hero-image-wrap fade-up" style="animation-delay:0.15s">
                  <div class="hero-image-card">
                    <div class="hero-video-container">
                      <iframe
                        src="https://www.youtube.com/embed/qJDDpm2TOvE?autoplay=1&mute=1&loop=1&playlist=qJDDpm2TOvE&controls=0&modestbranding=1&rel=0&playsinline=1&vq=hd1080"
                        title="CampusCart Video"
                        class="hero-video"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Categories -->
          <section class="categories-section">
            <div class="container">
              <div class="section-heading">
                <h2>Browse by Category</h2>
                <div class="heading-bar"></div>
              </div>
              <div class="categories-grid">
                <a (click)="goToCategory('cat-1')" class="cat-card cat-blue">
                  <div class="cat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <span>Books</span>
                </a>
                <a (click)="goToCategory('cat-2')" class="cat-card cat-purple">
                  <div class="cat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  </div>
                  <span>Gadgets</span>
                </a>
                <a (click)="goToCategory('cat-3')" class="cat-card cat-teal">
                  <div class="cat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <span>Housing</span>
                </a>
                <a (click)="goToCategory('cat-4')" class="cat-card cat-blue">
                  <div class="cat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>
                  </div>
                  <span>Rentals</span>
                </a>
                <a (click)="goToCategory('cat-5')" class="cat-card cat-red">
                  <div class="cat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <span>Events</span>
                </a>
                <a (click)="goToCategory('cat-6')" class="cat-card cat-purple">
                  <div class="cat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                  </div>
                  <span>Lab Records</span>
                </a>
              </div>
            </div>
          </section>

          <!-- Latest Listings -->
          <section class="listings-section">
            <div class="container">
              <div class="listings-header">
                <div>
                  <h2>Latest Listings</h2>
                  <p class="listings-sub">Discover what's new on your campus.</p>
                </div>
                <a routerLink="/dashboard/buy" class="view-all-link">
                  View all
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>
              <div class="listings-grid">
                @for (product of featuredProducts(); track product.id) {
                  <a [routerLink]="['/dashboard/product', product.id]" class="listing-card">
                    <div class="listing-img-wrap">
                      <img [src]="productService.getProductImage(product)" [alt]="product.title" class="listing-img">
                      <div class="verified-badge">
                        <svg viewBox="0 0 24 24" fill="#4648d4" width="10" height="10"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        VERIFIED STUDENT
                      </div>
                    </div>
                    <div class="listing-info">
                      <h4 class="listing-title">{{ product.title }}</h4>
                      <p class="listing-price">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</p>
                    </div>
                  </a>
                }
              </div>
            </div>
          </section>

          <!-- How It Works -->
          <section class="how-section">
            <div class="container">
              <div class="how-heading">
                <h2>How CampusCart Works</h2>
                <div class="how-bar"></div>
              </div>
              <div class="how-grid">
                <div class="how-step">
                  <div class="how-icon how-blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <h3>List or Discover</h3>
                  <p>Snap a photo to sell or browse listings from peers across campus.</p>
                </div>
                <div class="how-step">
                  <div class="how-icon how-teal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3>Direct Exchange</h3>
                  <p>Chat securely and meet on campus for a safe trade.</p>
                </div>
                <div class="how-step">
                  <div class="how-icon how-purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h3>Community Governed</h3>
                  <p>Trust is built through student verification and community moderation.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer class="site-footer">
            <div class="container">
              <div class="footer-grid">
                <div class="footer-brand">
                  <div class="footer-logo">
                    <img src="assets/images/campus-logo.svg" alt="CampusCart Logo" style="width:32px;height:32px;object-fit:contain;">
                    <span>CampusCart</span>
                  </div>
                  <p class="footer-desc">The official student-led marketplace designed to make university life more affordable and sustainable.</p>
                  <p class="footer-copy">© 2024 CampusCart. Built for the community.</p>
                </div>
                <div class="footer-col">
                  <h5 class="footer-col-title">Platform</h5>
                  <ul>
                    <li><a routerLink="/dashboard">Home</a></li>
                    <li><a routerLink="/dashboard/buy">Browse Listings</a></li>
                    <li><a routerLink="/dashboard/my-listings">My Listings</a></li>
                  </ul>
                </div>
                <div class="footer-col">
                  <h5 class="footer-col-title">Support</h5>
                  <ul>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>

        } @else {
          <router-outlet />
        }
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

    :host {
      --primary: #4648d4;
      --primary-dark: #2f2ebe;
      --primary-light: #e1e0ff;
      --secondary: #006591;
      --tertiary: #6b38d4;
      --error: #ba1a1a;
      --surface: #f8f9ff;
      --surface-container: #e5eeff;
      --surface-low: #eff4ff;
      --outline: #c7c4d7;
      --on-surface: #0b1c30;
      --on-surface-variant: #464554;
      --white: #ffffff;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .dashboard-wrapper {
      font-family: 'Inter', sans-serif;
      background: var(--surface);
      color: var(--on-surface);
      min-height: 100vh;
    }

    /* ── HEADER ── */
    .site-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      background: white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      transition: box-shadow 0.3s;
    }
    .site-header.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    .logo-img { width: 44px; height: 44px; object-fit: contain; }
    .logo-text {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }

    .main-nav { display: flex; align-items: center; gap: 0.25rem; }
    .nav-item {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--on-surface-variant);
      font-size: 0.9375rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-item:hover { color: var(--primary); background: var(--primary-light); }
    .nav-active { color: var(--primary); font-weight: 700; }

    .header-right { display: flex; align-items: center; gap: 0.75rem; }

    /* ── NOTIFICATIONS ── */
    .notifications-container {
      position: relative;
    }
    .bell-btn {
      position: relative;
    }
    .bell-btn:hover {
      background: var(--primary-light);
      color: var(--primary);
    }
    .bell-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--error);
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      border-radius: 50%;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 1.5px solid white;
    }
    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 360px;
      max-height: 480px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid var(--outline);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 1000;
      animation: dropdownFade 0.25s ease;
    }
    .notifications-dropdown.open {
      display: flex;
    }
    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--outline);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.5);
    }
    .dropdown-header h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--on-surface);
    }
    .btn-text {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .btn-text:hover {
      text-decoration: underline;
    }
    .dropdown-list {
      overflow-y: auto;
      flex: 1;
      max-height: 400px;
    }
    .empty-notifications {
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--on-surface-variant);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .empty-notifications p {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--on-surface);
      margin-top: 0.5rem;
    }
    .empty-notifications span {
      font-size: 0.8125rem;
    }
    .notification-item {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--outline);
      display: flex;
      gap: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }
    .notification-item:hover {
      background: var(--surface-low);
    }
    .notification-item.unread {
      background: rgba(70, 72, 212, 0.04);
    }
    .notification-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      margin-top: 5px;
      flex-shrink: 0;
      opacity: 0;
    }
    .notification-item.unread .notification-dot {
      opacity: 1;
    }
    .notification-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }
    .notification-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--on-surface);
    }
    .notification-message {
      font-size: 0.8125rem;
      color: var(--on-surface-variant);
      line-height: 1.4;
    }
    .notification-time {
      font-size: 0.75rem;
      color: var(--on-surface-variant);
      opacity: 0.7;
      margin-top: 0.25rem;
    }

    @media (max-width: 768px) {
      .notifications-dropdown {
        position: fixed;
        top: 64px;
        left: 10px;
        right: 10px;
        width: auto;
        max-height: calc(100vh - 80px);
      }
    }

    .profile-chip {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--surface-low);
      border-radius: 50px;
      padding: 0.35rem 0.9rem 0.35rem 0.35rem;
    }
    .profile-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--tertiary));
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8125rem;
      flex-shrink: 0;
    }
    .profile-info { display: flex; flex-direction: column; }
    .profile-name { font-size: 0.8125rem; font-weight: 600; color: var(--on-surface); line-height: 1.2; }
    .profile-college { font-size: 0.6875rem; color: var(--on-surface-variant); line-height: 1.2; }

    .icon-btn {
      width: 38px; height: 38px;
      border-radius: 50%;
      border: none;
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: var(--on-surface-variant);
      transition: all 0.2s;
    }
    .icon-btn svg { width: 20px; height: 20px; }
    .logout-btn:hover { background: #fee2e2; color: #dc2626; }

    /* ── MAIN ── */
    .site-main { padding-top: 64px; }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* ── HERO ── */
    .hero-section {
      padding: 5rem 0 4rem;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 4rem;
    }
    .hero-content { display: flex; flex-direction: column; gap: 1.5rem; }

    .hero-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: #d4f0ff;
      color: var(--secondary);
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      width: fit-content;
    }

    .hero-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.15;
      color: var(--on-surface);
      letter-spacing: -0.02em;
    }
    .text-primary { color: var(--primary); }

    .hero-desc {
      font-size: 1.0625rem;
      line-height: 1.75;
      color: var(--on-surface-variant);
      max-width: 32rem;
    }

    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

    .btn {
      padding: 0.9rem 2rem;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.25s;
      border: 2px solid transparent;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 8px 24px rgba(70,72,212,0.25);
    }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(70,72,212,0.35); }
    .btn-outline {
      background: transparent;
      border-color: var(--primary);
      color: var(--primary);
    }
    .btn-outline:hover { background: var(--primary-light); transform: translateY(-2px); }

    .hero-image-card {
      background: var(--surface-container);
      border-radius: 24px;
      padding: 1rem;
      box-shadow: 0 20px 48px -12px rgba(70,72,212,0.12);
      border: 1px solid var(--outline);
    }
    .hero-img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: 16px;
      display: block;
    }
    .hero-video-container {
      width: 100%;
      aspect-ratio: 4/3;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      background: #000;
      pointer-events: none;
    }
    .hero-video {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%) scale(1.35);
      border: none;
      display: block;
    }

    /* ── CATEGORIES ── */
    .categories-section { padding: 3rem 0; }

    .section-heading { margin-bottom: 2.5rem; }
    .section-heading h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--on-surface);
    }
    .heading-bar {
      width: 56px; height: 4px;
      background: var(--primary);
      border-radius: 4px;
      margin-top: 0.6rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1.25rem;
    }

    .cat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1rem;
      background: white;
      border: 1px solid var(--outline);
      border-radius: 16px;
      text-decoration: none;
      color: var(--on-surface);
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.25s;
    }
    .cat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(70,72,212,0.12);
    }

    .cat-icon-wrap {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.25s;
    }
    .cat-icon-wrap svg { width: 22px; height: 22px; }

    .cat-blue .cat-icon-wrap { background: rgba(70,72,212,0.1); color: var(--primary); }
    .cat-blue:hover .cat-icon-wrap { background: var(--primary); color: white; }

    .cat-purple .cat-icon-wrap { background: rgba(107,56,212,0.1); color: var(--tertiary); }
    .cat-purple:hover .cat-icon-wrap { background: var(--tertiary); color: white; }

    .cat-teal .cat-icon-wrap { background: rgba(0,101,145,0.1); color: var(--secondary); }
    .cat-teal:hover .cat-icon-wrap { background: var(--secondary); color: white; }

    .cat-red .cat-icon-wrap { background: rgba(186,26,26,0.1); color: var(--error); }
    .cat-red:hover .cat-icon-wrap { background: var(--error); color: white; }

    /* ── LISTINGS ── */
    .listings-section { padding: 4rem 0; }

    .listings-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
    }
    .listings-header h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--on-surface);
    }
    .listings-sub { color: var(--on-surface-variant); margin-top: 0.25rem; font-size: 0.9375rem; }
    .view-all-link {
      display: flex; align-items: center; gap: 0.35rem;
      color: var(--primary);
      font-weight: 700;
      text-decoration: none;
      font-size: 0.9375rem;
      transition: gap 0.2s;
    }
    .view-all-link:hover { gap: 0.6rem; }

    .listings-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
    }

    .listing-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--outline);
      text-decoration: none;
      color: inherit;
      transition: all 0.25s;
      display: block;
    }
    .listing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(70,72,212,0.12);
    }

    .listing-img-wrap { position: relative; height: 180px; overflow: hidden; }
    .listing-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
    .listing-card:hover .listing-img { transform: scale(1.04); }

    .verified-badge {
      position: absolute;
      top: 10px; left: 10px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(4px);
      padding: 0.25rem 0.6rem;
      border-radius: 8px;
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      display: flex; align-items: center; gap: 4px;
      color: var(--on-surface);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .listing-info { padding: 0.875rem 1rem; }
    .listing-title {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s;
      margin-bottom: 0.3rem;
    }
    .listing-card:hover .listing-title { color: var(--primary); }
    .listing-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary);
    }

    /* ── HOW IT WORKS ── */
    .how-section {
      background: var(--surface-low);
      padding: 5rem 0;
    }
    .how-heading { text-align: center; margin-bottom: 4rem; }
    .how-heading h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--on-surface);
    }
    .how-bar {
      width: 64px; height: 5px;
      background: var(--primary);
      border-radius: 4px;
      margin: 1rem auto 0;
    }

    .how-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3rem;
    }
    .how-step {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .how-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .how-blue { background: rgba(70,72,212,0.1); color: var(--primary); }
    .how-teal { background: rgba(0,101,145,0.1); color: var(--secondary); }
    .how-purple { background: rgba(107,56,212,0.1); color: var(--tertiary); }
    .how-step h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--on-surface);
    }
    .how-step p { color: var(--on-surface-variant); font-size: 0.9375rem; line-height: 1.6; }

    /* ── FOOTER ── */
    .site-footer {
      background: var(--surface-container);
      border-top: 1px solid var(--outline);
      padding: 3.5rem 0;
      margin-top: 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
    }
    .footer-logo {
      display: flex; align-items: center; gap: 0.6rem;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--on-surface);
      margin-bottom: 1rem;
    }
    .footer-logo svg { color: var(--on-surface); }
    .footer-desc { color: var(--on-surface-variant); font-size: 0.875rem; line-height: 1.7; max-width: 24rem; }
    .footer-copy { color: var(--on-surface-variant); font-size: 0.8125rem; margin-top: 1.25rem; opacity: 0.7; }
    .footer-col-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-col a {
      color: var(--on-surface-variant);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .footer-col a:hover { color: var(--primary); }

    /* ── ANIMATIONS ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up {
      animation: fadeUp 0.55s ease-out both;
    }

    /* ── RESPONSIVE ── */
    /* ── HAMBURGER ── */
    .hamburger-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 40px; height: 40px;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .hamburger-btn:hover { background: var(--primary-light); }
    .hamburger-btn span {
      display: block;
      width: 22px; height: 2px;
      background: var(--on-surface);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }
    .hamburger-btn.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger-btn.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .hamburger-btn.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── MOBILE OVERLAY ── */
    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 199;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .mobile-overlay.open { opacity: 1; }

    /* ── MOBILE DRAWER ── */
    .mobile-drawer {
      display: none;
      position: fixed;
      top: 0; right: 0;
      height: 100%;
      width: 300px;
      max-width: 85vw;
      background: white;
      z-index: 200;
      flex-direction: column;
      box-shadow: -8px 0 40px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }
    .mobile-drawer.open { transform: translateX(0); }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid var(--outline);
    }
    .drawer-brand { display: flex; align-items: center; gap: 0.5rem; }
    .drawer-close {
      width: 36px; height: 36px;
      border: none; background: #f1f5f9;
      border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--on-surface);
      transition: background 0.2s;
    }
    .drawer-close:hover { background: #fee2e2; color: #dc2626; }

    .drawer-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      background: var(--surface-low);
      border-bottom: 1px solid var(--outline);
    }
    .drawer-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--tertiary));
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9375rem;
      flex-shrink: 0;
    }
    .drawer-user-name { font-weight: 700; font-size: 0.9375rem; color: var(--on-surface); }
    .drawer-user-college { font-size: 0.8rem; color: var(--on-surface-variant); margin-top: 2px; }

    .drawer-links {
      display: flex;
      flex-direction: column;
      padding: 1rem 0.75rem;
      gap: 0.25rem;
      flex: 1;
    }
    .drawer-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      border-radius: 12px;
      text-decoration: none;
      color: var(--on-surface-variant);
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .drawer-link:hover { background: var(--surface-low); color: var(--primary); }
    .drawer-link svg { flex-shrink: 0; }
    .drawer-active {
      background: var(--primary-light);
      color: var(--primary);
    }

    .drawer-logout {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: calc(100% - 1.5rem);
      margin: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 12px;
      border: 1.5px solid #fee2e2;
      background: transparent;
      color: #dc2626;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .drawer-logout:hover { background: #fee2e2; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1024px) {
      .categories-grid { grid-template-columns: repeat(3, 1fr); }
      .listings-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
      .hamburger-btn { display: flex; }
      .mobile-overlay { display: block; pointer-events: none; }
      .mobile-overlay.open { pointer-events: auto; }
      .mobile-drawer { display: flex; }
      .main-nav { display: none; }
      .profile-chip { display: none; }
      .logout-btn { display: none; }
      .header-inner { padding: 0 1rem; }
      .hero-grid { grid-template-columns: 1fr; gap: 2rem; }
      .hero-section { padding: 3rem 0 2rem; }
      .hero-title { font-size: 2rem; }
      .hero-image-wrap { display: none; }
      .categories-grid { grid-template-columns: repeat(2, 1fr); }
      .listings-grid { grid-template-columns: repeat(2, 1fr); }
      .how-grid { grid-template-columns: 1fr; gap: 2rem; }
      .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
      .container { padding: 0 1rem; }
      .listings-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .hero-actions { flex-direction: column; }
      .btn { width: 100%; justify-content: center; }
      .how-section { padding: 3rem 0; }
    }
    @media (max-width: 480px) {
      .listings-grid { grid-template-columns: 1fr; }
      .categories-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-title { font-size: 1.75rem; }
      .hero-badge { font-size: 0.6875rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  productService = inject(ProductService);
  private router = inject(Router);

  profile = this.authService.profile;
  isAdmin = this.authService.isAdmin;
  featuredProducts = this.productService.featuredProducts;
  isScrolled = false;
  menuOpen = false;

  notificationsList = signal<any[]>([]);
  unreadCount = signal<number>(0);
  showNotifications = false;
  private pollInterval: any;

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click')
  closeNotifications() {
    this.showNotifications = false;
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  ngOnInit() {
    this.productService.loadFeaturedProducts();
    this.productService.loadCategories();
    this.loadNotifications();

    // Poll for notifications every 8 seconds
    this.pollInterval = setInterval(() => {
      this.loadNotifications();
    }, 8000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  async loadNotifications() {
    const userId = this.authService.user()?.id || this.authService.profile()?.id;
    if (!userId) return;

    try {
      const list = await this.productService.loadNotifications(userId);
      this.notificationsList.set(list || []);
      
      const unreads = list.filter((n: any) => !n.is_read).length;
      this.unreadCount.set(unreads);
    } catch (e) {
      console.error('loadNotifications failed', e);
    }
  }

  async markAllAsRead() {
    const userId = this.authService.user()?.id || this.authService.profile()?.id;
    if (!userId) return;

    try {
      await this.productService.markAllNotificationsAsRead(userId);
      this.notificationsList.update(list => list.map(n => ({ ...n, is_read: true })));
      this.unreadCount.set(0);
    } catch (e) {
      console.error('markAllAsRead failed', e);
    }
  }

  async clickNotification(notification: any) {
    this.showNotifications = false;

    // Mark as read
    const userId = this.authService.user()?.id || this.authService.profile()?.id;
    if (userId) {
      await this.markAllAsRead();
    }

    if (notification.type === 'verification_pending') {
      this.router.navigate(['/dashboard/verification']);
    } else if (notification.product_id) {
      this.router.navigate(['/dashboard/product', notification.product_id]);
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  }

  getInitials(): string {
    const name = this.profile()?.full_name || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getFirstName(): string {
    return this.profile()?.full_name?.split(' ')[0] || 'Student';
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  isChildRoute(): boolean {
    const url = this.router.url;
    return url.includes('/dashboard/buy') || url.includes('/dashboard/sell') || url.includes('/dashboard/my-listings') || url.includes('/dashboard/product') || url.includes('/dashboard/verification') || url.includes('/dashboard/profile') || url.includes('/dashboard/lost-found');
  }

  goToCategory(catId: string) {
    this.router.navigate(['/dashboard/buy'], { queryParams: { category: catId } });
  }

  async handleLogout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
