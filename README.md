# odoo26
# FleetFlow — Cursor Prompt for Hackathon Prototype

## PASTE THIS ENTIRE PROMPT INTO CURSOR

---

Build me a full-stack **FleetFlow** — a Modular Fleet & Logistics Management System — as a complete, working prototype in **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Zustand (state) + Recharts (analytics)**. Use `localStorage` + Zustand for persistence (no backend needed for prototype). This is for a hackathon — prioritize polish, working logic, and impressive UI over perfect architecture.

---

## AESTHETIC DIRECTION

Go for a **dark industrial-professional** theme:
- Background: `#0A0C10` (near-black), surface cards: `#111318`, borders: `#1E2330`
- Primary accent: `#3B82F6` (electric blue), success: `#10B981`, warning: `#F59E0B`, danger: `#EF4444`
- Font: **"DM Mono"** for data/numbers, **"Inter"** for body (import from Google Fonts)
- Status pills with colored dots (animated pulse for "On Trip"/"Active")
- Sidebar navigation with icons (use `lucide-react`)
- Glassmorphism cards on the dashboard with subtle `backdrop-blur`
- Smooth page transitions
- Data tables with hover row highlights and striped rows

---

## FILE STRUCTURE

```
/app
  /layout.tsx           ← root layout with sidebar
  /page.tsx             ← redirect to /dashboard
  /dashboard/page.tsx
  /vehicles/page.tsx
  /trips/page.tsx
  /maintenance/page.tsx
  /fuel/page.tsx
  /drivers/page.tsx
  /analytics/page.tsx
/components
  /layout/Sidebar.tsx
  /layout/TopBar.tsx
  /ui/StatusPill.tsx
  /ui/KPICard.tsx
  /ui/DataTable.tsx
  /ui/Modal.tsx
/store
  /useFleetStore.ts     ← Zustand store (all state + logic)
/lib
  /mockData.ts          ← seed data
  /types.ts
```

---

## TYPES (`/lib/types.ts`)

```typescript
export type VehicleType = 'Truck' | 'Van' | 'Bike';
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
export type DriverStatus = 'On Duty' | 'Off Duty' | 'Suspended';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
  maxCapacity: number; // kg
  odometer: number;
  status: VehicleStatus;
  acquisitionCost: number;
  region: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  licenseCategories: VehicleType[];
  status: DriverStatus;
  safetyScore: number; // 0-100
  tripsCompleted: number;
  tripsCancelled: number;
  avatar?: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  status: TripStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  startOdometer: number;
  endOdometer?: number;
  revenue?: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: string; // "Oil Change", "Tire Rotation", etc.
  description: string;
  cost: number;
  date: string;
  resolvedAt?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  date: string;
  odometer: number;
}
```

---

## SEED DATA (`/lib/mockData.ts`)

Generate realistic seed data:
- **8 vehicles**: 3 Trucks (15,000–20,000 kg capacity), 3 Vans (500–1,500 kg), 2 Bikes (50–100 kg). Mix of statuses: 3 Available, 2 On Trip, 1 In Shop, 1 Retired, 1 Available.
- **6 drivers**: Mix of On Duty (4), Off Duty (1), Suspended (1). One driver has an expired license (expiry in 2024). Safety scores between 65–98.
- **10 trips**: Mix of Completed (6), Dispatched (2), Cancelled (1), Draft (1).
- **8 maintenance logs**: Various types, costs $150–$2,400.
- **12 fuel logs**: Various vehicles, realistic liters/cost.

---

## ZUSTAND STORE (`/store/useFleetStore.ts`)

Implement ALL business logic here:

```typescript
// Key actions:
addVehicle, updateVehicle, retireVehicle
addDriver, updateDriver
createTrip(trip): validates CargoWeight <= MaxCapacity, throws error if not
  → on create: sets vehicle + driver status (if Dispatched immediately)
dispatchTrip(tripId): Vehicle → "On Trip", Driver → "On Duty"
completeTrip(tripId, endOdometer, revenue): Vehicle → "Available", Driver → "On Duty" (or "Off Duty"), updates odometer
cancelTrip(tripId): Vehicle + Driver → "Available"
addMaintenanceLog(log): Vehicle → "In Shop" automatically
resolveMaintenanceLog(logId): Vehicle → "Available"
addFuelLog(log)

// Computed selectors:
getVehicleById, getDriverById
getAvailableVehicles(): status === "Available"
getAvailableDrivers(): status !== "Suspended", license not expired, status !== "On Duty" (already on trip)
isLicenseExpired(driver): compare licenseExpiry to today
getTotalOperationalCost(vehicleId): sum of all fuel + maintenance costs
getFuelEfficiency(vehicleId): total km driven / total liters
getVehicleROI(vehicleId): (totalRevenue - totalCosts) / acquisitionCost * 100
getFleetUtilizationRate(): (On Trip vehicles / total active vehicles) * 100
```

Persist to localStorage with Zustand persist middleware.

---

