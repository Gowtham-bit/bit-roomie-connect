import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useCurrentUser,
  useApplications,
  useRoomChangeRequests,
  useComplaints,
  useUpdateApplicationStatus,
  useUpdateRoomChangeStatus,
  useMarkAttendance,
  useDashboardStats,
} from "@/hooks/use-hostel-api";
import { Building2, ClipboardList, Shield, UserCheck, Wrench } from "lucide-react";

export const Route = createFileRoute("/warden")({
  head: () => ({
    meta: [
      { title: "Warden Dashboard · BIT Hostel Portal" },
      {
        name: "description",
        content: "Manage student applications, room change approvals, complaints and attendance as Warden.",
      },
    ],
  }),
  component: WardenDashboard,
});

function WardenDashboard() {
  const { data: user } = useCurrentUser();
  const wardenUser = user || {};

  const isGirlsWarden = wardenUser.wardenType === "Girls" || wardenUser.regNo === "gwarden123";
  const wardenType = isGirlsWarden ? "Girls" : "Boys";
  const wardenTitle = `${wardenType} Hostel Warden`;

  const { data: statsData } = useDashboardStats();
  const { data: applicationsData = [] } = useApplications();
  const { data: roomChangesData = [] } = useRoomChangeRequests();
  const { data: complaintsData = [] } = useComplaints();

  const updateAppMutation = useUpdateApplicationStatus();
  const updateRcMutation = useUpdateRoomChangeStatus();
  const markAttMutation = useMarkAttendance();

  const [attRegNo, setAttRegNo] = useState("");
  const [attName, setAttName] = useState("");
  const [attStatus, setAttStatus] = useState("Present");

  const rawApps = Array.isArray(applicationsData) ? applicationsData : [];
  const rawRoomChanges = Array.isArray(roomChangesData) ? roomChangesData : [];
  const rawComplaints = Array.isArray(complaintsData) ? complaintsData : [];

  const girlsBlocks = ["Ganga", "Yamuna", "Narmadha", "Cauvery", "Bhavani"];

  const isGirlHostel = (name) => girlsBlocks.some((b) => (name || "").includes(b));

  // Filter based on Warden gender assignment
  const apps = rawApps.filter((a) => (isGirlsWarden ? isGirlHostel(a.hostelName) : !isGirlHostel(a.hostelName)));
  const roomChanges = rawRoomChanges.filter((r) => (isGirlsWarden ? isGirlHostel(r.targetHostel || r.currentHostel) : !isGirlHostel(r.targetHostel || r.currentHostel)));
  const complaints = rawComplaints.filter((c) => (isGirlsWarden ? isGirlHostel(c.hostel) : !isGirlHostel(c.hostel)));

  const handleAppStatus = (id, status) => {
    updateAppMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`Application ${status}`, {
            description: `Application #${id} updated by ${wardenTitle}.`,
          });
        },
      },
    );
  };

  const handleRcStatus = (id, status) => {
    updateRcMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`Room Change ${status}`, {
            description: `Room change request #${id} updated by ${wardenTitle}.`,
          });
        },
      },
    );
  };

  const handleMarkAttendance = (e) => {
    e.preventDefault();
    if (!attRegNo) {
      toast.error("Please enter student register number");
      return;
    }

    markAttMutation.mutate(
      {
        regNo: attRegNo,
        studentName: attName || "Student",
        status: attStatus,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        onSuccess: () => {
          toast.success("Attendance Logged", {
            description: `Attendance record saved for ${attRegNo} by ${wardenTitle}.`,
          });
          setAttRegNo("");
          setAttName("");
        },
      },
    );
  };

  return (
    <AppShell
      title={`Warden Portal · ${wardenTitle}`}
      breadcrumb={["Warden Dashboard"]}
      actions={
        <Badge variant="hero" className="px-3 py-1.5 text-xs">
          {wardenTitle} Account
        </Badge>
      }
    >
      <div className="mb-6 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Shield}
          title="Jurisdiction"
          value={`${wardenType} Hostels`}
          trend={`${isGirlsWarden ? '7 Girls' : '6 Boys'} Blocks`}
        />
        <StatCard
          icon={ClipboardList}
          title="Applications"
          value={apps.filter((a) => a.status === "Pending").length.toString()}
          trend="Awaiting review"
        />
        <StatCard
          icon={Building2}
          title="Room Changes"
          value={roomChanges.filter((r) => r.status === "Pending").length.toString()}
          trend="In queue"
        />
        <StatCard
          icon={Wrench}
          title="Open Complaints"
          value={complaints.filter((c) => c.status !== "Resolved").length.toString()}
          trend="Maintenance needed"
        />
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {/* Hostel Applications Review */}
        <section className="rounded-2xl border bg-card p-4 sm:p-6 shadow-soft">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <ClipboardList className="size-5 text-primary shrink-0" /> {wardenType} Hostel Applications
          </h2>
          <div className="mt-4 space-y-3">
            {apps.length > 0 ? (
              apps.map((a) => (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 sm:p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{a.studentName} ({a.regNo})</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Block: {a.hostelName} · Room: {a.roomType} ({a.sharing} sharing)
                    </p>
                    <p className="text-[11px] text-muted-foreground">Date: {a.appliedDate}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 shrink-0">
                    <Badge variant={a.status === "Approved" || a.status === "Room Allotted" ? "default" : a.status.includes("Rejected") ? "destructive" : "secondary"} className="text-xs">
                      {a.status === "Approved by Warden" ? "Warden Approved" : a.status}
                    </Badge>
                    {(a.status === "Pending" || a.status === "Pending Warden Review") && (
                      <>
                        <Button size="sm" variant="success" className="h-8 text-xs" onClick={() => handleAppStatus(a.id, "Approved by Warden")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAppStatus(a.id, "Rejected by Warden")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending {wardenType.toLowerCase()} hostel applications.</p>
            )}
          </div>
        </section>

        {/* Room Change Approvals */}
        <section className="rounded-2xl border bg-card p-4 sm:p-6 shadow-soft">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Building2 className="size-5 text-primary shrink-0" /> {wardenType} Room Change Requests
          </h2>
          <div className="mt-4 space-y-3">
            {roomChanges.length > 0 ? (
              roomChanges.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 sm:p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{r.studentName} ({r.regNo})</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Current: {r.currentHostel} #{r.currentRoom} ➔ Target: {r.targetHostel}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">Reason: {r.reason}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 shrink-0">
                    <Badge variant={r.status === "Approved" || r.status === "Room Allotted" ? "default" : r.status.includes("Rejected") ? "destructive" : "secondary"} className="text-xs">
                      {r.status === "Approved by Warden" ? "Warden Approved" : r.status}
                    </Badge>
                    {(r.status === "Pending" || r.status === "Pending Warden Review") && (
                      <>
                        <Button size="sm" variant="success" className="h-8 text-xs" onClick={() => handleRcStatus(r.id, "Approved by Warden")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleRcStatus(r.id, "Rejected by Warden")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending {wardenType.toLowerCase()} room change requests.</p>
            )}
          </div>
        </section>

        {/* Mark Daily Attendance Form */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="size-5 text-primary" /> Log Attendance ({wardenType} Students)
          </h2>
          <form onSubmit={handleMarkAttendance} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Student Register Number</Label>
                <Input
                  required
                  value={attRegNo}
                  onChange={(e) => setAttRegNo(e.target.value)}
                  placeholder="E.g. 7376242AD142"
                />
              </div>
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input
                  value={attName}
                  onChange={(e) => setAttName(e.target.value)}
                  placeholder="Student name"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Attendance Status</Label>
                <select
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">On Leave</option>
                </select>
              </div>
            </div>
            <Button type="submit" variant="hero" disabled={markAttMutation.isPending}>
              {markAttMutation.isPending ? "Recording..." : "Save Attendance Record"}
            </Button>
          </form>
        </section>

        {/* Complaints Overview */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wrench className="size-5 text-primary" /> {wardenType} Maintenance Complaints
          </h2>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {complaints.length > 0 ? (
              complaints.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.student} · Room {c.room} ({c.hostel})</p>
                  </div>
                  <Badge variant={c.status === "Resolved" ? "default" : "secondary"}>{c.status}</Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No maintenance complaints in {wardenType.toLowerCase()} hostels.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
