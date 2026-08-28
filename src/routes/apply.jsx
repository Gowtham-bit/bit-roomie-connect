import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { hostels, currentStudent, } from "@/lib/mock-data";
export const Route = createFileRoute("/apply")({
    head: () => ({
        meta: [
            { title: "Hostel Application · BIT Hostel Portal" },
            { name: "description", content: "Submit your BIT hostel application with personal, parent, medical and document details." },
            { property: "og:title", content: "Hostel Application · BIT Hostel Portal" },
            { property: "og:description", content: "Submit your BIT hostel application with personal, parent, medical and document details." },
        ],
    }),
    component: Page,
});
function Page() {
    return (<AppShell title="Hostel application" breadcrumb={["Apply"]}>
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Application submitted", { description: "Track the status from your dashboard." }); }} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Student information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[["Full name", currentStudent.name], ["Register number", currentStudent.regNo], ["Department", currentStudent.department], ["Year", String(currentStudent.year)], ["Gender", currentStudent.gender], ["Mobile number", currentStudent.mobile]].map(([l, v]) => (<div key={l} className="space-y-2">
                  <Label>{l}</Label>
                  <Input defaultValue={v} required/>
                </div>))}
              <div className="space-y-2 sm:col-span-2">
                <Label>Permanent address</Label>
                <Textarea rows={3} placeholder="Door no, street, city, district, pincode" required/>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Parent & medical details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Parent / guardian name</Label><Input required/></div>
              <div className="space-y-2"><Label>Parent mobile number</Label><Input inputMode="numeric" required/></div>
              <div className="space-y-2"><Label>Occupation</Label><Input /></div>
              <div className="space-y-2"><Label>Blood group</Label><Input placeholder="O+"/></div>
              <div className="space-y-2 sm:col-span-2"><Label>Medical conditions or allergies</Label><Textarea rows={2} placeholder="Mention any condition the warden should know about"/></div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Preferences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hostel preference</Label>
                <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                  {hostels.map((h) => <option key={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Room preference</Label>
                <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                  <option>AC · 2 sharing</option><option>AC · 3 sharing</option><option>Non-AC · 4 sharing</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Required facilities</Label>
                <div className="flex flex-wrap gap-2">
                  {["Wi-Fi", "Study table", "Attached bathroom", "Hot water", "Power backup", "Ground floor"].map((f) => (<label key={f} className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:border-primary/40">
                      <input type="checkbox" className="accent-[var(--color-primary)]"/> {f}
                    </label>))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Documents</h2>
            <div className="mt-4 space-y-3">
              {["Aadhaar card", "Community certificate", "Income certificate", "Passport size photo"].map((d) => (<label key={d} className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm hover:border-primary/50">
                  <span>{d}</span>
                  <span className="text-xs font-semibold text-primary">Upload</span>
                  <input type="file" className="sr-only"/>
                </label>))}
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-bold">Application progress</h2>
            <Progress value={60} className="mt-3"/>
            <p className="mt-2 text-xs text-muted-foreground">3 of 5 sections completed.</p>
            <Button type="submit" variant="hero" className="mt-4 w-full">Submit application</Button>
            <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => toast("Draft saved")}>Save draft</Button>
          </section>
        </div>
      </form>
    </AppShell>);
}
