import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  complaints, notifications, payments, attendance, students, hostels, rooms,
  currentStudent, stats, occupancyByHostel, complaintsByCategory, matches, DEPARTMENTS,
} from "@/lib/mock-data";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Management · BIT Hostel Portal" },
      { name: "description", content: "Raise hostel complaints for electricity, water, internet, furniture or cleaning and track resolution." },
      { property: "og:title", content: "Complaint Management · BIT Hostel Portal" },
      { property: "og:description", content: "Raise hostel complaints for electricity, water, internet, furniture or cleaning and track resolution." },
    ],
  }),
  component: Page,
});

function Page() {
  const mine = complaints.slice(0, 8);
  return (
    <AppShell title="Complaint management" breadcrumb={["Complaints"]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Complaint registered", { description: "You will be notified when staff is assigned." }); }}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft"
        >
          <h2 className="text-lg font-bold">Raise a complaint</h2>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {["Electricity", "Water", "Internet", "Furniture", "Cleaning", "Others"].map((c) => (
                <label key={c} className="cursor-pointer rounded-xl border px-2 py-2 text-center text-xs font-medium hover:border-primary/50">
                  <input type="radio" name="cat" className="sr-only" /> {c}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Title</Label><Input required placeholder="Tube light not working" /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea rows={4} required /></div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm">
            <span>Attach images</span><span className="text-xs font-semibold text-primary">Upload</span>
            <input type="file" multiple className="sr-only" />
          </label>
          <Button type="submit" variant="hero" className="w-full">Submit complaint</Button>
        </form>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold">My complaints</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((c) => (
              <li key={c.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <Badge variant="outline">{c.category}</Badge>
                  <Badge variant={c.priority === "High" ? "destructive" : "secondary"}>{c.priority}</Badge>
                  <Badge className="ml-auto" variant={c.status === "Resolved" ? "default" : "secondary"}>{c.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.id} · {c.hostel} · Room {c.room} · raised {c.createdAt} · {c.assignedTo}</p>
                <Progress value={c.status === "Resolved" ? 100 : c.status === "In Progress" ? 60 : 25} className="mt-3" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
