# Sunce ERP Frontend Refactor TODO
## Status: 🔄 In Progress (11/18 complete)

### 1. Setup & Config [ ]
- [ ] Update `next.config.ts` for `srcDir: true`
- [ ] Extract CSS to `src/app/globals.css`

### 2. Core Structure [ ]
- [ ] Create `src/types/index.ts` (all types/interfaces)
- [ ] Create `src/lib/constants.ts` (modules, permissions, mock data)
- [ ] Create `src/lib/access.ts` (utils: canAccess, getNavItems, getPasswordStrength)

### 3. UI Components [ ]
- [ ] `src/components/ui/Badge.tsx` + variants (StatusBadge, PriorityBadge, SlaBadge)
- [ ] `src/components/ui/Notification.tsx`
- [ ] `src/components/auth/AuthScreen.tsx` 
- [ ] `src/components/auth/SignupScreen.tsx`
- [ ] `src/components/auth/PasswordStrength.tsx`
- [ ] `src/components/layout/Sidebar.tsx`
- [ ] `src/components/layout/Topbar.tsx`
- [ ] `src/components/tickets/TicketsList.tsx`
- [ ] `src/components/tickets/TicketDetail.tsx`
- [ ] `src/components/tickets/TicketTimeline.tsx`
- [ ] `src/components/tickets/NewTicketModal.tsx`
- [ ] `src/components/dashboard/Dashboard.tsx`
- [ ] `src/components/modules/JobCards.tsx`
- [ ] `src/components/modules/Logistics.tsx`
- [ ] `src/components/modules/SLAMonitor.tsx`
- [ ] `src/components/modules/Reports.tsx`
- [ ] `src/components/modules/Settings.tsx`
- [ ] `src/components/modules/UserManagement.tsx` + `RoleBuilderModal.tsx`

### 4. Pages & Routing [x]
- [x] `src/app/page.tsx` (redirect)
- [x] `src/app/(auth)/page.tsx` (auth wrapper)
- [ ] `src/app/(dashboard)/page.tsx` (main shell + routing)
- [ ] Move `app/layout.tsx` → `src/app/layout.tsx`
- [ ] `src/app/page.tsx` (redirect)
- [ ] `src/app/(auth)/page.tsx` (auth wrapper)
- [ ] `src/app/(dashboard)/page.tsx` (main shell + routing)
- [ ] Move `app/layout.tsx` → `src/app/layout.tsx`

### 5. Verification [ ]
- [ ] `npm run dev` - no errors, app works identically
- [ ] Test all flows: auth/signup → dashboard → tickets → details → modals
- [ ] Clean old `app/` contents

**Next Action:** Update next.config.ts
