# MiniCorp Chat - Web Dashboard

Admin Dashboard for MiniCorp Chat application.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI)
- **Backend**: Firebase (Auth, Firestore)
- **Charts**: Recharts
- **Tables**: TanStack React Table
- **Styling**: Tailwind CSS + MUI

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Dashboard pages (protected)
│   │   ├── login/             # Login page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts (Auth, etc.)
│   ├── lib/                   # Utilities (Firebase, etc.)
│   └── theme/                 # MUI theme configuration
├── shared/                    # Shared config (Firebase)
└── public/                    # Static files
```

## Features

- ✅ Authentication (Firebase Auth)
- ✅ Protected Routes (Admin only)
- ✅ Dashboard Layout with Sidebar
- ✅ User Management (Coming soon)
- ✅ Department Management (Coming soon)
- ✅ Analytics Dashboard (Coming soon)
- ✅ System Settings (Coming soon)

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

Build the app and deploy the `out` folder to any static hosting service.
