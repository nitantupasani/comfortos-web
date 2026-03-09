# ComfortOS Web — Smart Building Platform

A React + TypeScript web application for the ComfortOS Smart Building Platform.  
Connects to the **same backend** as the Flutter mobile app — both applications always show the same data.

## Role-Based Experiences

| Role | Experience | Layout |
|------|-----------|--------|
| **Occupant** | Mobile-like flow: Presence → Location → Dashboard → Vote → Comfort → History → Settings | Bottom navigation (mobile-style) |
| **Admin** | Platform overview: Dashboard → Building Management → Tenant Management → Vote Analytics → Config Editor | Sidebar navigation (desktop) |
| **Facility Manager** | Building-focused: Dashboard → Buildings → Comfort Analytics → Notifications | Sidebar navigation (desktop) |

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router v6** — Client-side routing with role-based guards
- **Zustand** — Lightweight state management
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Charts for analytics dashboards
- **Lucide React** — Icon library

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (proxies /api to backend at localhost:8000)
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | nitantupasani@gmail.com | admin123 |
| Occupant | occupant@comfortos.com | occupant123 |
| Facility Manager | fm@comfortos.com | fm123 |

## Project Structure

```
web/
├── src/
│   ├── api/              # API client & endpoint modules
│   ├── components/
│   │   ├── common/       # LoadingSpinner, ProtectedRoute
│   │   ├── layout/       # OccupantLayout, AdminLayout, FMLayout
│   │   └── sdui/         # SDUI renderer & vote form renderer
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── occupant/     # Presence, Location, Dashboard, Vote, Comfort, History, Settings
│   │   ├── admin/        # AdminDashboard, BuildingManagement, TenantManagement, VoteAnalytics, ConfigEditor
│   │   └── fm/           # FMDashboard, BuildingOverview, ComfortAnalytics, Notifications
│   ├── router/           # React Router with role-based guards
│   ├── store/            # Zustand stores (auth, presence, vote, building)
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Weather helper (Open-Meteo)
```

## Backend Connection

The web app connects to the same FastAPI backend as the Flutter mobile app.  
In development, Vite proxies API calls (`/api/*`) to `http://localhost:8000`.  
In production, configure `VITE_API_BASE_URL` to point to your deployed backend.

Both applications share the same:
- Authentication (JWT tokens)
- Building & tenant data
- Vote submissions & history
- SDUI dashboard & vote form configurations
- Comfort score computations
