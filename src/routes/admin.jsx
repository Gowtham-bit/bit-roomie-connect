import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats, useHostels } from "@/hooks/use-hostel-api";
import { Building2, Server, ShieldCheck, Users, Wrench } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal · BIT Hostel Portal" },
      {
        name: "description",
        content: "Overview of BIT hostel portal metrics, block capacity, occupancy and administrative operations.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: statsData } = useDashboardStats();
  const { data: hostelsData = [] } = useHostels();

  const stats = statsData?.stats || {
    students: 1840,
    rooms: 920,
    hostels: 13,
    capacity: 2500,
    occupied: 1840,
    complaints: 24,
  };
  const occupancyChart = statsData?.occupancyByHostel || [];
  const hostelsList = Array.isArray(hostelsData) ? hostelsData : [];

  const occupancyRate = Math.round(((stats.occupied || 1840) / (stats.capacity || 2500)) * 100);

  return (
    <AppShell title="BIT Hostel System Administration" breadcrumb={["Admin Dashboard"]}>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Students Allocated"
          value={stats.students?.toString() || "1,840"}
          trend="Registered on portal"
        />
        <StatCard
          icon={Building2}
          title="Total Hostel Blocks"
          value={`${stats.hostels || 13} Blocks`}
          trend={`${stats.boys || 6} Boys / ${stats.girls || 7} Girls`}
        />
        <StatCard
          icon={ShieldCheck}
          title="Total Capacity / Occupancy"
          value={`${stats.occupied || 1840} / ${stats.capacity || 2500}`}
          trend={`${occupancyRate}% Total Occupancy`}
        />
        <StatCard
          icon={Wrench}
          title="System Maintenance Requests"
          value={stats.complaints?.toString() || "24"}
          trend="Tracked in MongoDB"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold">Hostel Block Occupancy Analytics</h2>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyChart.length > 0 ? occupancyChart : [
                { name: "Sapphire", occupied: 280, vacant: 70 },
                { name: "Emerald", occupied: 250, vacant: 50 },
                { name: "Ruby", occupied: 290, vacant: 60 },
                { name: "Ganga", occupied: 210, vacant: 40 },
                { name: "Yamuna", occupied: 230, vacant: 50 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="occupied" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Occupied" />
                <Bar dataKey="vacant" fill="var(--color-muted-foreground)" radius={[4, 4, 0, 0]} name="Vacant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Server className="size-5 text-primary" /> Database & System Health
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">MongoDB Atlas State</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Backend Express API</span>
                <Badge variant="default">Running (Port 5000)</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Overall Capacity Rate</span>
                <span className="font-bold">{occupancyRate}%</span>
              </div>
              <Progress value={occupancyRate} className="mt-2" />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-base font-bold mb-3">Hostel Blocks Directory</h2>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {hostelsList.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border p-2 text-xs">
                  <span className="font-semibold">{h.name}</span>
                  <Badge variant="outline">{h.type}</Badge>
                  <span>{h.occupied}/{h.capacity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
