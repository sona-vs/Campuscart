import { Injectable, signal, computed } from '@angular/core';
import { Profile, AuthUser } from '../types/database';

/** Dynamically resolves the API base so it works on both
 *  localhost (desktop) and the network IP (mobile). */
function apiBase(): string {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:3001/api';
  }

  return 'https://campuscart-api-lfbh.onrender.com/api';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser    = signal<AuthUser | null>(null);
  private currentProfile = signal<Profile | null>(null);

  user            = this.currentUser.asReadonly();
  profile         = this.currentProfile.asReadonly();
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin         = computed(() => {
    const p = this.currentProfile();
    const u = this.currentUser();
    if (!p) return false;
    const email = u?.email?.toLowerCase() || '';
    const name = p.full_name?.toLowerCase() || '';
    const id = p.id?.toLowerCase() || '';
    return id === 'admin' || email === 'admin@campuscart.com' || name === 'admin';
  });

  constructor() {
    this.initializeAuth();
  }

  /** Restore session from localStorage (just the IDs – real profile is fetched from API) */
  private async initializeAuth() {
    const savedUser    = localStorage.getItem('cc_user');
    const savedProfile = localStorage.getItem('cc_profile');
    if (savedUser && savedProfile) {
      this.currentUser.set(JSON.parse(savedUser));
      this.currentProfile.set(JSON.parse(savedProfile));
    }
  }

  async signIn(username: string, email: string) {
    if (!username || !email) throw new Error('Both username and email are required');

    const res = await fetch(`${apiBase()}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), email: email.trim() })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign in failed');

    localStorage.setItem('cc_user',    JSON.stringify(data.user));
    localStorage.setItem('cc_profile', JSON.stringify(data.profile));
    this.currentUser.set(data.user);
    this.currentProfile.set(data.profile);
    return data;
  }

  async signUp(email: string, _password?: string, fullName?: string, collegeName?: string) {
    if (!email)    throw new Error('Email is required');
    if (!fullName) throw new Error('Full name is required');

    const res = await fetch(`${apiBase()}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, collegeName })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('cc_user',    JSON.stringify(data.user));
    localStorage.setItem('cc_profile', JSON.stringify(data.profile));
    this.currentUser.set(data.user);
    this.currentProfile.set(data.profile);
    return data;
  }

  async updateProfile(updates: Partial<Profile>) {
    const prof = this.currentProfile();
    if (!prof) throw new Error('No active profile to update');

    const res = await fetch(`${apiBase()}/auth/profile/${prof.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    localStorage.setItem('cc_profile', JSON.stringify(data));
    this.currentProfile.set(data);
    return data;
  }

  async signOut() {
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_profile');
    this.currentUser.set(null);
    this.currentProfile.set(null);
  }

  validateCollegeEmail(email: string): boolean {
    return true;
  }
}
