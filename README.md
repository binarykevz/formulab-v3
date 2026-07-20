# formulab-v3
formulab v3
<div align="center">

# Enterprise ERP System

**Full-stack Enterprise Resource Planning application with role-based access control, real-time chat, purchase workflow, and Telegram integration.**

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![Turso](https://img.shields.io/badge/Turso-Database-4FF8D2?logo=turso)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## Features

- **Auth System** — Register/Login with username or email. 7-day session cache. JWT authentication.
- **RBAC** — Department-based permissions (QA, R&D, Marketing, Production, Purchasing, Inventory, Management). Organization-scoped data isolation.
- **Raw Materials Inventory** — Full CRUD. Search. Excel import/export. Auto-calculated unit costs.
- **Formulation** — Material formulation table with unit cost and sachet cost formulas. PDF export with auto-forward to Telegram.
- **Purchase Requests** — Multi-step workflow: `pending → approved → arrival → received` (or `rejected`). Status filtering. Full audit history.
- **Suppliers** — Supplier directory per organization.
- **Reports** — Cost analysis with visual breakdowns. Inventory value. PR statistics.
- **Organization Chat** — Real-time messenger-style chat scoped to same organization. Red dot notification badge.
- **Telegram Integration** — Auto-notify on registration, PR creation/status changes, and formulation PDF delivery.
- **Futuristic UI** — Dark theme with animated cyan grid background. Login feedback (red/green grid).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | Turso (libSQL) — falls back to local SQLite |
| Auth | bcryptjs, JSON Web Tokens |
| PDF | jsPDF + jsPDF-AutoTable |
| Excel | SheetJS (xlsx) |
| Notifications | Telegram Bot API |
| Frontend | Vanilla JS (modular), CSS3 |

## Project Structure

```
enterprise-erp/
├── server/
│   ├── index.js              # Express entry point
│   ├── db.js                 # Turso/libSQL database setup + schema
│   ├── telegram.js           # Telegram notification helpers
│   ├── middleware/
│   │   └── auth.js           # JWT sign + verify middleware
│   └── routes/
│       ├── auth.js           # Register + Login
│       ├── materials.js      # Materials CRUD
│       ├── formulations.js   # Formulations CRUD + PDF upload
│       ├── suppliers.js      # Suppliers CRUD
│       ├── purchaserequests.js # PR create + status updates + history
│       ├── chat.js           # Organization-scoped messaging
│       └── team.js           # Team member listing
├── public/
│   ├── index.html            # SPA shell
│   ├── css/
│   │   ├── theme.css         # Variables, reset, forms
│   │   ├── layout.css        # Sidebar, topbar, tabs
│   │   ├── components.css    # Cards, tables, modals, buttons, badges
│   │   ├── auth.css          # Login/register screens
│   │   └── chat.css          # Floating chat widget
│   └── js/
│       ├── app.js            # Entry point, initializes all modules
│       └── modules/
│           ├── utils.js      # Shared utilities (esc, fmt, calcUnitCost)
│           ├── cache.js      # 7-day session cache (localStorage + TTL)
│           ├── grid.js       # Canvas grid background animation
│           ├── modal.js      # Modal open/close helper
│           ├── api.js        # HTTP client (fetch + JWT headers)
│           ├── auth.js       # Login/register UI logic
│           ├── materials.js  # Inventory module
│           ├── suppliers.js  # Supplier module
│           ├── formulation.js # Formulation + PDF generation + Telegram
│           ├── purchaserequests.js # PR workflow + status management
│           ├── chat.js       # Chat widget with polling
│           ├── reports.js    # Reports rendering
│           ├── team.js       # Team member listing
│           ├── dashboard.js  # Dashboard stats + recent items
│           ├── navigation.js # Tab switching, permissions, data loading
│           └── importexport.js # Excel import/export + drag-drop
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/enterprise-erp.git
cd enterprise-erp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
JWT_SECRET=your_random_secret_here
TURSO_DB_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=-1001234567890
```

> **Local development:** If `TURSO_DB_URL` is set to `file:local.db` (default), the app uses a local SQLite file. No Turso account needed.

### 3. Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Open `http://localhost:3000`.

## Getting Turso Database (Production)

1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Login: `turso auth login`
3. Create DB: `turso db create enterprise-erp`
4. Get URL: `turso db show enterprise-erp --url`
5. Get token: `turso db tokens create enterprise-erp`
6. Add both to `.env`

## Telegram Bot Setup

1. Message [@BotFather](https://t.me/botfather) on Telegram → `/newbot` → copy the token
2. Add token to `.env` as `TELEGRAM_BOT_TOKEN`
3. Send a message to your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat_id`
4. Add chat ID to `.env` as `TELEGRAM_CHAT_ID`

## RBAC Permissions

| Department | Inventory | Formulation | Create PR | Approve PR | Suppliers | Reports |
|------------|-----------|-------------|-----------|------------|-----------|---------|
| Management | Yes | Yes | Yes | **Yes** | Yes | Yes |
| Purchasing | Yes | No | Yes | **Yes** | Yes | Yes |
| QA | Yes | Yes | Yes | No | No | Yes |
| Production | Yes | Yes | Yes | No | No | No |
| R&D | No | Yes | Yes | No | No | No |
| Inventory | Yes | No | Yes | No | Yes | No |
| Marketing | No | No | Yes | No | No | No |

## Purchase Request Workflow

```
┌─────────┐    Approve    ┌──────────┐    Mark Arrival    ┌──────────┐    Mark Received    ┌──────────┐
│ PENDING │──────────────▶│ APPROVED │──────────────────▶│ ARRIVAL │────────────────────▶│ RECEIVED │
└─────────┘               └──────────┘                   └──────────┘                     └──────────┘
     │                         
     │ Reject                  
     ▼                         
┌──────────┐
│ REJECTED │
└──────────┘
```

Only users in **Purchasing** or **Management** departments can change PR status.

## API Endpoints

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{username, email, password, organization, department}` | Create account |
| POST | `/api/auth/login` | `{identifier, password}` | Login (email or username) |

### Materials (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials` | List org materials |
| POST | `/api/materials` | Create material |
| PUT | `/api/materials/:id` | Update material |
| DELETE | `/api/materials/:id` | Delete material |

### Formulations (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/formulations` | List org formulations |
| POST | `/api/formulations` | Create formulation |
| DELETE | `/api/formulations/:id` | Delete formulation |
| POST | `/api/formulations/pdf` | Upload PDF → Telegram |

### Purchase Requests (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-requests` | List PRs (scoped by role) |
| POST | `/api/purchase-requests` | Create PR |
| PATCH | `/api/purchase-requests/:id/status` | Update status (purchasing/management only) |
| GET | `/api/purchase-requests/:id/history` | Get PR history |

### Suppliers (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List org suppliers |
| POST | `/api/suppliers` | Create supplier |
| DELETE | `/api/suppliers/:id` | Delete supplier |

### Chat (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat?since=<iso>` | Get org messages |
| POST | `/api/chat` | Send message |

### Team (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/team` | List org members |

## Formulas

```
Unit Cost     = (Raw Material Price × 1000) / Qty in Bulk
Sachet Cost   = Amount per Sachet × 1000 × Unit Cost
```

## License

MIT
