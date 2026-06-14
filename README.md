# 📺 Destiny Word Ministries International TV

A private, access-controlled streaming platform for Destiny Word Ministries International. Only approved members can access the content.

---

## ✨ Features

- 🔐 **Access-controlled** — Admin approves users, or members use invite codes for instant access
- 🎬 **Video Upload** — Upload MP4/WebM/MOV up to 2GB directly to the server
- 🔗 **Embed Support** — Embed YouTube, Vimeo, or any video URL
- 📺 **TV-style Homepage** — Hero banner, categories, featured videos
- 🔴 **Live Streaming** — Mark videos as LIVE with a live URL
- 🎫 **Invite Codes** — Admin generates one-time codes (format: DESTV-XXXXXX)
- 👥 **Admin Dashboard** — Manage videos, members, categories, stats
- 📱 **Responsive** — Works on mobile, tablet, and desktop
- 🎨 **Royal Branding** — Deep purple & gold, Cinzel serif typography

---

## 🚀 Deploy to Render

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Destiny TV"
git remote add origin https://github.com/YOUR_USERNAME/destiny-tv.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and create an account
2. Click **New** → **Blueprint** (or **Web Service**)
3. Connect your GitHub repo
4. Render will detect `render.yaml` automatically
5. Click **Apply** — it will:
   - Build the React frontend
   - Install backend dependencies
   - Create a persistent 10GB disk for the database and uploads
   - Start the server

### 3. Change Default Admin Password (IMPORTANT!)

After deployment, log in with:
- Email: `admin@destinytv.com`
- Password: `DestinyTV@Admin2024!`

Then go to your Render dashboard → **Environment Variables** and update:
- `ADMIN_PASSWORD` — change to something strong
- `JWT_SECRET` — Render auto-generates this, keep it

---

## 🔧 Local Development

```bash
# Install all dependencies
npm run install

# Start backend (port 5000)
npm run dev:backend

# Start frontend (port 3000) in another terminal
npm run dev:frontend
```

The React dev server proxies API requests to `localhost:5000`.

---

## 👤 User Access Flow

### Without invite code:
1. User registers at `/register`
2. Status set to **pending**
3. Admin approves at `/admin/users`

### With invite code:
1. Admin generates codes at `/admin/invites`
2. Admin shares code (format: `DESTV-XXXXXX`) or registration link
3. User registers and gets **instant access**

---

## 🎬 Adding Videos

Two ways:

**1. Upload a file** — MP4, WebM, QuickTime, AVI (up to 2GB)

**2. Embed a URL** — YouTube, Vimeo, or any direct video URL

Go to `/admin/upload` after logging in as admin.

---

## 📁 Project Structure

```
destiny-tv/
├── backend/
│   ├── routes/
│   │   ├── auth.js         # Login, register, JWT
│   │   ├── videos.js       # Upload, stream, CRUD
│   │   ├── admin.js        # Users, stats, invites
│   │   └── categories.js   # Category management
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── uploads/            # Video & thumbnail storage
│   ├── db.js               # SQLite database setup
│   └── server.js           # Express server
├── frontend/
│   └── src/
│       ├── pages/          # React pages
│       ├── components/     # Shared components
│       ├── context/        # Auth context
│       └── api.js          # Axios setup
├── render.yaml             # Render deployment config
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `ADMIN_EMAIL` | Default admin email | `admin@destinytv.com` |
| `ADMIN_PASSWORD` | Default admin password | `DestinyTV@Admin2024!` |
| `DB_PATH` | SQLite database path | `./destiny_tv.db` |
| `FRONTEND_URL` | CORS allowed origin | `*` |

---

## 🛡️ Security Notes

- All routes are authenticated — no public access
- Videos are served from the same server (no public CDN)
- Passwords are bcrypt-hashed
- Rate limiting: 200 requests per 15 minutes
- JWT tokens expire after 7 days

---

*Built for Destiny Word Ministries International*