## PAGE SPECIFICATIONS

### `/dashboard` — Command Center

Layout: 4 KPI cards on top row, then a 2-column grid (trip activity feed left, fleet status chart right), then a bottom row with "Alerts" panel.

**KPI Cards** (with icon, value, label, trend indicator):
1. 🚛 **Active Fleet** — count of "On Trip" vehicles — blue
2. 🔧 **Maintenance Alerts** — "In Shop" vehicles + expired licenses — amber
3. 📊 **Utilization Rate** — % fleet in use — green (show as circular progress ring using SVG)
4. 📦 **Pending Cargo** — Draft trips — purple

**Fleet Status Donut Chart** (Recharts): Available / On Trip / In Shop / Retired — with legend

**Recent Activity Feed**: Last 6 trips with status pills, driver name, vehicle, time ago

**Alerts Panel**: Red card list — expired licenses (driver name + days ago), vehicles In Shop > 3 days

**Filter Bar**: Tabs for Vehicle Type (All / Truck / Van / Bike) that filter the activity feed

---

### `/vehicles` — Vehicle Registry

**Top**: "Add Vehicle" button (opens modal) + search input + status filter dropdown

**Table columns**: Vehicle Name, Type (icon), License Plate, Capacity, Odometer, Region, Status (pill), Actions

**Row actions**: Edit (pencil icon), View Logs (history icon), Retire (toggle)

**Add/Edit Modal**: All fields with validation. Type selector with icons.

**Status Pills**: 
- Available → green dot + "Available"  
- On Trip → blue pulsing dot + "On Trip"  
- In Shop → amber dot + "In Shop"  
- Retired → gray dot + "Retired"

---

### `/trips` — Trip Dispatcher

**Top**: "Create Trip" button + status filter tabs (All / Draft / Dispatched / Completed / Cancelled)

**Table columns**: Trip ID, Route (Origin → Destination with arrow), Vehicle, Driver, Cargo (kg), Status, Created, Actions

**Create Trip Modal** (multi-step feel, single modal):
- Step 1: Origin, Destination, Cargo Weight (kg)
- Step 2: Select Vehicle (dropdown showing only Available, shows capacity), Select Driver (dropdown showing only eligible drivers)  
- **Live validation**: Show "✅ 450kg / 500kg capacity" or "❌ Exceeds capacity!" in real-time as user types cargo weight
- Step 3: Confirm & Dispatch or Save as Draft

**Actions per status**:
- Draft → "Dispatch" button (green), "Cancel" (red)
- Dispatched → "Complete Trip" button (opens modal to enter end odometer + revenue), "Cancel"
- Completed/Cancelled → "View Details"

---

### `/maintenance` — Service Logs

**Top**: "Log Service" button + vehicle filter

**Table**: Vehicle, Service Type, Description, Cost, Date, Status (Active/Resolved), Actions

**Log Service Modal**: Select vehicle (all vehicles shown, note if already In Shop), service type (dropdown: Oil Change, Tire Rotation, Brake Service, Engine Repair, Body Work, Other), description, cost, date. **Show warning banner**: "⚠️ Logging this service will set [Vehicle] to 'In Shop' and remove it from dispatch."

**Resolve button**: Marks resolved, sets vehicle back to Available. Show confirmation.

**Stats bar**: Total maintenance spend this month, Most serviced vehicle, Average cost per service

---

### `/fuel` — Expense & Fuel Logging

**Top**: "Log Fuel" button + vehicle filter + date range

**Summary cards**: Total Fuel Spend (this month), Total Liters, Avg Cost/Liter, Best Efficiency Vehicle

**Table**: Vehicle, Date, Liters, Cost/L, Total Cost, Odometer, Trip (if linked)

**Log Fuel Modal**: Select vehicle, date, liters, cost per liter (auto-calculates total), odometer reading, optional link to a completed trip

---

### `/drivers` — Driver Profiles

**Top**: "Add Driver" button + search + status filter

**Card grid view** (not table): Each driver card shows:
- Avatar (generated initials avatar with colored background)
- Name + License number
- Status pill
- Safety Score (circular gauge SVG, color-coded: <70 red, 70-85 amber, >85 green)
- Trips Completed / Cancelled
- License expiry (red if expired or expires within 30 days)
- "View Profile" + "Edit" buttons

**Driver Detail Modal/Panel**: Full stats, trip history, license categories, status toggle

**Expired license warning**: Banner at top of page if any active drivers have expired licenses

---

### `/analytics` — Reports

**Date range picker** (Last 7 days / 30 days / 90 days / Custom) at top

**Row 1 — Charts**:
- Line chart: Trips completed per day (last 30 days) — Recharts
- Bar chart: Fuel spend per vehicle — Recharts

**Row 2 — Tables**:
- **Vehicle ROI Table**: Vehicle, Revenue, Fuel Cost, Maintenance Cost, Net Profit, ROI %, Acquisition Cost — sortable
- **Driver Performance Table**: Driver, Trips, Completion Rate, Safety Score, Avg Cargo

