import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useComplaints, useUpdateComplaintStatus } from "@/hooks/use-hostel-api";
import { Wrench, CheckCircle2, Clock, Filter, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Desk · BIT Admin Portal" },
      {
        name: "description",
        content: "Track, assign and resolve maintenance complaints across all 13 BIT hostel blocks.",
      },
    ],
  }),
  component: ComplaintsDeskPage,
});

function ComplaintsDeskPage() {
  const { data: complaintsData = [] } = useComplaints();
  const updateStatusMutation = useUpdateComplaintStatus();
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const complaintsList = Array.isArray(complaintsData) ? complaintsData : [];

  const filtered = complaintsList.filter((c) => {
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    const matchStat = filterStatus === "All" || c.status === filterStatus;
    return matchCat && matchStat;
  });

  const handleStatusUpdate = (complaintObj, newStatus) => {
    const targetId = complaintObj._id || complaintObj.id;
    updateStatusMutation.mutate(
      { id: targetId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Complaint #${complaintObj.id || "C001"} Updated`, {
            description: `Status successfully updated to ${newStatus} in MongoDB.`,
          });
        },
        onError: (err) => {
          toast.error("Failed to update status", { description: err.message });
        },
      }
    );
  };

  return (
    <AppShell title="Hostel Complaint & Maintenance Desk" breadcrumb={["Admin", "Complaints"]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 rounded-2xl border bg-card p-3.5 sm:p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold w-full sm:w-auto">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <span>Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs flex-1 sm:flex-initial"
          >
            <option value="All">All Categories</option>
            <option value="Electricity">Electricity</option>
            <option value="Water">Water</option>
            <option value="Internet">Internet / Wi-Fi</option>
            <option value="Furniture">Furniture</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          <span>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs flex-1 sm:flex-initial"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-soft"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm">{c.title}</span>
                <Badge variant="outline">{c.category}</Badge>
                <Badge
                  variant={
                    c.priority === "High"
                      ? "destructive"
                      : c.priority === "Medium"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {c.priority} Priority
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Reported by {c.student} ({c.regNo}) · Block: {c.hostel} #{c.room} · Date: {c.createdAt}
              </p>
              <p className="text-xs font-medium text-primary">Assigned to: {c.assignedTo || "Maintenance Team"}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0">
              <Badge
                variant={
                  c.status === "Resolved"
                    ? "default"
                    : c.status === "In Progress"
                      ? "secondary"
                      : "outline"
                }
              >
                {c.status}
              </Badge>
              {c.status !== "Resolved" && (
                <>
                  <Button
                    size="sm"
                    variant="soft"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleStatusUpdate(c, "In Progress")}
                    className="flex-1 sm:flex-initial"
                  >
                    <Clock className="mr-1 size-3.5" /> In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="hero"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleStatusUpdate(c, "Resolved")}
                    className="flex-1 sm:flex-initial"
                  >
                    <CheckCircle2 className="mr-1 size-3.5" /> Resolve
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
