import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BedDouble,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Heart,
  Home,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, StatCard } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { applicationTrend, attendance, currentStudent, notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Track your hostel status, allocated room, pending requests, attendance and fee dues in one student dashboard.",
      },
      { property: "og:title", content: "Student Dashboard · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Your hostel status, roommate matches, complaints and payments at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const shortcuts = [
  { to: "/apply", label: "Apply Hostel", icon: ClipboardList },
  { to: "/roommates", label: "Find Roommate", icon: Heart },
  { to: "/complaints", label: "Complaints", icon: Wrench },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/hostels", label: "Room Details", icon: BedDouble },
  { to: "/payments", label: "Payment", icon: CreditCard },
];

const statusPie = [
  { name: "Approved", value: 68, color: "var(--color-chart-2)" },
  { name: "In review", value: 22, color: "var(--color-chart-1)" },
  { name: "Pending docs", value: 10, color: "var(--color-chart-4)" },
];

const activity = [
  ["Room 312 allocated in Sapphire Block", "2 days ago", "success"],
  ["Roommate request sent to Karthik V.", "3 days ago", "primary"],
  ["Complaint C-042 marked In Progress", "5 days ago", "warning"],
  ["Term I hostel fee payment received", "1 week ago", "success"],
] as const;

function Dashboard() {
  const present = attendance.filter((a) => a.status === "Present").length;
  const pct = Math.round((present / attendance.length) * 100);

  return (
    <AppShell
      title={`Welcome back, ${currentStudent.name.split(" ")[0]}`}
      breadcrumb={["Dashboard"]}
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/room-change">Request room change</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/roommates">Find roommate</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Home} label="Hostel status" value="Allocated" trend="Confirmed" tone="accent" />
            <StatCard icon={BedDouble} label="Allocated room" value="Sapphire 312" tone="primary" />
            <StatCard icon={CalendarCheck} label="Attendance" value={`${pct}%`} tone="accent" />
            <StatCard icon={Wrench} label="Pending requests" value={3} tone="warning" />
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Application status trend</h2>
              <Badge variant="secondary">2026 intake</Badge>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationTrend}>
                  <defs>
                    <linearGradient id="apps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="appr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="var(--color-chart-1)"
                    fill="url(#apps)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="var(--color-chart-2)"
                    fill="url(#appr)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map((s, i) => (
              <motion.div
                key={s.to}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={s.to}
                  className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <img
                src={currentStudent.avatar}
                alt={currentStudent.name}
                className="size-16 rounded-2xl object-cover"
              />
              <div>
                <p className="font-display text-lg font-bold">{currentStudent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentStudent.dept} · Year {currentStudent.year}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {currentStudent.regNo}
                </Badge>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <Row label="Hostel" value={currentStudent.hostel ?? "—"} />
              <Row label="Room" value={currentStudent.room ?? "—"} />
              <Row label="Mess plan" value="Vegetarian" />
              <Row label="Fee status" value="Term I paid" />
            </div>
            <Button asChild variant="soft" className="mt-5 w-full">
              <Link to="/profile">View full profile</Link>
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold">Application status</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {statusPie.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Progress value={68} className="mt-1" />
            <p className="mt-2 text-xs text-muted-foreground">
              68% of this year&apos;s applications have been approved.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Upcoming notifications</h3>
              <Link to="/notifications" className="text-xs font-semibold text-primary">
                View all
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.category} · {n.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold">Recent activity</h3>
            <ol className="mt-4 space-y-4 border-l pl-4">
              {activity.map(([text, when]) => (
                <li key={text} className="relative">
                  <span className="absolute -left-[21px] top-1 flex size-3 items-center justify-center rounded-full bg-primary ring-4 ring-card" />
                  <p className="text-sm font-medium">{text}</p>
                  <p className="text-xs text-muted-foreground">{when}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-semibold">
        <CheckCircle2 className="size-3.5 text-accent" />
        {value}
      </span>
    </div>
  );
}