**Row 3 — Metrics**:
- Fleet-wide fuel efficiency (km/L per vehicle) — horizontal bar chart
- Cost per km breakdown

**Export buttons**: "Export CSV" and "Export PDF" buttons (CSV should actually work using client-side download, PDF can show a toast "Generating PDF...")

---

## SIDEBAR NAVIGATION

Fixed left sidebar, 240px wide, dark background:

```
[FleetFlow Logo + animated truck icon]

OVERVIEW
  🏠 Dashboard          /dashboard
  
OPERATIONS  
  🚛 Vehicles           /vehicles
  🗺️  Trips              /trips
  🔧 Maintenance        /maintenance
  ⛽ Fuel & Expenses    /fuel

PEOPLE
  👤 Drivers            /drivers

INSIGHTS
  📈 Analytics          /analytics

[Bottom: User avatar + "Fleet Manager" role + settings icon]
```

Active route: highlighted with blue background pill, white text. Inactive: gray text.

Show **badge counts** on nav items:
- Maintenance: count of active (unresolved) service logs
- Drivers: count of expired/expiring licenses

---

## TOPBAR

Show: Current page title + breadcrumb, date/time (live clock updating every second), notification bell (shows alert count), search bar (searches across vehicles + drivers + trips by name/plate/ID).

---

## GLOBAL UI COMPONENTS

**StatusPill**: `<StatusPill status="On Trip" />` — renders colored dot + text, pulse animation for active states

**KPICard**: icon, value (large DM Mono font), label, optional trend (↑ +12% green / ↓ -3% red)

**DataTable**: sortable columns (click header), hover row highlight, empty state with icon + message, loading skeleton state

**Modal**: centered overlay, backdrop blur, smooth scale-in animation, close on Escape key

**Toast notifications**: Top-right corner, auto-dismiss after 3s. Show on:
- Trip created/dispatched/completed
- Vehicle added to maintenance ("Van-03 is now In Shop")
- License expiry warning
- Validation errors (cargo weight exceeded)

---

## SPECIAL INTERACTIONS (make it impressive)

1. **Cargo Weight Validator**: In the Create Trip modal, as the user types cargo weight, show a live progress bar filling up toward max capacity. Green → amber (>80%) → red (>100%) with shake animation on overflow.

2. **Live Clock**: TopBar shows real-time `HH:MM:SS` updating every second.

3. **Animated KPI numbers**: On dashboard load, numbers count up from 0 to their value using a spring animation (use `useState` + `useEffect` with `requestAnimationFrame`).

4. **Pulsing status dots**: "On Trip" and "Active" status pills have a CSS `@keyframes pulse` animation on their dot.

5. **Onboarding empty states**: If no vehicles/trips exist, show a helpful illustrated empty state with a CTA button.

6. **Confirmation dialogs**: Destructive actions (Retire vehicle, Cancel trip, Suspend driver) show a styled confirmation modal, not browser `confirm()`.

7. **Keyboard shortcut**: `Cmd/Ctrl + K` opens a command palette (simple modal with search input that filters vehicles + drivers + trips).

---

## IMPORTANT IMPLEMENTATION NOTES

- All state changes must be **atomic** — when completing a trip, vehicle AND driver status update together
- **Never show** retired vehicles or suspended drivers in any dropdown/selector
- **Never show** "In Shop" vehicles in the dispatcher dropdown
- License expiry check: compare `new Date(driver.licenseExpiry) < new Date()` — block assignment if true
- Use `crypto.randomUUID()` for all IDs
- Wrap all forms in proper validation (show inline error messages, not alerts)
- Make tables **sortable** by clicking column headers
- All monetary values formatted as `$1,234.56`
- All weights as `1,234 kg`
- Dates formatted as `Feb 21, 2025`
- **Mobile responsive** sidebar collapses to hamburger menu on < 768px

---

## TECH STACK COMMANDS

```bash
npx create-next-app@latest fleetflow --typescript --tailwind --app --src-dir --import-alias "@/*"
cd fleetflow
npx shadcn@latest init
npx shadcn@latest add button input label select dialog badge card table tabs
npm install zustand recharts lucide-react date-fns clsx tailwind-merge
```

---

## WINNING DETAILS — MAKE THESE PERFECT

1. The **dashboard** should feel like a real operations center — dense but scannable
2. The **trip creation flow** with live cargo validation is the core UX — make it delightful
3. The **driver cards** with safety score gauges should look premium
4. The **analytics page** should have at least 3 interactive Recharts charts
5. Use **consistent spacing** — 8px grid system throughout
6. Add a subtle **noise texture** to the dark background using a CSS background-image SVG filter
7. Every empty state should have an appropriate lucide icon and helpful message
8. The sidebar logo should have a small animated SVG truck or use the `Truck` lucide icon with a subtle animation

Build this complete. Do not skip any page. Make it production-quality. This is a hackathon demo — it needs to WOW judges in 30 seconds.
