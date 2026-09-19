import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCurrentUser, useHostels, useSubmitApplication } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Hostel Application · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Submit your BIT hostel application with personal, parent and medical details.",
      },
      { property: "og:title", content: "Hostel Application · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Submit your BIT hostel application with personal, parent and medical details.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: currentUser } = useCurrentUser();
  const { data: hostelsData = [] } = useHostels();
  const submitMutation = useSubmitApplication();
  const navigate = useNavigate();

  const student = currentUser || {};
  const isFemale = student.gender?.toLowerCase() === "female";
  const requiredType = isFemale ? "Girls" : "Boys";

  const rawHostels = Array.isArray(hostelsData) ? hostelsData : [];
  // Filter hostels based on student gender
  const hostelsList = rawHostels.filter((h) => h.type === requiredType);

  const [selectedHostel, setSelectedHostel] = useState("");
  const [roomType, setRoomType] = useState("Non-AC");
  const [sharing, setSharing] = useState("2");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const hostelObj = hostelsList.find((h) => h.id === selectedHostel || h.name === selectedHostel) || hostelsList[0];
    const hostelId = hostelObj ? hostelObj.id : (isFemale ? "H07" : "H01");
    const hostelName = hostelObj ? hostelObj.name : (isFemale ? "Ganga Block" : "Sapphire Block");

    submitMutation.mutate(
      {
        regNo: student.regNo || "7376242AD142",
        studentName: student.name || "Student",
        hostelId,
        hostelName,
        roomType,
        sharing: Number(sharing),
        notes,
      },
      {
        onSuccess: (res) => {
          if (res && res.error) {
            toast.error("Application Failed", { description: res.error });
          } else {
            toast.success("Application Submitted Successfully", {
              description: "Your hostel application has been saved to MongoDB.",
            });
            navigate({ to: "/dashboard" });
          }
        },
        onError: (err) => {
          toast.error("Submission Error", { description: err.message });
        },
      },
    );
  };

  return (
    <AppShell title="Hostel application" breadcrumb={["Apply"]}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold">Student information ({requiredType} Hostel Application)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input defaultValue={student.name || ""} required />
            </div>
            <div className="space-y-2">
              <Label>Register number</Label>
              <Input defaultValue={student.regNo || ""} required readOnly />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input defaultValue={(student.department || student.dept || "CSE").replace(/CSa?E/gi, "CSE")} required />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input defaultValue={String(student.year || 1)} required />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input defaultValue={student.gender || "Male"} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Mobile number</Label>
              <Input defaultValue={student.mobile || "9876543210"} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Permanent address</Label>
              <Textarea
                rows={3}
                placeholder="Door no, street, city, district, pincode"
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold">Parent & medical details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Parent / guardian name</Label>
              <Input required defaultValue="R. Subramanian" />
            </div>
            <div className="space-y-2">
              <Label>Parent mobile number</Label>
              <Input inputMode="numeric" required defaultValue="9843112233" />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input defaultValue="Agriculturist" />
            </div>
            <div className="space-y-2">
              <Label>Blood group</Label>
              <Input placeholder="O+" defaultValue="O+" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Medical conditions or allergies</Label>
              <Textarea
                rows={2}
                placeholder="Mention any condition the warden should know about"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold">Preferences</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Hostel preference ({requiredType} Hostels Only)</Label>
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Select {requiredType} Hostel Block</option>
                {hostelsList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.type} Hostel)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Room type & sharing</Label>
              <select
                value={`${roomType}-${sharing}`}
                onChange={(e) => {
                  const [t, s] = e.target.value.split("-");
                  setRoomType(t);
                  setSharing(s);
                }}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="AC-2">AC · 2 sharing</option>
                <option value="AC-3">AC · 3 sharing</option>
                <option value="Non-AC-4">Non-AC · 4 sharing</option>
                <option value="Non-AC-2">Non-AC · 2 sharing</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Additional Notes / Special Requirements</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., prefer ground floor room, study quiet zone"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-sm font-bold">Application submission</h2>
          <Progress value={90} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">Ready for submission to MongoDB Atlas.</p>
          <div className="mt-4 flex gap-3">
            <Button type="submit" variant="hero" disabled={submitMutation.isPending} className="flex-1">
              {submitMutation.isPending ? "Submitting..." : "Submit application"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast("Draft saved")}
            >
              Save draft
            </Button>
          </div>
        </section>
      </form>
    </AppShell>
  );
}
