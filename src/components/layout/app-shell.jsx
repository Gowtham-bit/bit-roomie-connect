import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { 
  Bell,
  BedDouble,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Repeat,
  Search,
  Settings,
  Users,
  UserCircle,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications } from "@/lib/mock-data";
import { useCurrentUser } from "@/hooks/use-hostel-api";
import { isAuthenticated, logout, getCurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";
const studentNav = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/chat", label: "Warden & Admin Chat", icon: MessageSquare },
      { to: "/profile", label: "My Profile", icon: UserCircle },
    ],
  },
  {
    group: "Hostel",
    items: [
      { to: "/apply", label: "Hostel Application", icon: ClipboardList },
      { to: "/hostels", label: "Hostel Availability", icon: Building2 },
      { to: "/room-change", label: "Room Change", icon: Repeat },
    ],
  },
  {
    group: "Roommates",
    items: [
      { to: "/roommates", label: "Compatibility Match", icon: Heart },
      { to: "/requests", label: "Requests", icon: Users },
    ],
  },
  {
    group: "Services",
    items: [
      { to: "/complaints", label: "Complaints", icon: Wrench },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/payments", label: "Fee Payment", icon: CreditCard },
    ],
  },
];
const adminNav = [
  {
    group: "Overview",
    items: [{ to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Management",
    items: [
      { to: "/admin/students", label: "Student Management", icon: Users },
      { to: "/admin/hostels", label: "Hostel Management", icon: Building2 },
      { to: "/admin/allocation", label: "Room Allocation", icon: BedDouble },
      { to: "/admin/matching", label: "Roommate Matching", icon: Heart },
    ],
  },
  {
    group: "Operations",
    items: [
      { to: "/chat", label: "Portal Chat Desk", icon: MessageSquare },
      { to: "/admin/complaints", label: "Complaint Desk", icon: Wrench },
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
];
const wardenNav = [
  {
    group: "Warden",
    items: [
      { to: "/warden", label: "Warden Dashboard", icon: LayoutDashboard },
      { to: "/chat", label: "Hostel Chat Desk", icon: MessageSquare },
      { to: "/admin/complaints", label: "Complaints", icon: Wrench },
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/hostels", label: "Occupancy", icon: Building2 },
    ],
  },
];
export function AppShell({ role = "student", title, breadcrumb, actions, children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: user } = useCurrentUser();
  const currentUser = user || (typeof window !== "undefined" ? getCurrentUser() : null) || {};

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isAuthenticated()) {
        navigate({ to: "/login" });
        return;
      }
      setAuthChecked(true);

      const localUser = getCurrentUser();
      const isStudent = !localUser?.role || localUser?.role === "student";
      if (isStudent && localUser?.isProfileComplete === false && pathname !== "/profile") {
        toast.info("Please complete your profile details to get started.", {
          id: "complete-profile-guard",
        });
        navigate({ to: "/profile", search: { setup: "true" } });
      }
    }
  }, [navigate, pathname]);

  useEffect(() => {
    if (user && authChecked) {
      const isStudent = !user.role || user.role === "student";
      if (isStudent && user.isProfileComplete === false && pathname !== "/profile") {
        toast.info("Please complete your profile details to get started.", {
          id: "complete-profile-guard",
        });
        navigate({ to: "/profile", search: { setup: "true" } });
      }
    }
  }, [user, authChecked, pathname, navigate]);

  const handleSignOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  const activeRole = currentUser.role || (
    currentUser.regNo === "admin123"
      ? "admin"
      : currentUser.regNo === "warden123" || currentUser.regNo === "gwarden123"
        ? "warden"
        : role
  );

  const isGirlsWarden = currentUser.wardenType === "Girls" || currentUser.regNo === "gwarden123";
  const avatarUrl =
    currentUser.avatar && currentUser.avatar.trim() !== ""
      ? currentUser.avatar
      : "/default-avatar.svg";

  const displayName = currentUser.name || "User";
  const displaySubtext = currentUser.regNo || currentUser.email || "";

  const nav = activeRole === "admin" ? adminNav : activeRole === "warden" ? wardenNav : studentNav;
  const unread = notifications.filter((n) => !n.read).length;
  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <img
          src="/bit-logo.png"
          alt="BIT Logo"
          className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-soft"
        />
        <span className="font-display text-sm leading-tight font-extrabold">
          BIT Hostel
          <span className="block text-[11px] font-medium text-muted-foreground capitalize">
            {activeRole} portal
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {nav.map((section) => (
          <div key={section.group}>
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
              {section.group}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="gradient-primary absolute left-0 h-6 w-1 rounded-r-full"
                      />
                    )}
                    <item.icon className="size-4.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <img
            src={avatarUrl}
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.svg";
            }}
            alt=""
            className="size-9 rounded-full object-cover bg-muted"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{displaySubtext}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Bottom navigation items for quick mobile access based on role
  const mobileNavItems = activeRole === "admin" ? [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/allocation", label: "Allot", icon: BedDouble },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ] : activeRole === "warden" ? [
    { to: "/warden", label: "Dashboard", icon: LayoutDashboard },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/admin/complaints", label: "Complaints", icon: Wrench },
    { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ] : [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/roommates", label: "Match", icon: Heart },
    { to: "/apply", label: "Apply", icon: ClipboardList },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ];

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r bg-sidebar shadow-2xl lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                className="absolute top-4 right-2 size-8"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-30 border-b px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 lg:hidden shrink-0"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            {/* Mobile Branding Logo for small screens */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link to="/dashboard" className="flex items-center gap-1.5">
                <img src="/bit-logo.png" alt="BIT" className="h-7 w-auto object-contain rounded-md" />
                <span className="font-display text-xs font-bold sm:hidden">BIT Portal</span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students, rooms, complaints…"
                className="pl-9 h-9 text-xs sm:text-sm rounded-xl"
                aria-label="Global search"
              />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 sm:size-9 md:hidden"
                aria-label="Toggle search"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
              >
                <Search className="size-4" />
              </Button>

              <ThemeToggle />

              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative size-8 sm:size-9"
                aria-label="Notifications"
              >
                <Link to="/notifications">
                  <Bell className="size-4 sm:size-5" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 flex items-center gap-2 rounded-full border p-1 sm:pr-3 transition-colors hover:bg-muted"
                    aria-label="Account menu"
                  >
                    <img
                      src={avatarUrl}
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                      alt=""
                      className="size-7 rounded-full object-cover shrink-0 bg-muted"
                    />
                    <span className="hidden text-xs sm:text-sm font-medium sm:block max-w-[100px] truncate">
                      {displayName.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs font-normal text-muted-foreground truncate">
                      {currentUser.email || displaySubtext}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserCircle className="mr-2 size-4" /> My profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications">
                      <Settings className="mr-2 size-4" /> Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Expandable Mobile Search Bar */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-2.5 md:hidden"
              >
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students, rooms, complaints…"
                    className="pl-9 h-9 text-xs rounded-xl w-full"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 pb-24 lg:pb-10 max-w-full overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl"
          >
            <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="min-w-0">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground truncate"
                >
                  <Link to="/dashboard" className="hover:text-primary">
                    Home
                  </Link>
                  {(breadcrumb ?? [title]).map((b) => (
                    <span key={b} className="flex items-center gap-1.5 truncate">
                      <span>/</span>
                      <span className="text-foreground truncate">{b}</span>
                    </span>
                  ))}
                </nav>
                <h1 className="mt-1 text-xl font-extrabold sm:text-2xl md:text-3xl break-words">{title}</h1>
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">{actions}</div>}
            </div>
            {children}
          </motion.div>
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 inset-x-0 z-30 border-t bg-card/95 backdrop-blur-md px-2 py-1.5 shadow-lg lg:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && item.to !== "/admin" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[10px] font-semibold transition-all relative",
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-primary"
                  />
                )}
                <div className="relative">
                  <item.icon className={cn("size-5 transition-transform", active && "scale-110")} />
                  {item.label === "Chat" && unread > 0 && (
                    <span className="absolute -top-1 -right-1.5 size-2 rounded-full bg-destructive" />
                  )}
                </div>
                <span className="mt-0.5 leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
export function StatCard({ icon: Icon, label, value, trend, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
    >
      <div className="flex items-start justify-between">
        <span className={cn("flex size-11 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
        {trend && (
          <Badge variant="secondary" className="rounded-full text-[11px]">
            {trend}
          </Badge>
        )}
      </div>
      <p className="font-display mt-4 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
