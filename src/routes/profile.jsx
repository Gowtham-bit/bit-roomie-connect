import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setToken } from "@/lib/api";
import { DEPARTMENTS } from "@/lib/mock-data";
import {
  useCurrentUser,
  useUpdateProfile,
  useApplications,
  useComplaints,
  useRoomChangeRequests,
} from "@/hooks/use-hostel-api";
import {
  Activity,
  Award,
  Building2,
  CheckCircle2,
  Key,
  Phone,
  Shield,
  UserCheck,
  Pencil,
  Save,
  X,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  User,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";

const DEFAULT_AVATAR = "/default-avatar.svg";

function ProfileAvatarUploader({
  avatar,
  name,
  onAvatarChange,
  disabled = false,
  className = "",
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size should be less than 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        onAvatarChange(base64);
        toast.success("Profile picture updated from device!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    onAvatarChange("");
    toast.success("Profile picture reset to default.");
  };

  const avatarSrc = avatar && typeof avatar === "string" && avatar.trim() !== "" ? avatar : DEFAULT_AVATAR;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative mx-auto size-28 sm:size-32 group">
        <img
          src={avatarSrc}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
          alt={name || "Profile picture"}
          className="size-28 sm:size-32 rounded-3xl object-cover ring-4 ring-primary/20 bg-muted shadow-md transition-all group-hover:ring-primary/40"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          title="Upload profile picture from device"
          aria-label="Upload photo"
        >
          <Camera className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="h-7 text-xs px-2.5 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          <Upload className="mr-1.5 size-3" /> Choose from device
        </Button>
        {avatar && typeof avatar === "string" && avatar.trim() !== "" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={handleRemove}
            className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title="Reset to default image"
          >
            <Trash2 className="size-3 mr-1" /> Remove
          </Button>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        PNG, JPG, WEBP up to 3MB
      </p>
    </div>
  );
}

export const Route = createFileRoute("/profile")({
  validateSearch: (search) => ({
    setup: search?.setup === "true" || search?.setup === true ? "true" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "User Profile · BIT Hostel Portal" },
      {
        name: "description",
        content: "Account, personal and administrative profile details for BIT hostel users.",
      },
      { property: "og:title", content: "User Profile · BIT Hostel Portal" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const currentStudent = user || {};
  const search = Route.useSearch();
  const isSetup = search?.setup === "true" || currentStudent.isProfileComplete === false;

  const isAdmin = currentStudent.role === "admin" || currentStudent.regNo === "admin123";
  const isWarden =
    currentStudent.role === "warden" ||
    currentStudent.regNo === "warden123" ||
    currentStudent.regNo === "gwarden123";

  if (isAdmin) {
    return <AdminProfile user={currentStudent} />;
  }
  if (isWarden) {
    return <WardenProfile user={currentStudent} />;
  }

  return <StudentProfile user={currentStudent} isSetup={isSetup} />;
}

// ==========================================
// 👨‍💼 WARDEN PROFILE COMPONENT (Fully Editable)
// ==========================================
function WardenProfile({ user: initialUser }) {
  const updateProfileMutation = useUpdateProfile();
  const isGirlsWarden = initialUser.wardenType === "Girls" || initialUser.regNo === "gwarden123";
  const wardenType = isGirlsWarden ? "Girls" : "Boys";

  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: initialUser.name || (isGirlsWarden ? "Mrs. S. Meenakshi" : "Mr. K. Kumar"),
    empId: initialUser.empId || (initialUser.regNo === "gwarden123" ? "BIT-W002" : "BIT-W001"),
    email: initialUser.email || (isGirlsWarden ? "girlswarden@bitsathy.ac.in" : "boyswarden@bitsathy.ac.in"),
    phone: initialUser.phone || "+91 98421 88392",
    officePhone: initialUser.officePhone || "+91 4295 226001",
    emergencyContact: initialUser.emergencyContact || "+91 94432 11990",
    officeLocation:
      initialUser.officeLocation ||
      (isGirlsWarden ? "Girls Hostel Admin Block, Ground Floor" : "Boys Hostel Main Gate Office, Ground Floor"),
    department: initialUser.department || "Hostel Administration",
    designation: initialUser.designation || "Hostel Warden",
    dateOfJoining: initialUser.dateOfJoining || "15 August 2021",
    avatar: initialUser.avatar || "",
    assignedBlocks: initialUser.assignedBlocks || (isGirlsWarden ? "Ganga, Yamuna, Narmadha, Cauvery" : "Sapphire, Emerald, Ruby, Diamond"),
    responsibilities: initialUser.responsibilities || [
      "Student Management",
      "Room Allocation",
      "Complaint Management",
      "Room Inspection",
      "Room Change Requests",
      "Student Attendance Monitoring",
      "Hostel Announcements",
    ],
  });

  const { data: appsData = [] } = useApplications();
  const { data: complaintsData = [] } = useComplaints();
  const { data: roomChangeData = [] } = useRoomChangeRequests();

  const pendingApps = Array.isArray(appsData) ? appsData.filter((a) => a.status === "Pending").length : 5;
  const pendingRc = Array.isArray(roomChangeData) ? roomChangeData.filter((r) => r.status === "Pending").length : 3;
  const openComplaints = Array.isArray(complaintsData) ? complaintsData.filter((c) => c.status !== "Resolved").length : 12;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (sectionToClose = null) => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Warden Profile Updated", {
          description: "All section updates saved successfully.",
        });
        setEditingSection(sectionToClose);
      },
      onError: (err) => {
        toast.error("Update Failed", { description: err.message });
      },
    });
  };

  const isEditing = (sec) => editingSection === "all" || editingSection === sec;

  return (
    <AppShell
      title={`Warden Profile · ${wardenType} Hostel`}
      breadcrumb={["Profile"]}
      actions={
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {editingSection === "all" ? (
            <>
              <Button variant="hero" onClick={() => handleSave(null)} className="flex-1 sm:flex-initial">
                <Save className="mr-2 size-4" /> Save All
              </Button>
              <Button variant="outline" onClick={() => setEditingSection(null)} className="flex-1 sm:flex-initial">
                <X className="mr-2 size-4" /> Cancel
              </Button>
            </>
          ) : (
            <Button variant="hero" onClick={() => setEditingSection("all")} className="flex-1 sm:flex-initial">
              <Pencil className="mr-2 size-4" /> Edit Profile Details
            </Button>
          )}
          <Button variant="outline" onClick={() => toast.success("Password reset link sent to registered email")} className="flex-1 sm:flex-initial">
            <Key className="mr-2 size-4" /> Change password
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Avatar & Contact */}
        <div className="space-y-5">
          <section className="relative rounded-2xl border bg-card p-4 sm:p-6 text-center shadow-soft">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("basic") ? null : "basic")}
                className="size-8 p-0"
                title="Edit basic info"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("basic") ? (
              <div className="space-y-3 text-left pt-2">
                <ProfileAvatarUploader
                  avatar={formData.avatar}
                  name={formData.name}
                  onAvatarChange={(newAvatar) => {
                    handleChange("avatar", newAvatar);
                    updateProfileMutation.mutate({ avatar: newAvatar });
                  }}
                  className="mb-2"
                />
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Employee ID</Label>
                  <Input value={formData.empId} onChange={(e) => handleChange("empId", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Department</Label>
                  <Input value={formData.department} onChange={(e) => handleChange("department", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" className="w-full mt-2" onClick={() => handleSave(null)}>
                    Save Section
                  </Button>
                )}
              </div>
            ) : (
              <>
                <ProfileAvatarUploader
                  avatar={formData.avatar}
                  name={formData.name}
                  onAvatarChange={(newAvatar) => {
                    handleChange("avatar", newAvatar);
                    updateProfileMutation.mutate({ avatar: newAvatar });
                  }}
                />
                <h2 className="font-display mt-4 text-xl font-bold">{formData.name}</h2>
                <p className="text-sm font-semibold text-primary">{formData.empId}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Badge variant="hero">{formData.designation}</Badge>
                  <Badge variant="secondary">{wardenType} Hostel</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Department: {formData.department}</p>
              </>
            )}
          </section>

          {/* Contact Information Section */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Phone className="size-4 text-primary" /> Contact Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("contact") ? null : "contact")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("contact") ? (
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Official Email</Label>
                  <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Personal Phone</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Office Phone</Label>
                  <Input value={formData.officePhone} onChange={(e) => handleChange("officePhone", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Emergency Contact</Label>
                  <Input value={formData.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Office Location</Label>
                  <Input value={formData.officeLocation} onChange={(e) => handleChange("officeLocation", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" className="w-full mt-2" onClick={() => handleSave(null)}>
                    Save Contact Info
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Official Email:</span>
                  <span className="font-semibold text-foreground">{formData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mobile Phone:</span>
                  <span className="font-semibold text-foreground">{formData.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Office Phone:</span>
                  <span className="font-semibold text-foreground">{formData.officePhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Emergency Contact:</span>
                  <span className="font-semibold text-foreground">{formData.emergencyContact}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Hostel Office Location:</span>
                  <span className="font-semibold text-foreground text-right">{formData.officeLocation}</span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Profile & Admin Sections */}
        <div className="space-y-5">
          {/* Section 1: Profile Details */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="size-4 text-primary" /> 1. Profile Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("details") ? null : "details")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("details") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Employee ID</Label>
                  <Input value={formData.empId} onChange={(e) => handleChange("empId", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Designation</Label>
                  <Input value={formData.designation} onChange={(e) => handleChange("designation", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Department</Label>
                  <Input value={formData.department} onChange={(e) => handleChange("department", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Date of Joining</Label>
                  <Input value={formData.dateOfJoining} onChange={(e) => handleChange("dateOfJoining", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Details
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Full Name</dt>
                  <dd className="font-semibold">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Employee ID</dt>
                  <dd className="font-semibold">{formData.empId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Designation</dt>
                  <dd className="font-semibold">{formData.designation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="font-semibold">{formData.department}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Date of Joining</dt>
                  <dd className="font-semibold">{formData.dateOfJoining}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-semibold">{formData.email}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Section 2: Hostel Management Info */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="size-4 text-primary" /> 2. Hostel Allocation Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("hostelInfo") ? null : "hostelInfo")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("hostelInfo") ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Assigned Hostel Blocks</Label>
                  <Input value={formData.assignedBlocks} onChange={(e) => handleChange("assignedBlocks", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                    Save Blocks Info
                  </Button>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Assigned Hostel Blocks</dt>
                  <dd className="font-semibold text-primary">{formData.assignedBlocks}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Hostel Type</dt>
                  <dd className="font-semibold">{wardenType} Hostels</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Number of Managed Rooms</dt>
                  <dd className="font-semibold">180</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Total Students Enrolled</dt>
                  <dd className="font-semibold">650</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Occupied Rooms</dt>
                  <dd className="font-semibold text-accent">158</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Section 3: Responsibilities */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Award className="size-4 text-primary" /> 3. Responsibilities
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("resp") ? null : "resp")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("resp") ? (
              <div className="space-y-3">
                <Label className="text-xs">Responsibilities (Comma Separated)</Label>
                <Input
                  value={Array.isArray(formData.responsibilities) ? formData.responsibilities.join(", ") : formData.responsibilities}
                  onChange={(e) => handleChange("responsibilities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                    Save Responsibilities
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(formData.responsibilities) ? formData.responsibilities : []).map((resp) => (
                  <Badge key={resp} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                    <CheckCircle2 className="mr-1.5 size-3.5 text-accent" /> {resp}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Statistics */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Activity className="size-4 text-primary" /> 4. Warden Dashboard Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-center">
              <StatBox label="Students" value="650" />
              <StatBox label="Rooms" value="180" />
              <StatBox label="Occupied" value="158" tone="text-accent" />
              <StatBox label="Available" value="22" tone="text-primary" />
              <StatBox label="Complaints" value={openComplaints} tone="text-amber-500" />
              <StatBox label="Pending Requests" value={pendingApps + pendingRc} tone="text-blue-500" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// 👨‍💻 ADMIN PROFILE COMPONENT (Fully Editable)
// ==========================================
function AdminProfile({ user: initialUser }) {
  const updateProfileMutation = useUpdateProfile();
  const [editingSection, setEditingSection] = useState(null);

  const [formData, setFormData] = useState({
    name: initialUser.name || "Mr. R. Arun",
    adminId: initialUser.adminId || "BIT-ADM001",
    email: initialUser.email || "admin@bitsathy.ac.in",
    phone: initialUser.phone || "+91 98765 43210",
    designation: initialUser.designation || "Hostel Administrator",
    department: initialUser.department || "IT & Operations",
    avatar: initialUser.avatar || "",
    responsibilities: initialUser.responsibilities || [
      "Student Management",
      "Warden Management",
      "Hostel Management",
      "Room Management",
      "Room Allocation",
      "Roommate Matching Management",
      "Complaint Management",
      "Notification Management",
      "Reports",
      "System Settings",
    ],
  });

  const { data: appsData = [] } = useApplications();
  const { data: complaintsData = [] } = useComplaints();

  const pendingApps = Array.isArray(appsData) ? appsData.filter((a) => a.status === "Pending").length : 85;
  const openComplaints = Array.isArray(complaintsData) ? complaintsData.filter((c) => c.status !== "Resolved").length : 24;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (sectionToClose = null) => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Administrator Profile Updated", {
          description: "Changes saved to user profile.",
        });
        setEditingSection(sectionToClose);
      },
      onError: (err) => {
        toast.error("Update Failed", { description: err.message });
      },
    });
  };

  const isEditing = (sec) => editingSection === "all" || editingSection === sec;

  return (
    <AppShell
      title="System Administrator Profile"
      breadcrumb={["Profile"]}
      actions={
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {editingSection === "all" ? (
            <>
              <Button variant="hero" onClick={() => handleSave(null)} className="flex-1 sm:flex-initial">
                <Save className="mr-2 size-4" /> Save All
              </Button>
              <Button variant="outline" onClick={() => setEditingSection(null)} className="flex-1 sm:flex-initial">
                <X className="mr-2 size-4" /> Cancel
              </Button>
            </>
          ) : (
            <Button variant="hero" onClick={() => setEditingSection("all")} className="flex-1 sm:flex-initial">
              <Pencil className="mr-2 size-4" /> Edit Profile Details
            </Button>
          )}
          <Button variant="outline" onClick={() => toast.success("Password change link sent to admin email")} className="flex-1 sm:flex-initial">
            <Key className="mr-2 size-4" /> Change password
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-5">
          <section className="relative rounded-2xl border bg-card p-4 sm:p-6 text-center shadow-soft">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("basic") ? null : "basic")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("basic") ? (
              <div className="space-y-3 text-left pt-2">
                <ProfileAvatarUploader
                  avatar={formData.avatar}
                  name={formData.name}
                  onAvatarChange={(newAvatar) => {
                    handleChange("avatar", newAvatar);
                    updateProfileMutation.mutate({ avatar: newAvatar });
                  }}
                  className="mb-2"
                />
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Admin ID</Label>
                  <Input value={formData.adminId} onChange={(e) => handleChange("adminId", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Department</Label>
                  <Input value={formData.department} onChange={(e) => handleChange("department", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" className="w-full mt-2" onClick={() => handleSave(null)}>
                    Save Basic Info
                  </Button>
                )}
              </div>
            ) : (
              <>
                <ProfileAvatarUploader
                  avatar={formData.avatar}
                  name={formData.name}
                  onAvatarChange={(newAvatar) => {
                    handleChange("avatar", newAvatar);
                    updateProfileMutation.mutate({ avatar: newAvatar });
                  }}
                />
                <h2 className="font-display mt-4 text-xl font-bold">{formData.name}</h2>
                <p className="text-sm font-semibold text-primary">{formData.adminId}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Badge variant="hero">{formData.designation}</Badge>
                  <Badge variant="secondary">Department: {formData.department}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Email: {formData.email}</p>
                <p className="text-xs text-muted-foreground">Phone: {formData.phone}</p>
              </>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Shield className="size-4 text-primary" /> Security Information
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Status:</span>
                <Badge variant="success" className="px-2 py-0.5 text-[11px]">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Login:</span>
                <span className="font-semibold text-foreground">Today, 09:15 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Sessions:</span>
                <span className="font-semibold text-foreground">1 Active (Chrome / Win)</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Profile Details */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="size-4 text-primary" /> 1. Profile Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("details") ? null : "details")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("details") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Admin ID</Label>
                  <Input value={formData.adminId} onChange={(e) => handleChange("adminId", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Designation</Label>
                  <Input value={formData.designation} onChange={(e) => handleChange("designation", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Department</Label>
                  <Input value={formData.department} onChange={(e) => handleChange("department", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Phone Number</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Information
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Full Name</dt>
                  <dd className="font-semibold">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Admin ID</dt>
                  <dd className="font-semibold">{formData.adminId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Designation</dt>
                  <dd className="font-semibold">{formData.designation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="font-semibold">{formData.department}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-semibold">{formData.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Phone Number</dt>
                  <dd className="font-semibold">{formData.phone}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Responsibilities */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Shield className="size-4 text-primary" /> 2. Administrative Responsibilities
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("resp") ? null : "resp")}
                className="size-8 p-0"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("resp") ? (
              <div className="space-y-3">
                <Label className="text-xs">Responsibilities (Comma Separated)</Label>
                <Input
                  value={Array.isArray(formData.responsibilities) ? formData.responsibilities.join(", ") : formData.responsibilities}
                  onChange={(e) => handleChange("responsibilities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                    Save Responsibilities
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(formData.responsibilities) ? formData.responsibilities : []).map((resp) => (
                  <Badge key={resp} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                    <CheckCircle2 className="mr-1.5 size-3.5 text-primary" /> {resp}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* System Info */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Building2 className="size-4 text-primary" /> 3. System Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              <StatBox label="Total Students" value="5000+" tone="text-primary" />
              <StatBox label="Total Hostels" value="13" />
              <StatBox label="Total Rooms" value="1500+" />
              <StatBox label="Occupied Rooms" value="1200+" tone="text-accent" />
              <StatBox label="Available Rooms" value="300+" tone="text-blue-500" />
              <StatBox label="Pending Applications" value={pendingApps} tone="text-amber-500" />
              <StatBox label="Pending Complaints" value={openComplaints} tone="text-red-500" />
              <StatBox label="Roommate Requests" value="42" tone="text-purple-500" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// 🎓 STUDENT PROFILE COMPONENT (Fully Editable)
// ==========================================
function StudentProfile({ user: currentStudent, isSetup = false }) {
  const navigate = useNavigate();
  const updateProfileMutation = useUpdateProfile();
  const [editingSection, setEditingSection] = useState(isSetup ? "all" : null); // null, 'all', 'basic', 'personal', 'traits', 'academic', 'hostel', 'guardian'

  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    avatar: "",
    email: "",
    mobile: "",
    gender: "Male",
    hometown: "",

    sleep: "10 PM – 12 AM",
    cleanliness: "Very Clean",
    food: "Non-Veg",
    personality: "Ambivert",
    noise: "Moderate",
    study: "Night",
    visitors: "Occasionally",
    language: "Tamil",
    interests: "Coding, Cricket, Gaming",

    department: "Computer Science and Engineering",
    dept: "CSE",
    year: 1,
    cgpa: "8.50",

    hostel: "Sapphire Block",
    room: "312",
    messPlan: "Vegetarian",
    feeStatus: "Term I Paid",

    guardianName: "Subramanian R",
    guardianRelation: "Father",
    guardianMobile: "9843112233",
    guardianOccupation: "Agriculturist",
  });

  useEffect(() => {
    if (isSetup) {
      setEditingSection("all");
    }
  }, [isSetup]);

  useEffect(() => {
    if (currentStudent) {
      setFormData((prev) => ({
        ...prev,
        name: currentStudent.name || prev.name || "Student",
        regNo: currentStudent.regNo || prev.regNo || "",
        avatar: currentStudent.avatar || prev.avatar || "",
        email: currentStudent.email || prev.email || "",
        mobile: currentStudent.mobile || prev.mobile || "",
        gender: currentStudent.gender || prev.gender || "Male",
        hometown: currentStudent.hometown || prev.hometown || "",

        sleep: currentStudent.traits?.sleep || prev.sleep || "10 PM – 12 AM",
        cleanliness: String(currentStudent.traits?.cleanliness || prev.cleanliness || "Very Clean"),
        food: currentStudent.traits?.food || prev.food || "Non-Veg",
        personality: currentStudent.traits?.personality || prev.personality || "Ambivert",
        noise: currentStudent.traits?.noise || prev.noise || "Moderate",
        study: currentStudent.traits?.study || prev.study || "Night",
        visitors: currentStudent.traits?.visitors || prev.visitors || "Occasionally",
        language: currentStudent.language || prev.language || "Tamil",
        interests: Array.isArray(currentStudent.interests)
          ? currentStudent.interests.join(", ")
          : currentStudent.interests || prev.interests || "Coding, Cricket, Gaming",

        department: currentStudent.department || prev.department || "Computer Science and Engineering",
        dept: (currentStudent.dept || currentStudent.department || prev.dept || "CSE").replace(/CSa?E/gi, "CSE"),
        year: currentStudent.year || prev.year || 1,
        cgpa: currentStudent.cgpa || prev.cgpa || "8.50",

        hostel: currentStudent.hostel || prev.hostel || "Sapphire Block",
        room: currentStudent.room || prev.room || "312",
        messPlan: currentStudent.messPlan || prev.messPlan || "Vegetarian",
        feeStatus: currentStudent.feeStatus || prev.feeStatus || "Term I Paid",

        guardianName: currentStudent.guardian?.name || currentStudent.guardianName || prev.guardianName || "",
        guardianRelation: currentStudent.guardian?.relation || currentStudent.guardianRelation || prev.guardianRelation || "Father",
        guardianMobile: currentStudent.guardian?.mobile || currentStudent.guardianMobile || prev.guardianMobile || "",
        guardianOccupation: currentStudent.guardian?.occupation || currentStudent.guardianOccupation || prev.guardianOccupation || "",
      }));
    }
  }, [currentStudent]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (sectionToClose = null, proceedToDashboard = false) => {
    if (!formData.name?.trim()) {
      toast.error("Please enter your Full Name.");
      return;
    }
    if (!formData.regNo?.trim()) {
      toast.error("Please enter your Register Number.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      regNo: formData.regNo.trim(),
      avatar: formData.avatar,
      email: formData.email,
      mobile: formData.mobile,
      gender: formData.gender,
      hometown: formData.hometown,
      language: formData.language,
      interests: typeof formData.interests === "string" ? formData.interests.split(",").map((i) => i.trim()).filter(Boolean) : formData.interests,
      department: formData.department,
      dept: formData.dept,
      year: Number(formData.year) || 1,
      cgpa: formData.cgpa,
      hostel: formData.hostel,
      room: formData.room,
      messPlan: formData.messPlan,
      feeStatus: formData.feeStatus,
      isProfileComplete: true,
      guardian: {
        name: formData.guardianName,
        relation: formData.guardianRelation,
        mobile: formData.guardianMobile,
        occupation: formData.guardianOccupation,
      },
      traits: {
        sleep: formData.sleep,
        cleanliness: formData.cleanliness,
        food: formData.food,
        personality: formData.personality,
        noise: formData.noise,
        study: formData.study,
        visitors: formData.visitors,
      },
    };

    updateProfileMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res && res.error) {
          toast.error("Update Failed", { description: res.error });
        } else {
          if (res?.token) {
            setToken(res.token);
          }
          toast.success("Profile Details Saved Successfully!", {
            description: (isSetup || proceedToDashboard)
              ? "Your profile setup is complete! Redirecting to Dashboard..."
              : "All section changes have been saved.",
          });
          setEditingSection(sectionToClose);

          if (isSetup || proceedToDashboard) {
            setTimeout(() => {
              navigate({ to: "/dashboard" });
            }, 700);
          }
        }
      },
      onError: (err) => {
        toast.error("Profile Error", { description: err.message });
      },
    });
  };

  const isEditing = (sec) => editingSection === "all" || editingSection === sec;

  return (
    <AppShell
      title={isSetup ? "Complete Your Profile Details" : "My Profile"}
      breadcrumb={isSetup ? ["Onboarding", "Profile Setup"] : ["Profile"]}
      actions={
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isSetup ? (
            <Button
              variant="hero"
              onClick={() => handleSave(null, true)}
              disabled={updateProfileMutation.isPending}
              className="flex-1 sm:flex-initial shadow-md"
            >
              <Save className="mr-2 size-4" /> {updateProfileMutation.isPending ? "Saving..." : "Save & Continue to Dashboard"}
            </Button>
          ) : editingSection === "all" ? (
            <>
              <Button variant="hero" onClick={() => handleSave(null)} disabled={updateProfileMutation.isPending} className="flex-1 sm:flex-initial">
                <Save className="mr-2 size-4" /> {updateProfileMutation.isPending ? "Saving..." : "Save All"}
              </Button>
              <Button variant="outline" onClick={() => setEditingSection(null)} className="flex-1 sm:flex-initial">
                <X className="mr-2 size-4" /> Cancel
              </Button>
            </>
          ) : (
            <Button variant="hero" onClick={() => setEditingSection("all")} className="flex-1 sm:flex-initial">
              <Pencil className="mr-2 size-4" /> Edit Profile Details
            </Button>
          )}
          {!isSetup && (
            <Button variant="outline" onClick={() => toast.success("Password reset link sent to registered email")} className="flex-1 sm:flex-initial">
              <Key className="mr-2 size-4" /> Change password
            </Button>
          )}
        </div>
      }
    >
      {isSetup && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-5 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shrink-0">
              <Sparkles className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="hero" className="text-xs px-2 py-0.5">First-Time Setup</Badge>
                <span className="text-xs font-semibold text-primary">Required Action</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
                Welcome to BIT Hostel Portal! Complete Your Profile Details
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Please enter or review your profile details below (Name, Register Number, Department, Local Profile Photo, Guardian Information, and Roommate Lifestyle Preferences). Once saved, your account will be activated for hostel room allocations and services.
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              disabled={updateProfileMutation.isPending}
              onClick={() => handleSave(null, true)}
              className="w-full sm:w-auto shadow-md shrink-0"
            >
              <Save className="mr-2 size-4" />
              {updateProfileMutation.isPending ? "Saving..." : "Save & Continue to Dashboard"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Avatar & Quick Summary */}
        <div className="space-y-5">
          <section className="relative rounded-2xl border bg-card p-4 sm:p-6 text-center shadow-soft">
            {!isSetup && (
              <div className="absolute right-4 top-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSection(isEditing("basic") ? null : "basic")}
                  className="size-8 p-0"
                  title="Edit core details"
                >
                  <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                </Button>
              </div>
            )}

            {isEditing("basic") ? (
              <div className="space-y-3 text-left pt-2">
                <ProfileAvatarUploader
                  avatar={formData.avatar}
                  name={formData.name}
                  onAvatarChange={(newAvatar) => {
                    handleChange("avatar", newAvatar);
                    updateProfileMutation.mutate({ avatar: newAvatar });
                  }}
                  className="mb-2"
                />
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" placeholder="e.g. Gowtham" />
                </div>
                <div>
                  <Label className="text-xs">Register Number</Label>
                  <Input value={formData.regNo} onChange={(e) => handleChange("regNo", e.target.value)} className="mt-1" placeholder="e.g. 7376242AD142" />
                </div>
                <div>
                  <Label className="text-xs">Department</Label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      const deptName = e.target.value;
                      handleChange("department", deptName);
                      const map = {
                        "Computer Science and Engineering": "CSE",
                        "Information Technology": "IT",
                        "Artificial Intelligence and Data Science": "AI&DS",
                        "Artificial Intelligence and Machine Learning": "AI&ML",
                        "Electronics and Communication Engineering": "ECE",
                        "Electrical and Electronics Engineering": "EEE",
                        "Mechanical Engineering": "MECH",
                        "Civil Engineering": "CIVIL",
                        "Biotechnology": "BT",
                        "Biomedical Engineering": "BME",
                        "Fashion Technology": "FT",
                        "Food Technology": "FD",
                        "Agricultural Engineering": "AGRI",
                      };
                      if (map[deptName]) {
                        handleChange("dept", map[deptName]);
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Year of Study</Label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleChange("year", Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                {editingSection !== "all" && (
                  <Button size="sm" variant="hero" className="w-full mt-2" onClick={() => handleSave(null)}>
                    Save Basic Details
                  </Button>
                )}
              </div>
            ) : (
              <>
                <ProfileAvatarUploader
                  avatar={formData.avatar}
                  name={formData.name}
                  onAvatarChange={(newAvatar) => {
                    handleChange("avatar", newAvatar);
                    updateProfileMutation.mutate({ avatar: newAvatar });
                  }}
                />
                <h2 className="font-display mt-3 text-xl font-bold">{formData.name}</h2>
                <p className="text-sm font-semibold text-primary">{formData.regNo}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="hero">{formData.dept}</Badge>
                  <Badge variant="secondary">Year {formData.year}</Badge>
                  <Badge variant="outline">{formData.hostel}</Badge>
                </div>
              </>
            )}
          </section>

          {/* Quick Info Box */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-3 text-xs">
            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
              <Sparkles className="size-4 text-primary" /> Profile Quick Summary
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Compatibility Index:</span>
              <Badge variant="success">92% Match Rate</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Room Status:</span>
              <span className="font-semibold">{formData.hostel} - R{formData.room}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mess Plan:</span>
              <span className="font-semibold">{formData.messPlan}</span>
            </div>
          </section>
        </div>

        {/* Right Column: Editable Profile Sections */}
        <div className="space-y-5">

          {/* Section 1: Personal Information */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <User className="size-4 text-primary" /> 1. Personal Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("personal") ? null : "personal")}
                className="size-8 p-0"
                title="Edit Personal Info"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("personal") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Mobile Number</Label>
                  <Input value={formData.mobile} onChange={(e) => handleChange("mobile", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Gender</Label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Hometown</Label>
                  <Input value={formData.hometown} onChange={(e) => handleChange("hometown", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Personal Information
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-semibold">{formData.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Mobile</dt>
                  <dd className="font-semibold">{formData.mobile}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Gender</dt>
                  <dd className="font-semibold">{formData.gender}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Hometown</dt>
                  <dd className="font-semibold">{formData.hometown}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Section 2: Lifestyle & Compatibility Answers */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" /> 2. Lifestyle & Compatibility Answers
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("traits") ? null : "traits")}
                className="size-8 p-0"
                title="Edit Lifestyle Answers"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("traits") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Sleep Schedule</Label>
                  <select
                    value={formData.sleep}
                    onChange={(e) => handleChange("sleep", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="9 PM – 11 PM">9 PM – 11 PM</option>
                    <option value="10 PM – 12 AM">10 PM – 12 AM</option>
                    <option value="11 PM – 1 AM">11 PM – 1 AM</option>
                    <option value="12 AM – 2 AM (Night Owl)">12 AM – 2 AM (Night Owl)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Cleanliness Standard</Label>
                  <select
                    value={formData.cleanliness}
                    onChange={(e) => handleChange("cleanliness", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Extremely Clean">Extremely Clean</option>
                    <option value="Very Clean">Very Clean</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Relaxed">Relaxed</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Food Preference</Label>
                  <select
                    value={formData.food}
                    onChange={(e) => handleChange("food", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Personality Type</Label>
                  <select
                    value={formData.personality}
                    onChange={(e) => handleChange("personality", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Introvert">Introvert</option>
                    <option value="Ambivert">Ambivert</option>
                    <option value="Extrovert">Extrovert</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Noise Tolerance</Label>
                  <select
                    value={formData.noise}
                    onChange={(e) => handleChange("noise", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Quiet">Quiet</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Study Preference</Label>
                  <select
                    value={formData.study}
                    onChange={(e) => handleChange("study", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Early Morning">Early Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Visitors Preference</Label>
                  <select
                    value={formData.visitors}
                    onChange={(e) => handleChange("visitors", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Never">Never</option>
                    <option value="Rarely">Rarely</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Frequently">Frequently</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Primary Language</Label>
                  <Input value={formData.language} onChange={(e) => handleChange("language", e.target.value)} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Hobbies & Interests (comma separated)</Label>
                  <Input value={formData.interests} onChange={(e) => handleChange("interests", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Lifestyle Answers
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Sleep Schedule</dt>
                  <dd className="font-semibold">{formData.sleep}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Cleanliness Standard</dt>
                  <dd className="font-semibold">{formData.cleanliness}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Food Preference</dt>
                  <dd className="font-semibold">{formData.food}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Personality Type</dt>
                  <dd className="font-semibold">{formData.personality}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Noise Tolerance</dt>
                  <dd className="font-semibold">{formData.noise}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Study Preference</dt>
                  <dd className="font-semibold">{formData.study}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Visitors Preference</dt>
                  <dd className="font-semibold">{formData.visitors}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Language</dt>
                  <dd className="font-semibold">{formData.language}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Hobbies & Interests</dt>
                  <dd className="font-semibold text-primary">{formData.interests}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Section 3: Academic Information */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" /> 3. Academic Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("academic") ? null : "academic")}
                className="size-8 p-0"
                title="Edit Academic Info"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("academic") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Full Department Name</Label>
                  <Input value={formData.department} onChange={(e) => handleChange("department", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Department Code</Label>
                  <Input value={formData.dept} onChange={(e) => handleChange("dept", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Year of Study</Label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleChange("year", Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">CGPA</Label>
                  <Input value={formData.cgpa} onChange={(e) => handleChange("cgpa", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Academic Information
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="font-semibold">{formData.department}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Year of Study</dt>
                  <dd className="font-semibold">Year {formData.year}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">CGPA</dt>
                  <dd className="font-semibold text-accent">{formData.cgpa}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Hometown</dt>
                  <dd className="font-semibold">{formData.hometown}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Section 4: Hostel Information */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="size-4 text-primary" /> 4. Hostel Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("hostel") ? null : "hostel")}
                className="size-8 p-0"
                title="Edit Hostel Details"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("hostel") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Hostel Block</Label>
                  <Input value={formData.hostel} onChange={(e) => handleChange("hostel", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Room Number</Label>
                  <Input value={formData.room} onChange={(e) => handleChange("room", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Mess Plan</Label>
                  <select
                    value={formData.messPlan}
                    onChange={(e) => handleChange("messPlan", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Special Veg">Special Veg</option>
                    <option value="Deluxe Mess">Deluxe Mess</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Fee Status</Label>
                  <select
                    value={formData.feeStatus}
                    onChange={(e) => handleChange("feeStatus", e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Term I Paid">Term I Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Term II Pending">Term II Pending</option>
                    <option value="Processing">Processing</option>
                  </select>
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Hostel Information
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Hostel Block</dt>
                  <dd className="font-semibold text-primary">{formData.hostel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Room Number</dt>
                  <dd className="font-semibold">{formData.room}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Mess Plan</dt>
                  <dd className="font-semibold">{formData.messPlan}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Fee Status</dt>
                  <dd className="font-semibold text-accent">{formData.feeStatus}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Section 5: Guardian Details */}
          <section className="relative rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Shield className="size-4 text-primary" /> 5. Guardian Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(isEditing("guardian") ? null : "guardian")}
                className="size-8 p-0"
                title="Edit Guardian Details"
              >
                <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {isEditing("guardian") ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Guardian Full Name</Label>
                  <Input value={formData.guardianName} onChange={(e) => handleChange("guardianName", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Relationship</Label>
                  <Input value={formData.guardianRelation} onChange={(e) => handleChange("guardianRelation", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Guardian Mobile Phone</Label>
                  <Input value={formData.guardianMobile} onChange={(e) => handleChange("guardianMobile", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Guardian Occupation</Label>
                  <Input value={formData.guardianOccupation} onChange={(e) => handleChange("guardianOccupation", e.target.value)} className="mt-1" />
                </div>
                {editingSection !== "all" && (
                  <div className="sm:col-span-2 pt-2">
                    <Button size="sm" variant="hero" onClick={() => handleSave(null)}>
                      Save Guardian Details
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Guardian Name</dt>
                  <dd className="font-semibold">{formData.guardianName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Relation</dt>
                  <dd className="font-semibold">{formData.guardianRelation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Contact Mobile</dt>
                  <dd className="font-semibold">{formData.guardianMobile}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Occupation</dt>
                  <dd className="font-semibold">{formData.guardianOccupation}</dd>
                </div>
              </dl>
            )}
          </section>

          {isSetup && (
            <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">All set with your profile details?</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm all required information above and click below to complete setup and proceed to your dashboard.
                </p>
              </div>
              <Button
                variant="hero"
                size="lg"
                disabled={updateProfileMutation.isPending}
                onClick={() => handleSave(null, true)}
                className="w-full sm:w-auto shadow-md"
              >
                <Save className="mr-2 size-4" />
                {updateProfileMutation.isPending ? "Saving Details..." : "Save Profile & Enter Portal"}
              </Button>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}

function StatBox({ label, value, tone }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className={`font-display text-xl font-bold ${tone || "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
