# 🚛 FleetFlow — Multi-Tenant Fleet Management System

A full-stack fleet management platform built for logistics companies to manage vehicles, drivers, trips, maintenance, and expenses — all from a single dashboard with complete organisation-level data isolation.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Node.js%20+%20Express-green)
![Tech Stack](https://img.shields.io/badge/Database-PostgreSQL-purple)
![Tech Stack](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [API Endpoints](#-api-endpoints)
- [Multi-Tenancy Architecture](#-multi-tenancy-architecture)
- [Analytics Engine](#-analytics-engine)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Migrations](#-running-migrations)
- [Usage Guide](#-usage-guide)

Video Link- https://drive.google.com/drive/folders/1FmgpehGLp6R6pMrj_J6yuDi3JfwBFbVQ

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | JWT-based signup/login, role-based access (Manager & Dispatcher) |
| **Organisation** | Multi-tenant isolation, unique access codes, org ID sharing |
| **Vehicles** | Add, list, update status (Available / In Service / In Shop / Retired) |
| **Drivers** | Add, list, update status (Active / Off Duty / Suspended) |
| **Trips** | Create, dispatch, complete, cancel — with origin/destination/cargo tracking |
| **Maintenance** | Schedule service logs, auto-update vehicle status to "In Shop" |
| **Expenses** | Track fuel, tolls, permits, repairs — optionally linked to trips |
| **Analytics** | Real-time KPIs, fuel trend charts, fleet utilization, financial breakdown |
| **Profile** | Manager sees Organisation ID & Access Code to share with dispatchers |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Recharts, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT), bcrypt password hashing |
| **State Management** | React Context API |
| **Session Storage** | Browser sessionStorage (clears on tab close) |

---

## 📁 Project Structure

```
odoo26/
│
├── backend/
│   ├── migrations/                    # SQL table definitions
│   │   ├── 001_init.sql               # organisations & users tables
│   │   ├── 002_drivers.sql            # drivers table
│   │   ├── 003_trips.sql              # trips table
│   │   ├── 004_maintenance.sql        # maintenance_logs table
│   │   └── 005_expenses.sql           # expenses table
│   │
│   ├── src/
│   │   ├── controllers/               # Business logic handlers
│   │   │   ├── auth.controller.js     # Signup & login logic
│   │   │   ├── vehicle.controller.js  # Vehicle CRUD
│   │   │   ├── driver.controller.js   # Driver CRUD
│   │   │   ├── trip.controller.js     # Trip CRUD
│   │   │   ├── maintenance.controller.js  # Maintenance CRUD
│   │   │   └── expense.controller.js  # Expense CRUD
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.js      # JWT verification & role checks
│   │   │
│   │   ├── routes/                    # Express route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── vehicle.routes.js
│   │   │   ├── driver.routes.js
│   │   │   ├── trip.routes.js
│   │   │   ├── maintenance.routes.js
│   │   │   └── expense.routes.js
│   │   │
│   │   ├── db.js                      # PostgreSQL connection pool
│   │   └── server.js                  # Express app entry point
│   │
│   ├── .env                           # Backend environment variables
│   └── package.json
│
├── FleetFlow UI Wireframe Design (1)/
│   ├── src/
│   │   └── app/
│   │       ├── context/
│   │       │   └── AppContext.tsx      # Global state & API integration
│   │       │
│   │       ├── pages/
│   │       │   ├── LoginPage.tsx       # Email/password login
│   │       │   ├── SignupPage.tsx      # 2-step signup wizard
│   │       │   ├── DashboardPage.tsx   # Overview dashboard
│   │       │   ├── VehiclesPage.tsx    # Vehicle management
│   │       │   ├── DriversPage.tsx     # Driver management
│   │       │   ├── TripsPage.tsx       # Trip planning
│   │       │   ├── MaintenancePage.tsx # Maintenance scheduling
│   │       │   ├── ExpensesPage.tsx    # Expense tracking
│   │       │   └── AnalyticsPage.tsx   # Charts & financial reports
│   │       │
│   │       ├── components/
│   │       │   ├── Sidebar.tsx         # Navigation sidebar
│   │       │   └── AccountModal.tsx    # Profile with org ID & access code
│   │       │
│   │       └── services/
│   │           └── api.ts             # All HTTP calls to backend
│   │
│   ├── .env                           # VITE_API_URL
│   └── package.json
│
├── .gitignore
└── README.md                          # ← You are here
```

---

## 🗄️ Database Schema

### organisations
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `name` | TEXT | Organisation name |
| `access_code` | TEXT (UNIQUE) | 6-digit code for org membership |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### users
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `organisation_id` | UUID (FK) | References `organisations.id` |
| `name` | TEXT | Full name |
| `email` | TEXT (UNIQUE) | Login email |
| `password_hash` | TEXT | bcrypt hashed password |
| `role` | TEXT | `manager` or `dispatcher` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### vehicles
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `organisation_id` | UUID (FK) | References `organisations.id` |
| `name` | TEXT | Vehicle model/name |
| `plate` | TEXT | Registration plate |
| `type` | TEXT | Truck / Van / Car / Bus |
| `max_capacity` | INTEGER | Max load in kg |
| `purchase_date` | DATE | Date of purchase |
| `odometer` | INTEGER | Current odometer in km |
| `status` | TEXT | Available / In Service / In Shop / Retired |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

> **Unique constraint:** `(organisation_id, plate)` — same plate can exist in different orgs.

### drivers
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `name` | TEXT | Driver full name |
| `phone` | TEXT | Phone number |
| `license_number` | TEXT | Driving license number |
| `license_expiry` | DATE | License expiry date |
| `organisation_access_code` | TEXT | Org scoping via shared access code |
| `status` | TEXT | active / off_duty / suspended |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

> **Unique constraint:** `(organisation_access_code, license_number)`

### trips
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `organisation_id` | UUID (FK) | References `organisations.id` |
| `vehicle_id` | UUID | References a vehicle |
| `driver_id` | UUID | References a driver |
| `origin` | TEXT | Starting location |
| `destination` | TEXT | Delivery location |
| `status` | TEXT | Draft / Dispatched / Completed / Cancelled |
| `departure_time` | TIMESTAMPTZ | Scheduled departure |
| `eta` | TIMESTAMPTZ | Estimated time of arrival |
| `cargo_weight` | INTEGER | Cargo weight in kg |
| `estimated_cost` | INTEGER | Estimated trip cost in ₹ |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### maintenance_logs
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `organisation_id` | UUID (FK) | References `organisations.id` |
| `vehicle_id` | UUID | References a vehicle |
| `service_type` | TEXT | Oil Change / Tyre Replacement / Brake Service / Engine Repair / General Service |
| `description` | TEXT | Service details |
| `cost` | INTEGER | Service cost |
| `scheduled_date` | DATE | Scheduled service date |
| `status` | TEXT | Scheduled / In Progress / Completed |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

> **Auto-status:** Creating a log sets vehicle to "In Shop". Completing the last open log sets vehicle back to "Available".

### expenses
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique ID |
| `organisation_id` | UUID (FK) | References `organisations.id` |
| `trip_id` | UUID (nullable) | Optionally linked to a trip |
| `category` | TEXT | Fuel / Tolls / Permits / Repairs / Salary / Other |
| `amount` | INTEGER | Expense amount |
| `description` | TEXT | Expense details |
| `expense_date` | DATE | Date of expense |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## 🔐 Authentication Flow

### Manager Signup
```
1. User enters: name, email, password
2. Selects role: "Fleet Manager"
3. Enters organisation name (e.g. "ABC Logistics")
4. Backend generates random 6-digit access code
5. Creates organisation row + user row
6. Manager logs in → gets JWT with organisationId + access_code
7. Views Organisation ID & Access Code in profile modal
8. Shares Organisation ID with dispatchers
```

### Dispatcher Signup
```
1. User enters: name, email, password
2. Selects role: "Dispatcher"
3. Enters Organisation ID (UUID received from manager)
4. Backend looks up existing org by that UUID
5. Creates new org row with SAME name & access_code
6. Creates user row linked to new org row
7. Dispatcher logs in → JWT resolves to SAME canonical org ID as manager
8. Both users now see identical data
```

### Login & JWT
```
1. User submits email + password
2. Backend verifies credentials via bcrypt
3. Resolves canonical organisation_id (oldest org row with same access_code)
4. Signs JWT with: { userId, role, organisationId, access_code }
5. Frontend stores token in sessionStorage
6. All subsequent API calls include: Authorization: Bearer <token>
```

### JWT Payload Structure
```json
{
  "userId": "uuid-of-user",
  "role": "manager",
  "organisationId": "canonical-org-uuid",
  "access_code": "482951"
}
```

---

## 📡 API Endpoints

### Auth (No authentication required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Create a new account (manager or dispatcher) |
| `POST` | `/auth/login` | Login and receive JWT token |

### Vehicles (JWT required — manager, dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/vehicles` | List all vehicles for the organisation |
| `POST` | `/vehicles` | Add a new vehicle |
| `PATCH` | `/vehicles/:id/status` | Update vehicle status |

### Drivers (JWT required — manager, dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/drivers` | List all drivers for the organisation |
| `POST` | `/drivers` | Add a new driver |
| `PATCH` | `/drivers/:id/status` | Update driver status |

### Trips (JWT required — manager, dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/trips` | List all trips for the organisation |
| `POST` | `/trips` | Create a new trip |
| `PATCH` | `/trips/:id/status` | Update trip status (Dispatch / Complete / Cancel) |

### Maintenance (JWT required — manager, dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/maintenance` | List all maintenance logs for the organisation |
| `POST` | `/maintenance` | Create a maintenance log |
| `PATCH` | `/maintenance/:id/status` | Update log status (Start / Complete) |

### Expenses (JWT required — manager, dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/expenses` | List all expenses for the organisation |
| `POST` | `/expenses` | Create an expense |
| `DELETE` | `/expenses/:id` | Delete an expense |

---

## 🔒 Multi-Tenancy Architecture

```
              Organisation A                    Organisation B
              (access_code: 482951)             (access_code: 739201)
                     │                                 │
              org_id: aaa-bbb                   org_id: xxx-yyy
                     │                                 │
          ┌──────────┼──────────┐           ┌──────────┼──────────┐
          │          │          │           │          │          │
       Manager  Dispatcher1  Disp2      Manager  Dispatcher1  Disp2
          │          │          │           │          │          │
          └──────────┼──────────┘           └──────────┼──────────┘
                     │                                 │
              JWT contains:                     JWT contains:
              org_id: aaa-bbb                   org_id: xxx-yyy
              code: 482951                      code: 739201
                     │                                 │
                     ▼                                 ▼
          WHERE org_id = aaa-bbb          WHERE org_id = xxx-yyy
```

### Isolation Rules
- **Vehicles, Trips, Maintenance, Expenses** → filtered by `organisation_id` (UUID)
- **Drivers** → filtered by `organisation_access_code` (6-digit code)
- **Every single database query** includes the org filter — no data leaks possible
- **No admin/superuser endpoint** exists that could bypass org scoping

---

## 📊 Analytics Engine

### Overview Tab

| KPI | Formula |
|-----|---------|
| Total Fuel Cost | `SUM(amount)` from expenses where category = 'Fuel' |
| Fleet Utilization % | `(vehicles with ≥ 1 trip ÷ total vehicles) × 100` |
| Trip Completion % | `(completed trips ÷ total trips) × 100` |
| Active Drivers | `COUNT(drivers)` where status = 'active' |

**Charts:**
- **Fuel Cost Trend** — Line chart grouping fuel expenses by month
- **Top Utilized Vehicles** — Bar chart showing trip count per vehicle
- **Vehicle Performance Table** — Per-vehicle fuel cost, maintenance cost, trip count, ROI

### Financial Tab

| KPI | Formula |
|-----|---------|
| Total Revenue | `SUM(estimated_cost)` from completed trips |
| Fuel Spend | `SUM(amount)` from expenses where category = 'Fuel' |
| Maintenance Spend | `SUM(cost)` from maintenance_logs |
| Net Profit | Revenue − All Expenses − Maintenance Costs |

**Charts:**
- **Revenue vs Costs** — Monthly bar chart comparing income vs outflow
- **Financial Summary Table** — Per-month revenue, fuel, maintenance, other expenses, profit, margin %

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ — [Download](https://nodejs.org/)
- **PostgreSQL** v14+ — [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

### Installation

```powershell
# Clone the repository
git clone https://github.com/YOUR_USERNAME/odoo26.git
cd odoo26

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd "../FleetFlow UI Wireframe Design (1)"
npm install
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fleetflow
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
```

### Frontend (`FleetFlow UI Wireframe Design (1)/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🗃️ Running Migrations

Execute the SQL files in order on your PostgreSQL database:

```powershell
# Connect to PostgreSQL and run each migration
psql -U postgres -d fleetflow -f backend/migrations/001_init.sql
psql -U postgres -d fleetflow -f backend/migrations/002_drivers.sql
psql -U postgres -d fleetflow -f backend/migrations/003_trips.sql
psql -U postgres -d fleetflow -f backend/migrations/004_maintenance.sql
psql -U postgres -d fleetflow -f backend/migrations/005_expenses.sql
```

Or if using pgAdmin, open each `.sql` file and execute them in sequence.

---

## ▶️ Running the Application

```powershell
# Terminal 1 — Start Backend (from project root)
cd backend
node src/server.js
# Server runs on http://localhost:5000

# Terminal 2 — Start Frontend (from project root)
cd "FleetFlow UI Wireframe Design (1)"
npm run dev
# App runs on http://localhost:5173
```

---

## 📖 Usage Guide

### Step 1: Manager Creates Organisation
1. Open `http://localhost:5173`
2. Click **Sign Up**
3. Enter name, email, password
4. Select **Fleet Manager** role
5. Enter organisation name (e.g. "ABC Logistics")
6. Submit → Login with credentials

### Step 2: Manager Gets Organisation ID
1. After login, click avatar/profile icon in sidebar
2. **Account Modal** shows:
   - **Organisation ID** (UUID) — share this with dispatchers
   - **Access Code** (6-digit) — internal reference
3. Copy the Organisation ID

### Step 3: Dispatcher Joins Organisation
1. Dispatcher opens signup page
2. Enters their name, email, password
3. Selects **Dispatcher** role
4. Pastes the **Organisation ID** received from manager
5. Submit → Login → sees same data as manager

### Step 4: Manage Fleet
1. **Vehicles** → Add vehicles with model, plate, type, capacity
2. **Drivers** → Add drivers with name, phone, license details
3. **Trips** → Create trips by selecting vehicle + driver, set origin/destination
4. **Maintenance** → Schedule service for vehicles (auto-sets vehicle to "In Shop")
5. **Expenses** → Track fuel, tolls, permits, optionally link to trips
6. **Analytics** → View real-time KPIs, charts, financial summaries

---

## 🏗️ Technical Decisions

| Decision | Reasoning |
|----------|-----------|
| JWT with `organisationId` + `access_code` | Both scoping mechanisms available in every request |
| Canonical org ID resolution on login | Manager & dispatcher always get the same `organisationId` |
| Drivers scoped by `access_code` | Simpler than resolving canonical org ID for driver queries |
| Other tables scoped by `organisation_id` | Direct FK relationship, enforced at database level |
| `sessionStorage` for JWT | Auto-clears on tab close — more secure than localStorage |
| bcrypt for passwords | Industry standard, salted hashing with configurable rounds |
| Toast notifications | Immediate feedback on every create/update/delete action |
| Form validation + disabled submit | Prevents duplicate submissions and invalid data |
| Auto vehicle status on maintenance | Business logic: vehicle goes "In Shop" when service is logged |
| Vite for frontend | Fast dev server with HMR, optimized production builds |

---

## 🤝 Roles & Permissions

| Action | Manager | Dispatcher |
|--------|:-------:|:----------:|
| Create organisation | ✅ | ❌ |
| Join organisation | ❌ | ✅ |
| View org ID & access code | ✅ | ❌ |
| Add / view vehicles | ✅ | ✅ |
| Add / view drivers | ✅ | ✅ |
| Create / manage trips | ✅ | ✅ |
| Log maintenance | ✅ | ✅ |
| Track expenses | ✅ | ✅ |
| View analytics | ✅ | ✅ |

---

## 📄 License

This project is built for educational and demonstration purposes.

---

> **Built with ❤️ using React, Node.js, and PostgreSQL**
