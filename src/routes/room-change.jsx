import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, Users, BedDouble } from "lucide-react";
import { toast } from "sonner";
import {
  useCurrentUser,
  useHostels,
  useSubmitRoomChange,
  useRoomChangeRequests,
  useRoommateMatches,
} from "@/hooks/use-hostel-api";
import { CompatibilityModal } from "@/components/compatibility-modal";

export const Route = createFileRoute("/room-change")({
  head: () => ({
    meta: [
      { title: "Room Change Request · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Raise a hostel room change request with personal, parent, medical and target room preferences.",
      },
      { property: "og:title", content: "Room Change Request · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Raise a hostel room change request with personal, parent, medical and target room preferences.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: currentUser } = useCurrentUser();
  const { data: hostelsData = [] } = useHostels();
  const submitRoomChangeMutation = useSubmitRoomChange();
  const navigate = useNavigate();

  const student = currentUser || {};
  const isFemale =
    student.wardenType === "Girls" ||
    student.regNo === "gwarden123" ||
    student.gender?.toLowerCase() === "female";
  const requiredType = isFemale ? "Girls" : "Boys";

  const rawHostels = Array.isArray(hostelsData) ? hostelsData : [];
  const hostelsList = rawHostels.filter((h) => h.type === requiredType);

  const { data: userRequests = [] } = useRoomChangeRequests({ regNo: student.regNo });
  const { data: roommateMatches = [] } = useRoommateMatches({ regNo: student.regNo || "7376242AD142" });
  const myRequests = Array.isArray(userRequests) ? userRequests : [];
  const latestRequest = myRequests[0];

  const [targetHostel, setTargetHostel] = useState("");
  const [roomType, setRoomType] = useState("Non-AC");
  const [sharing, setSharing] = useState("2");
  const [reason, setReason] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please specify a reason for the room change request");
      return;
    }

    const defaultTarget = targetHostel || (hostelsList[0] ? hostelsList[0].name : (isFemale ? "Ganga Block" : "Emerald Block"));

    submitRoomChangeMutation.mutate(
      {
        regNo: student.regNo || "7376242AD142",
        studentName: student.name || "Student",
        currentHostel: student.hostel || "Sapphire Block",
        currentRoom: student.room || "312",
        targetHostel: defaultTarget,
        roomType,
        sharing: Number(sharing),
        reason,
        parentName: student.guardian?.name || "R. Subramanian",
        parentMobile: student.guardian?.mobile || "9843112233",
      },
      {
        onSuccess: (res) => {
          if (res && res.error) {
            toast.error("Room Change Error", { description: res.error });
          } else {
            toast.success("Room Change Request Submitted Successfully", {
              description: "Your room change request has been submitted for Warden review and Admin room allotment.",
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
    <AppShell title="Room Change Request" breadcrumb={["Room Change"]}>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Student Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Student Information ({requiredType} Hostel Room Change)</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={student.name || "Student"} required />
              </div>
              <div className="space-y-2">
                <Label>Register Number</Label>
                <Input defaultValue={student.regNo || ""} required readOnly />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input defaultValue={(student.department || student.dept || "CSE").replace(/CSa?E/gi, "CSE")} required />
              </div>
              <div className="space-y-2">
                <Label>Year of Study</Label>
                <Input defaultValue={`Year ${student.year || 1}`} required />
              </div>
              <div className="space-y-2">
                <Label>Current Hostel Block</Label>
                <Input defaultValue={student.hostel ?? (isFemale ? "Ganga Block" : "Sapphire Block")} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Current Room Number</Label>
                <Input defaultValue={student.room ?? "312"} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input defaultValue={student.gender || "Male"} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input defaultValue={student.mobile || "9876543210"} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Permanent Address</Label>
                <Textarea
                  rows={3}
                  placeholder="Door no, street, city, district, pincode"
                  defaultValue={`${student.hometown || "Coimbatore"}, Tamil Nadu`}
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 2: Parent & Medical Details */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Parent & Medical Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Parent / Guardian Name</Label>
                <Input required defaultValue={student.guardian?.name || "R. Subramanian"} />
              </div>
              <div className="space-y-2">
                <Label>Parent Mobile Number</Label>
                <Input inputMode="numeric" required defaultValue={student.guardian?.mobile || "9843112233"} />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input defaultValue={student.guardian?.occupation || "Agriculturist"} />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Input placeholder="O+" defaultValue="O+" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Medical Conditions / Specific Reasons for Room Change</Label>
                <Textarea
                  rows={2}
                  placeholder="Mention medical condition, allergy or compatibility issue for room transfer"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Roommate Compatibility Profile */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" /> Roommate Compatibility Profile
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your lifestyle answers are saved and matched with prospective room partners in target hostel blocks.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: "/roommates" })}>
                Retake Questionnaire
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border bg-muted/40 p-3">
                <span className="text-muted-foreground">Sleep Schedule</span>
                <p className="font-bold text-sm mt-0.5">{student.traits?.sleep || "10 PM – 12 AM"}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <span className="text-muted-foreground">Cleanliness Standard</span>
                <p className="font-bold text-sm mt-0.5">{String(student.traits?.cleanliness || "Very Clean")}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <span className="text-muted-foreground">Food Preference</span>
                <p className="font-bold text-sm mt-0.5">{student.traits?.food || "Non-Veg"}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <span className="text-muted-foreground">Personality Type</span>
                <p className="font-bold text-sm mt-0.5">{student.traits?.personality || "Ambivert"}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <span className="text-muted-foreground">Noise Tolerance</span>
                <p className="font-bold text-sm mt-0.5">{student.traits?.noise || "Moderate"}</p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <span className="text-muted-foreground">Hometown & Language</span>
                <p className="font-bold text-sm mt-0.5">{student.hometown || "Campus"} ({student.language || "Tamil"})</p>
              </div>
            </div>

            {/* Top Compatible Roommates Preview */}
            <div className="mt-5 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Top Compatible Roommates in Preferred {requiredType} Hostels
                </h3>
                <span className="text-xs text-primary font-semibold">Live Match Calculator</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Array.isArray(roommateMatches) ? roommateMatches : []).slice(0, 4).map((match) => (
                  <div key={match.regNo} className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={match.avatar} alt={match.name} className="size-10 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold">{match.name}</p>
                        <p className="text-[11px] text-muted-foreground">{match.dept} · {match.hometown || "Campus"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="hero" className="text-[11px] py-0.5">
                        {match.compatibility}%
                      </Badge>
                      <Button size="icon" variant="ghost" className="size-7" type="button" onClick={() => setSelectedMatch(match)}>
                        <Eye className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Target Hostel & Preferences */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BedDouble className="size-5 text-primary" /> Target Hostel & Room Preferences
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-3">
                <Label>Target / Preferred Hostel Block</Label>
                <select
                  value={targetHostel}
                  onChange={(e) => setTargetHostel(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Preferred Hostel ({requiredType} Hostel)</option>
                  {hostelsList.map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.type} Hostel)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Room Type</Label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Non-AC">Non-AC Room</option>
                  <option value="AC">AC Room</option>
                  <option value="Deluxe AC">Deluxe AC</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Sharing Preference</Label>
                <select
                  value={sharing}
                  onChange={(e) => setSharing(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="2">2 Sharing Room</option>
                  <option value="3">3 Sharing Room</option>
                  <option value="4">4 Sharing Room</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Room Change</Label>
              <Textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detailed reason for requesting a change (e.g. Study habits incompatibility, medical reasons, shift of floor)"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed p-4 text-sm hover:border-primary/50 transition-colors">
              <span>Upload Supporting Proof (Medical Certificate / Recommendation)</span>
              <span className="text-xs font-semibold text-primary">Choose File</span>
              <input type="file" className="sr-only" />
            </label>
          </section>

          {/* Section 5: Application Submission */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-bold">Request Submission & Verification</h2>
            <Progress value={90} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">Ready for Warden Verification & Admin Room Allotment.</p>
            <div className="mt-4 flex gap-3">
              <Button type="submit" variant="hero" disabled={submitRoomChangeMutation.isPending} className="flex-1">
                {submitRoomChangeMutation.isPending ? "Submitting..." : "Submit Room Change Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.success("Draft Saved", { description: "Your room change draft has been saved." })}
              >
                Save Draft
              </Button>
            </div>
          </section>
        </form>

        {/* Right Column: Room Change Request Status Tracker */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft h-fit">
          <h2 className="text-sm font-bold">Room Change Request Status Tracker</h2>
          {latestRequest ? (
            <div className="mt-4 rounded-xl bg-muted/50 p-4 space-y-2 border">
              <p className="text-xs font-bold text-primary">Request ID: #{latestRequest.id}</p>
              <p className="text-sm font-medium">Target Block: {latestRequest.targetHostel}</p>
              <p className="text-xs text-muted-foreground">Current: {latestRequest.currentHostel} #{latestRequest.currentRoom}</p>
              <p className="text-xs text-muted-foreground">Reason: {latestRequest.reason}</p>
              <p className="text-xs font-semibold">
                Current Status:{" "}
                <span className={`font-bold ${
                  latestRequest.status === "Approved by Warden"
                    ? "text-blue-600 dark:text-blue-400"
                    : latestRequest.status === "Room Allotted" || latestRequest.status === "Approved"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : latestRequest.status.includes("Rejected")
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  {latestRequest.status === "Approved by Warden"
                    ? "Approved by Warden (Awaiting Admin Room Allotment)"
                    : latestRequest.status === "Room Allotted" || latestRequest.status === "Approved"
                    ? `Room ${latestRequest.allottedRoom || "204"} Allotted in ${latestRequest.targetHostel}`
                    : latestRequest.status}
                </span>
              </p>
            </div>
          ) : null}

          <ol className="mt-5 space-y-6 border-l pl-5">
            {[
              [
                "Submitted",
                latestRequest ? `Submitted on ${latestRequest.appliedDate}` : "No active request",
                !!latestRequest,
              ],
              [
                "Warden Review",
                latestRequest?.status === "Approved by Warden" ||
                latestRequest?.status === "Approved" ||
                latestRequest?.status === "Room Allotted"
                  ? "Warden Approved & Forwarded to Admin"
                  : latestRequest?.status === "Pending Warden Review" || latestRequest?.status === "Pending"
                    ? "Under Review by Warden"
                    : latestRequest?.status.includes("Rejected")
                    ? "Rejected"
                    : "Pending Warden Review",
                !!latestRequest && !latestRequest.status.includes("Rejected"),
              ],
              [
                "Admin Approval",
                latestRequest?.status === "Approved" || latestRequest?.status === "Room Allotted"
                  ? "Approved by System Admin"
                  : latestRequest?.status === "Approved by Warden"
                    ? "Awaiting Admin Room Allotment"
                    : "Pending Admin Review",
                latestRequest?.status === "Approved by Warden" ||
                latestRequest?.status === "Approved" ||
                latestRequest?.status === "Room Allotted",
              ],
              [
                "Room Allotted",
                latestRequest?.status === "Approved" || latestRequest?.status === "Room Allotted"
                  ? `Room ${latestRequest.allottedRoom || "204"} Allotted in ${latestRequest.targetHostel}`
                  : "Pending Allotment",
                latestRequest?.status === "Approved" || latestRequest?.status === "Room Allotted",
              ],
            ].map(([s, d, active]) => (
              <li key={s} className="relative">
                <span
                  className={`absolute -left-[26px] top-1 size-3 rounded-full ring-4 ring-card ${active ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
                <p className="text-sm font-semibold">{s}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <CompatibilityModal
        student={selectedMatch}
        currentStudent={currentUser}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </AppShell>
  );
}
