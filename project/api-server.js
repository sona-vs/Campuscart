/**
 * CampusCart Local API Server
 * Stores all data in db.json so mobile & desktop share the same data.
 * Run with: node api-server.js
 * Runs on port 3001 alongside Angular (port 4200)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// ── helpers ───────────────────────────────────────────────────────────────────
function readDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: [], profiles: [], products: [] }; }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function uuid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function readBody(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { res(body ? JSON.parse(body) : {}); }
      catch { rej(new Error('Invalid JSON')); }
    });
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

// ── router ────────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const url    = req.url.split('?')[0];
  const method = req.method;
  const db     = readDb();

  try {
    // ── AUTH ─────────────────────────────────────────────────────────────────

    // POST /api/auth/signin  { username, email }
    if (method === 'POST' && url === '/api/auth/signin') {
      const body = await readBody(req);
      const username = body.username;
      const email = body.email;
      const identifier = body.identifier;

      let profile;
      if (username && email) {
        const cleanUser = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // 1. Try to find an existing profile that matches both (email + username/id/fullname)
        profile = db.profiles.find(p =>
          p.email?.toLowerCase() === cleanEmail &&
          (p.id?.toLowerCase() === cleanUser || p.full_name?.toLowerCase() === cleanUser)
        );

        // 2. Fallback: If not found, try to find by email alone (smooth experience for existing emails)
        if (!profile) {
          profile = db.profiles.find(p => p.email?.toLowerCase() === cleanEmail);
        }

        // 3. Fallback: If still not found, check if it's admin or auto-create
        if (!profile) {
          if (cleanUser === 'admin' || cleanEmail === 'admin@campuscart.com') {
            profile = {
              id: 'admin',
              email: 'admin@campuscart.com',
              full_name: 'Admin',
              college_name: 'CampusCart Admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            db.profiles.push(profile);
            writeDb(db);
          } else {
            // Auto-create so testing is seamless
            const id = cleanUser.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'user_' + Date.now().toString(36);
            profile = {
              id: id,
              email: cleanEmail,
              full_name: username.trim(),
              college_name: 'Rathinam University',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            db.profiles.push(profile);
            writeDb(db);
          }
        }
      } else {
        // Fallback for single identifier
        const activeId = (identifier || username || email || '').trim();
        if (!activeId) return send(res, 400, { error: 'username and email required' });

        const clean = activeId.toLowerCase();
        profile = db.profiles.find(p =>
          p.email?.toLowerCase() === clean ||
          p.full_name?.toLowerCase() === clean ||
          p.id?.toLowerCase() === clean
        );

        if (!profile) {
          if (clean === 'admin' || clean === 'admin@campuscart.com') {
            profile = {
              id: 'admin',
              email: 'admin@campuscart.com',
              full_name: 'Admin',
              college_name: 'CampusCart Admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          } else {
            profile = {
              id: clean.replace(/\s+/g, '_').replace(/@.*/, ''),
              email: clean.includes('@') ? clean : '',
              full_name: clean.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              college_name: 'Rathinam University',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          db.profiles.push(profile);
          writeDb(db);
        }
      }

      return send(res, 200, { user: { id: profile.id, email: profile.email }, profile });
    }

    // POST /api/auth/signup  { email, fullName, collegeName }
    if (method === 'POST' && url === '/api/auth/signup') {
      const { email, fullName, collegeName } = await readBody(req);
      if (!email || !fullName) return send(res, 400, { error: 'email and fullName required' });

      const clean = email.trim().toLowerCase();
      const exists = db.profiles.find(p => p.email?.toLowerCase() === clean);
      if (exists) return send(res, 409, { error: 'An account with this email already exists.' });

      const profile = {
        id: clean.replace(/@.*/, '').replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36),
        email: clean,
        full_name: fullName.trim(),
        college_name: (collegeName || 'Rathinam University').trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.profiles.push(profile);
      writeDb(db);

      return send(res, 201, { user: { id: profile.id, email: profile.email }, profile });
    }

    // GET /api/auth/profiles
    if (method === 'GET' && url === '/api/auth/profiles') {
      return send(res, 200, db.profiles || []);
    }

    // GET /api/auth/profile/:id
    if (method === 'GET' && url.startsWith('/api/auth/profile/')) {
      const id = url.split('/').pop();
      const profile = db.profiles.find(p => p.id === id);
      if (!profile) return send(res, 404, { error: 'Profile not found' });
      return send(res, 200, profile);
    }

    // PUT /api/auth/profile/:id
    if (method === 'PUT' && url.startsWith('/api/auth/profile/')) {
      const id = url.split('/').pop();
      const idx = db.profiles.findIndex(p => p.id === id);
      if (idx === -1) return send(res, 404, { error: 'Profile not found' });
      const body = await readBody(req);
      db.profiles[idx] = { ...db.profiles[idx], ...body, updated_at: new Date().toISOString() };
      writeDb(db);
      return send(res, 200, db.profiles[idx]);
    }

    // ── PRODUCTS ──────────────────────────────────────────────────────────────

    // GET /api/products  (optional ?category=cat-1&search=xyz&limit=10)
    if (method === 'GET' && url === '/api/products') {
      const qs       = req.url.includes('?') ? req.url.split('?')[1] : '';
      const params   = new URLSearchParams(qs);
      const category = params.get('category');
      const search   = params.get('search')?.toLowerCase();
      const limit    = parseInt(params.get('limit') || '100');
      const featured = params.get('featured');
      const includeAll = params.get('all') === '1';

      let list = db.products;
      if (!includeAll) {
        list = list.filter(p => p.is_available !== false && p.is_blocked !== true);
      }

      if (category) list = list.filter(p => p.category_id === category);
      if (search)   list = list.filter(p =>
        p.title?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );

      // attach category & seller info
      list = list.map(p => ({
        ...p,
        category: db.categories?.find(c => c.id === p.category_id) || null,
        seller:   db.profiles.find(u => u.id === p.seller_id) || null,
      }));

      if (featured) list = list.slice(0, 8);
      else          list = list.slice(0, limit);

      return send(res, 200, list);
    }

    // GET /api/products/:id
    if (method === 'GET' && url.match(/^\/api\/products\/[^/]+$/)) {
      const id = url.split('/').pop();
      const p  = db.products.find(p => p.id === id);
      if (!p) return send(res, 404, { error: 'Product not found' });
      return send(res, 200, {
        ...p,
        category: db.categories?.find(c => c.id === p.category_id) || null,
        seller:   db.profiles.find(u => u.id === p.seller_id) || null,
      });
    }

    // POST /api/products
    if (method === 'POST' && url === '/api/products') {
      const body = await readBody(req);
      const product = {
        id: uuid(),
        ...body,
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.products.push(product);

      // Create notification
      if (!db.notifications) db.notifications = [];
      const cat = db.categories?.find(c => c.id === product.category_id);
      db.notifications.push({
        id: uuid(),
        type: 'new_item',
        title: 'New Listing Posted! 🚀',
        message: `"${product.title}" has just been listed in ${cat?.name || 'Marketplace'} for ₹${product.price}!`,
        product_id: product.id,
        seller_id: product.seller_id,
        created_at: new Date().toISOString(),
        read_by: []
      });

      writeDb(db);
      return send(res, 201, product);
    }

    // PUT /api/products/:id
    if (method === 'PUT' && url.match(/^\/api\/products\/[^/]+$/)) {
      const id  = url.split('/').pop();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx === -1) return send(res, 404, { error: 'Product not found' });
      const body = await readBody(req);
      
      const wasBlocked = db.products[idx].is_blocked === true;
      const isBlockedNow = body.is_blocked === true;

      const wasPending = db.products[idx].verification_pending === true;
      const isPendingNow = body.verification_pending === true;

      db.products[idx] = { ...db.products[idx], ...body, updated_at: new Date().toISOString() };

      // If item is blocked, notify the seller
      if (isBlockedNow && !wasBlocked) {
        if (!db.notifications) db.notifications = [];
        db.notifications.push({
          id: uuid(),
          type: 'item_blocked',
          title: 'Listing Suspended ⚠️',
          message: `Your listing "${db.products[idx].title}" has been suspended by the admin: "${db.products[idx].blocked_reason || 'Violated community guidelines.'}". Please edit it to correct issues and request an unblock.`,
          product_id: db.products[idx].id,
          target_user_id: db.products[idx].seller_id,
          created_at: new Date().toISOString(),
          read_by: []
        });
      }

      // If item is pending verification, notify the admin
      if (isPendingNow && !wasPending) {
        if (!db.notifications) db.notifications = [];
        db.notifications.push({
          id: uuid(),
          type: 'verification_pending',
          title: 'Verification Request 📝',
          message: `"${db.products[idx].title}" has been edited by the seller and is waiting for your verification.`,
          product_id: db.products[idx].id,
          target_user_id: 'admin',
          created_at: new Date().toISOString(),
          read_by: []
        });
      }

      writeDb(db);
      return send(res, 200, db.products[idx]);
    }

    // DELETE /api/products/:id
    if (method === 'DELETE' && url.match(/^\/api\/products\/[^/]+$/)) {
      const id  = url.split('/').pop();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx === -1) return send(res, 404, { error: 'Product not found' });
      db.products.splice(idx, 1);
      writeDb(db);
      return send(res, 200, { success: true });
    }

    // GET /api/notifications
    if (method === 'GET' && url === '/api/notifications') {
      const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
      const params = new URLSearchParams(qs);
      const userId = params.get('user_id');

      if (!db.notifications) db.notifications = [];

      // Deliver targeted notifications or standard notifications filtering out seller's own postings
      let result = db.notifications;
      if (userId) {
        result = result.filter(n => {
          if (n.target_user_id) {
            return n.target_user_id === userId;
          }
          return n.seller_id !== userId;
        });
      }

      // Sort notifications to return newest first
      const sorted = result.map(n => ({
        ...n,
        is_read: userId ? n.read_by?.includes(userId) : false
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return send(res, 200, sorted);
    }

    // POST /api/notifications/read-all
    if (method === 'POST' && url === '/api/notifications/read-all') {
      const { user_id } = await readBody(req);
      if (!user_id) return send(res, 400, { error: 'user_id required' });

      if (!db.notifications) db.notifications = [];
      db.notifications.forEach(n => {
        if (!n.read_by) n.read_by = [];
        if (!n.read_by.includes(user_id)) {
          n.read_by.push(user_id);
        }
      });
      writeDb(db);
      return send(res, 200, { success: true });
    }

    // GET /api/notices
    if (method === 'GET' && url === '/api/notices') {
      const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
      const params = new URLSearchParams(qs);
      const type = params.get('type');

      if (!db.notices) db.notices = [];
      let list = db.notices;
      if (type) {
        list = list.filter(n => n.type === type);
      }

      // attach creator details
      list = list.map(n => ({
        ...n,
        creator: db.profiles.find(p => p.id === n.created_by) || null
      }));

      // Sort newest first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return send(res, 200, list);
    }

    // POST /api/notices
    if (method === 'POST' && url === '/api/notices') {
      const body = await readBody(req);
      const notice = {
        id: uuid(),
        ...body,
        created_at: new Date().toISOString()
      };
      if (!db.notices) db.notices = [];
      db.notices.push(notice);
      writeDb(db);
      return send(res, 201, notice);
    }

    // DELETE /api/notices/:id
    if (method === 'DELETE' && url.match(/^\/api\/notices\/[^/]+$/)) {
      const id = url.split('/').pop();
      if (!db.notices) db.notices = [];
      const idx = db.notices.findIndex(n => n.id === id);
      if (idx === -1) return send(res, 404, { error: 'Notice not found' });
      db.notices.splice(idx, 1);
      writeDb(db);
      return send(res, 200, { success: true });
    }

    // GET /api/categories
    if (method === 'GET' && url === '/api/categories') {
      return send(res, 200, db.categories || []);
    }

    // ── fallback ──────────────────────────────────────────────────────────────
    send(res, 404, { error: `Route not found: ${method} ${url}` });

  } catch (err) {
    console.error('API error:', err);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   CampusCart API Server  ✓ Running       ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Local:    http://localhost:${PORT}/api      ║`);
  console.log(`║  Network:  http://<your-ip>:${PORT}/api     ║`);
  console.log('║  Data:     db.json (shared across devices)║');
  console.log('╚══════════════════════════════════════════╝\n');
});
