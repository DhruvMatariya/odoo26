<div align="center">

# 🚛 FleetFlow  
### Modular Fleet & Logistics Management System

<!-- <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3ZydTF2MXA0cGRmdG5rZmxjaXJjM2J3Z2l3cG9hYTN2d2p4dHV3diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKTDn976rzVgky4/giphy.gif" width="120" /> -->

---

![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Node](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Built%20For-Hackathon-orange?style=for-the-badge)

---

### Replace manual logbooks with intelligence.
### Replace chaos with control.
### Replace guesswork with data.

</div>

---

## 🌍 Overview

FleetFlow is a centralized, rule-based digital system built to manage:

- 🚛 Vehicle lifecycle  
- 👨‍✈️ Driver compliance  
- ⛽ Fuel & maintenance costs  
- 📊 Operational analytics  
- 📦 Trip dispatch workflows  

Designed to eliminate inefficient manual tracking and provide real-time operational visibility.

---

## ✨ Core Features

### 🔐 Role-Based Authentication
- Fleet Manager  
- Dispatcher  
- Safety Officer  
- Financial Analyst  

Secure login with controlled access.

---

### 📊 Command Center Dashboard
- Active Fleet Monitoring
- Maintenance Alerts
- Fleet Utilization Rate
- Pending Cargo Tracking
- Region & Vehicle Type Filters

Real-time KPI visualization.

---

### 🚛 Vehicle Registry
- Asset CRUD operations
- Unique License Plate Enforcement
- Capacity Validation
- Retirement Toggle
- Odometer Tracking

---

### 🛣️ Trip Dispatcher
- Assign available vehicle + driver
- Capacity validation (Cargo ≤ Max Capacity)
- Lifecycle workflow:
  - Draft → Dispatched → Completed → Cancelled
- Automatic vehicle & driver state management

---

### 🛠️ Maintenance Automation
- Service log creation
- Auto-switch vehicle status to **In Shop**
- Removal from dispatch pool

---

### ⛽ Fuel & Expense Tracking
- Fuel log per vehicle
- Operational cost calculation
- Cost-per-km metrics
- Financial tracking per asset

---

### 👨‍✈️ Driver Performance & Compliance
- License expiry tracking
- Safety score tracking
- Trip completion rates
- Assignment blocking for expired licenses

---

### 📈 Analytics & Financial Reports
- Fuel Efficiency (km/L)
- Vehicle ROI
- Export to CSV/PDF
- Monthly cost reports

---

## 🧠 System Workflow

```mermaid
flowchart LR
    A[Add Vehicle] --> B[Assign Driver]
    B --> C[Create Trip]
    C --> D[Validate Cargo Capacity]
    D --> E[Dispatch Trip]
    E --> F[Complete Trip]
    F --> G[Update Odometer]
    G --> H[Log Fuel / Maintenance]
    H --> I[Analytics Engine Updates]
