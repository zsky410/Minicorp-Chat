# Web Dashboard Setup Guide

## Đã hoàn thành

✅ Next.js project đã được setup
✅ Firebase integration
✅ Authentication với Firebase Auth
✅ Protected routes (chỉ Admin)
✅ Dashboard layout với sidebar
✅ Basic pages structure

## Cấu trúc Project

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Dashboard pages (protected)
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── users/         # User management
│   │   │   ├── departments/   # Department management
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── settings/      # System settings
│   │   │   └── layout.tsx     # Protected layout
│   │   ├── login/             # Login page
│   │   ├── unauthorized/      # Unauthorized page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   └── DashboardLayout.tsx
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                   # Utilities
│   │   └── firebase.ts
│   └── theme/                 # MUI theme
│       └── theme.ts
└── shared/                    # Shared config (outside web/)
    └── firebase.config.js
```

## Chạy Development Server

```bash
cd web
npm run dev
```

Mở http://localhost:3000

## Đăng nhập

- Chỉ Admin mới có thể đăng nhập
- Email: admin@minicorp.com (hoặc user có role = "admin")
- Password: mật khẩu của user đó

## Next Steps

Theo `day8_web_dashboard.md` để implement các features:
1. User Management Page (Task 8.3)
2. Department Management Page (Task 8.4)
3. Analytics Dashboard (Task 8.5)
4. System Settings (Task 8.6)

## Notes

- Firebase config hiện đang hardcode trong `src/lib/firebase.ts`
- Có thể move sang environment variables sau
- Shared folder có thể dùng để share utilities giữa mobile và web

