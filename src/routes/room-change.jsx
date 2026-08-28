import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { hostels, rooms, currentStudent, } from "@/lib/mock-data";
export const Route = createFileRoute("/room-change")({
    head: () => ({
        meta: [
            { title: "Room Change Request · BIT Hostel Portal" },
            { name: "description", content: "Raise a hostel room change request with a reason, preferred room and supporting proof." },
            { property: "og:title", content: "Room Change Request · BIT Hostel Portal" },
            { property: "og:description", content: "Raise a hostel room change request with a reason, preferred room and supporting proof." },
        ],
    }),
    component: Page,
});
function Page() {
    return (<AppShell title="Room change request" breadcrumb={["Room change"]}>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Room change request submitted"); }} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Current hostel</Label><Input defaultValue={currentStudent.hostel ?? ""} readOnly/></div>
            <div className="space-y-2"><Label>Current room</Label><Input defaultValue={currentStudent.room ?? ""} readOnly/></div>
            <div className="space-y-2">
              <Label>Preferred hostel</Label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                {hostels.map((h) => <option key={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Preferred room</Label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                {rooms.slice(0, 12).map((r) => <option key={r.id}>{r.hostelName} · {r.number}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2"><Label>Reason for change</Label><Textarea rows={4} required placeholder="Explain why you need a different room"/></div>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm">
            <span>Upload supporting proof</span><span className="text-xs font-semibold text-primary">Choose file</span>
            <input type="file" className="sr-only"/>
          </label>
          <Button type="submit" variant="hero">Submit request</Button>
        </form>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-sm font-bold">Request status</h2>
          <ol className="mt-5 space-y-6 border-l pl-5">
            {[["Submitted", "31 Jul 2026", true], ["Warden review", "In progress", true], ["Admin approval", "Pending", false], ["Room allotted", "Pending", false]].map(([s, d, active]) => (<li key={s} className="relative">
                <span className={`absolute -left-[26px] top-1 size-3 rounded-full ring-4 ring-card ${active ? "bg-primary" : "bg-muted-foreground/40"}`}/>
                <p className="text-sm font-semibold">{s}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </li>))}
          </ol>
        </section>
      </div>
    </AppShell>);
}
