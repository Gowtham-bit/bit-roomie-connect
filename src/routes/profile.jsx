import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile · BIT Hostel Portal" },
      {
        name: "description",
        content: "Personal, academic, hostel and guardian information for your BIT hostel account.",
      },
      { property: "og:title", content: "Student Profile · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Personal, academic, hostel and guardian information for your BIT hostel account.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const currentStudent = user || {};

  const [isEditing, setIsEditing] = useState(false);
  const [mobile, setMobile] = useState("");
  const [hometown, setHometown] = useState("");
  const [language, setLanguage] = useState("");
  const [interests, setInterests] = useState("");

  const handleStartEdit = () => {
    setMobile(currentStudent.mobile || "9876543210");
    setHometown(currentStudent.hometown || "Coimbatore");
    setLanguage(currentStudent.language || "Tamil");
    setInterests(Array.isArray(currentStudent.interests) ? currentStudent.interests.join(", ") : "Coding, Cricket, Gaming");
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        mobile,
        hometown,
        language,
        interests: interests.split(",").map((i) => i.trim()).filter(Boolean),
      },
      {
        onSuccess: (res) => {
          if (res && res.error) {
            toast.error("Update Failed", { description: res.error });
          } else {
            toast.success("Profile Updated Successfully", {
              description: "Your changes have been saved to MongoDB Atlas.",
            });
            setIsEditing(false);
          }
        },
        onError: (err) => {
          toast.error("Profile Error", { description: err.message });
        },
      },
    );
  };

  return (
    <AppShell
      title="My profile"
      breadcrumb={["Profile"]}
      actions={
        <>
          <Button variant="outline" onClick={() => toast("Password reset link sent to registered email")}>
            Change password
          </Button>
          {!isEditing ? (
            <Button variant="hero" onClick={handleStartEdit}>
              Edit profile
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel editing
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl border bg-card p-6 text-center shadow-soft">
          <img
            src={currentStudent.avatar || "https://i.pravatar.cc/160?img=12"}
            alt={currentStudent.name || "Student"}
            className="mx-auto size-28 rounded-3xl object-cover"
          />
          <h2 className="font-display mt-4 text-xl font-bold">
            {currentStudent.name || "Student"}
          </h2>
          <p className="text-sm text-muted-foreground">{currentStudent.regNo || "—"}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge>{(currentStudent.dept || currentStudent.department || "CSE").replace(/CSa?E/gi, "CSE")}</Badge>
            <Badge variant="secondary">Year {currentStudent.year || 1}</Badge>
            <Badge variant="outline">{currentStudent.hostel || "Not Allocated"}</Badge>
          </div>
        </section>

        <div className="space-y-5">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
              <h3 className="text-lg font-bold">Edit Profile Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hometown</Label>
                  <Input
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Language</Label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hobbies / Interests (comma separated)</Label>
                  <Input
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button type="submit" variant="hero" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            [
              [
                "Personal information",
                [
                  ["Email", currentStudent.email || "—"],
                  ["Mobile", currentStudent.mobile || "9876543210"],
                  ["Gender", currentStudent.gender || "Male"],
                  ["Hometown", currentStudent.hometown || "Coimbatore"],
                ],
              ],
              [
                "Academic information",
                [
                  ["Department", (currentStudent.department || currentStudent.dept || "CSE").replace(/CSa?E/gi, "CSE")],
                  ["Year", `Year ${currentStudent.year || 1}`],
                  ["CGPA", currentStudent.cgpa || "8.50"],
                  ["Language", currentStudent.language || "Tamil"],
                ],
              ],
              [
                "Hostel information",
                [
                  ["Block", currentStudent.hostel ?? "Not Allocated"],
                  ["Room", currentStudent.room ?? "—"],
                  ["Mess plan", "Vegetarian"],
                  ["Fee status", "Term I Paid"],
                ],
              ],
              [
                "Guardian details",
                [
                  ["Name", "Subramanian R"],
                  ["Relation", "Father"],
                  ["Mobile", "9843112233"],
                  ["Occupation", "Agriculturist"],
                ],
              ],
            ].map(([title, rows]) => (
              <section key={title} className="rounded-2xl border bg-card p-6 shadow-soft">
                <h3 className="text-sm font-bold">{title}</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {rows.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="text-sm font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
