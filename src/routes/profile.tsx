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

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile · BIT Hostel Portal" },
      { name: "description", content: "Personal, academic, hostel and guardian information for your BIT hostel account." },
      { property: "og:title", content: "Student Profile · BIT Hostel Portal" },
      { property: "og:description", content: "Personal, academic, hostel and guardian information for your BIT hostel account." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell
      title="My profile"
      breadcrumb={["Profile"]}
      actions={<><Button variant="outline" onClick={() => toast("Password reset link sent")}>Change password</Button><Button variant="hero" onClick={() => toast.success("Profile updated")}>Edit profile</Button></>}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl border bg-card p-6 text-center shadow-soft">
          <img src={currentStudent.avatar} alt={currentStudent.name} className="mx-auto size-28 rounded-3xl object-cover" />
          <h2 className="font-display mt-4 text-xl font-bold">{currentStudent.name}</h2>
          <p className="text-sm text-muted-foreground">{currentStudent.regNo}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge>{currentStudent.dept}</Badge>
            <Badge variant="secondary">Year {currentStudent.year}</Badge>
            <Badge variant="outline">{currentStudent.hostel}</Badge>
          </div>
        </section>
        <div className="space-y-5">
          {[["Personal information", [["Email", currentStudent.email], ["Mobile", currentStudent.mobile], ["Gender", currentStudent.gender], ["Hometown", currentStudent.hometown]]],
            ["Academic information", [["Department", currentStudent.department], ["Year", `Year ${currentStudent.year}`], ["CGPA", currentStudent.cgpa], ["Language", currentStudent.language]]],
            ["Hostel information", [["Block", currentStudent.hostel ?? "—"], ["Room", currentStudent.room ?? "—"], ["Mess plan", "Vegetarian"], ["Fee status", "Term I paid"]]],
            ["Guardian details", [["Name", "Subramanian R"], ["Relation", "Father"], ["Mobile", "9843112233"], ["Occupation", "Agriculturist"]]]].map(([title, rows]) => (
            <section key={title as string} className="rounded-2xl border bg-card p-6 shadow-soft">
              <h3 className="text-sm font-bold">{title as string}</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {(rows as Array<[string, string]>).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
