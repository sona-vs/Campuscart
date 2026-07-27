import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="sell-container fade-in">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Edit Your Listing' : 'List Your Item' }}</h1>
        <p>{{ isEditMode ? 'Update the details of your listing below' : 'Fill in the details to sell your product on campus' }}</p>
      </div>

      <form (ngSubmit)="handleSubmit()" class="sell-form">
        <div class="form-section">
          <h2>Product Details</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="title">Product Title *</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="title"
                name="title"
                placeholder="e.g., Engineering Mathematics Textbook"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" [(ngModel)]="categoryId" name="category" required>
                <option value="">Select a category</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="condition">Condition *</label>
              <select id="condition" [(ngModel)]="condition" name="condition" required>
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="description">Description *</label>
              <textarea
                id="description"
                [(ngModel)]="description"
                name="description"
                placeholder="Describe your item in detail..."
                rows="5"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Price & Location</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Price (INR) *</label>
              <input
                type="number"
                id="price"
                [(ngModel)]="price"
                name="price"
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>

            <div class="form-group">
              <label for="location">Pickup Location</label>
              <input
                type="text"
                id="location"
                [(ngModel)]="location"
                name="location"
                placeholder="e.g., Main Library, Building A"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Images</h2>
          <p class="section-hint">Add up to 5 images of your product</p>

          <div class="image-upload-area" [class.loading]="uploadingImages" (click)="!uploadingImages && fileInput.click()">
            <input
              #fileInput
              type="file"
              accept="image/*"
              multiple
              (change)="handleImageUpload($event)"
              style="display: none"
              [disabled]="uploadingImages"
            />
            @if (uploadingImages) {
              <div class="upload-spinner"></div>
              <p style="margin-top: 0.5rem; font-weight: 600; color: #4f46e5;">Processing Images...</p>
              <span>Please wait while we optimize your photos</span>
            } @else {
              <div class="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <p>Click to upload images</p>
              <span>PNG, JPG up to 5MB each</span>
            }
          </div>

          @if (imagePreview.length > 0) {
            <div class="image-previews">
              @for (preview of imagePreview; track $index) {
                <div class="preview-item">
                  <img [src]="preview" alt="Preview">
                  <button type="button" class="remove-image" (click)="removeImage($index)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>

        @if (error) {
          <div class="error-message shake">
            {{ error }}
          </div>
        }

        @if (success) {
          <div class="success-message">
            {{ success }}
          </div>
        }

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="resetForm()">Clear</button>
          <button type="submit" class="btn-primary" [disabled]="loading">
            @if (!loading) {
              <span>{{ isEditMode ? 'Update Listing' : 'List Product' }}</span>
            }
            @if (loading) {
              <span class="spinner"></span>
            }
          </button>
        </div>
      </form>
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
          
          <h2 class="overlay-title">{{ isEditMode ? 'Listing Updated!' : 'Product Listed!' }}</h2>
          <p class="overlay-message">
            {{ isBlocked ? 'Your listing has been updated and submitted to admin for verification.' : (isEditMode ? 'Your listing changes have been saved.' : 'Your item has been successfully published to CampusCart.') }}
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
          <span class="redirect-hint">Redirecting to My Listings...</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .sell-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      margin-bottom: 2rem;
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

    .sell-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .form-section h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1rem;
    }

    .section-hint {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0 0 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    input, select, textarea {
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s ease;
      background: #f8fafc;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #6366f1;
      background: white;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    select {
      cursor: pointer;
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }

    .image-upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f8fafc;
    }

    .image-upload-area:hover {
      border-color: #6366f1;
      background: #f5f3ff;
    }

    .image-upload-area.loading {
      border-color: #6366f1;
      background: #f5f3ff;
      cursor: not-allowed;
    }

    .upload-spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 0.5rem;
      border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      color: #64748b;
    }

    .image-upload-area:hover .upload-icon {
      color: #6366f1;
    }

    .image-upload-area p {
      color: #334155;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .image-upload-area span {
      color: #64748b;
      font-size: 0.875rem;
    }

    .image-previews {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .preview-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .remove-image:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .remove-image svg {
      width: 14px;
      height: 14px;
      color: white;
    }

    .error-message {
      background: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
    }

    .success-message {
      background: #d1fae5;
      color: #059669;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    button {
      padding: 0.875rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #f1f5f9;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .shake {
      animation: shake 0.4s ease-in-out;
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
      font-size: 0.8125rem;
      font-weight: 600;
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
      .sell-container {
        padding: 1.5rem 1rem;
      }

      .form-section {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
        gap: 0.75rem;
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
export class SellComponent implements OnInit {
  title = '';
  description = '';
  price: number | null = null;
  categoryId = '';
  condition = '';
  location = '';
  imagePreview: string[] = [];
  imageFiles: File[] = [];

  error = '';
  success = '';
  loading = false;
  showSuccessOverlay = false;

  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  categories = this.productService.categories;

  isEditMode = false;
  isBlocked = false;
  productId: string | null = null;
  private route = inject(ActivatedRoute);

  ngOnInit() {
    if (this.categories().length === 0) {
      this.productService.loadCategories();
    }

    this.route.queryParams.subscribe(async params => {
      const id = params['id'];
      if (id) {
        this.productId = id;
        this.isEditMode = true;
        await this.loadProductForEditing(id);
      }
    });
  }

  async loadProductForEditing(id: string) {
    this.loading = true;
    try {
      const product = await this.productService.getProductById(id);
      if (product) {
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.categoryId = product.category_id;
        this.condition = product.condition;
        this.location = product.location || '';
        this.imagePreview = product.images || [];
        this.isBlocked = product.is_blocked || false;
      } else {
        this.error = 'Listing not found.';
      }
    } catch (e) {
      this.error = 'Failed to load listing details.';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  uploadingImages = false;

  async handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    this.error = '';
    this.uploadingImages = true;

    const maxFiles = 5;
    const remainingSlots = maxFiles - this.imagePreview.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    const promises = filesToUpload.map(file => {
      return new Promise<void>((resolve) => {
        if (file.size > 5 * 1024 * 1024) {
          this.error = 'Image size should be less than 5MB';
          resolve();
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.push(e.target?.result as string);
          this.imageFiles.push(file);
          resolve();
        };
        reader.onerror = () => {
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      await Promise.all(promises);
    } catch (err) {
      console.error(err);
    } finally {
      this.uploadingImages = false;
      target.value = '';
    }
  }

  removeImage(index: number) {
    this.imagePreview.splice(index, 1);
    this.imageFiles.splice(index, 1);
  }

  async handleSubmit() {
    this.error = '';
    this.success = '';

    if (!this.title || !this.description || !this.price || !this.categoryId || !this.condition) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;

    try {
      const profile = this.authService.profile();
      if (!profile) {
        this.error = 'You need to be logged in to list a product';
        return;
      }

      const imageUrls = await this.uploadImages();

      const payload = {
        title: this.title,
        description: this.description,
        price: Number(this.price) || 0,
        category_id: this.categoryId,
        condition: this.condition as any,
        location: this.location,
        images: imageUrls,
      };

      if (this.isEditMode && this.productId) {
        const updates: any = { ...payload };
        if (this.isBlocked) {
          updates.is_blocked = true;
          updates.verification_pending = true;
        }
        await this.productService.updateProduct(this.productId, updates);
      } else {
        await this.productService.createProduct({
          ...payload,
          seller_id: profile.id,
          is_available: true,
        });
      }

      // Show premium success overlay animation
      this.showSuccessOverlay = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.showSuccessOverlay = false;
        this.resetForm();
        this.router.navigate(['/dashboard/my-listings']);
      }, 2200);
    } catch (err: any) {
      this.error = err.message || 'Failed to list product. Please try again.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async uploadImages(): Promise<string[]> {
    // Return the actual base64 Data URLs of the uploaded images.
    // If no images were uploaded, return empty array so that the smart category fallback displays properly.
    return this.imagePreview;
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.price = null;
    this.categoryId = '';
    this.condition = '';
    this.location = '';
    this.imagePreview = [];
    this.imageFiles = [];
    this.isBlocked = false;
    this.error = '';
    this.success = '';
  }
}
