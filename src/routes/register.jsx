import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEPARTMENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { apiRegister } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Create a BIT hostel portal account with your register number, department, year and hostel preference.",
      },
      { property: "og:title", content: "Student Registration · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Register once to apply for hostel rooms and roommate matchmaking at BIT.",
      },
    ],
  }),
  component: RegisterPage,
});

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [show, setShow] = useState(false);
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });
  const pw = watch("password") ?? "";
  const score = strength(pw);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];

  const handleNextStep = async () => {
    const valid = await trigger(["name", "regNo", "department", "year", "gender", "email", "mobile", "password", "confirm"]);
    if (valid) {
      setStep(2);
    } else {
      toast.error("Please complete all required fields correctly before proceeding.");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        hometown: data.hometown || "Coimbatore",
        language: data.language || "Tamil",
        interests: data.interests ? data.interests.split(",").map(i => i.trim()).filter(Boolean) : ["Coding", "Cricket", "Gaming"],
        traits: {
          sleep: data.sleep || "10 PM – 12 AM",
          wake: data.wake || "6–8 AM",
          cleanliness: data.cleanliness || "Very Clean",
          food: data.food || "Non-Veg",
          personality: data.personality || "Ambivert",
          noise: data.noise || "Moderate",
          study: data.study || "Night",
          visitors: data.visitors || "Occasionally",
        },
      };

      const result = await apiRegister(payload);
      if (result.error) {
        toast.error("Registration Failed", { description: result.error });
        return;
      }
      toast.success("Registration & Compatibility Profile Saved!", {
        description: "Your account and lifestyle responses are now stored in MongoDB Atlas.",
      });
      navigate({ to: "/login" });
    } catch (err) {
      toast.error("Registration Error", {
        description: err.message || "Failed to create account.",
      });
    }
  });

  return (
    <div className="gradient-hero min-h-screen px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <img
            src="/bit-logo.png"
            alt="BIT Logo"
            className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-soft"
          />
          <span className="font-display font-extrabold">BIT Hostel Portal</span>
        </Link>

        <div className="glass rounded-3xl p-6 shadow-elegant sm:p-9">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold">Student registration</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Step {step} of 2: {step === 1 ? "Account Credentials" : "Hostel Compatibility Questionnaire"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`h-2 w-8 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <span className={`h-2 w-8 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-6" noValidate>
            {step === 1 ? (
              <>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-5 sm:flex-row sm:items-center">
                  <div className="relative">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Profile preview"
                        className="size-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex size-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Camera className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold">Profile picture</p>
                    <p className="text-xs text-muted-foreground">
                      JPG or PNG, passport style, max 2 MB
                    </p>
                    <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      Choose file
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setPhoto(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name?.message}>
                    <Input
                      placeholder="Gowtham"
                      {...register("name", { required: "Name is required" })}
                    />
                  </Field>
                  <Field label="Register number" error={errors.regNo?.message}>
                    <Input
                      placeholder="7376242AD142"
                      {...register("regNo", {
                        required: "Register number is required",
                        minLength: { value: 8, message: "Enter a valid register number" },
                      })}
                    />
                  </Field>
                  <Field label="Department" error={errors.department?.message}>
                    <select
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      {...register("department", { required: "Select your department" })}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Year of study" error={errors.year?.message}>
                    <select
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      {...register("year", { required: "Select your year" })}
                    >
                      <option value="">Select year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Gender" error={errors.gender?.message}>
                    <select
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      {...register("gender", { required: "Select gender" })}
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </Field>
                  <Field label="Hostel preference" error={errors.hostelPreference?.message}>
                    <select
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      {...register("hostelPreference")}
                    >
                      <option value="">Select preference</option>
                      <option>AC · 2 sharing</option>
                      <option>AC · 3 sharing</option>
                      <option>Non-AC · 4 sharing</option>
                      <option>No preference</option>
                    </select>
                  </Field>
                  <Field label="College email" error={errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="name.dept@bitsathy.ac.in"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                      })}
                    />
                  </Field>
                  <Field label="Mobile number" error={errors.mobile?.message}>
                    <Input
                      inputMode="numeric"
                      placeholder="9843217650"
                      {...register("mobile", {
                        required: "Mobile number is required",
                        pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10 digit number" },
                      })}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Create password" error={errors.password?.message}>
                    <div className="relative">
                      <Input
                        type={show ? "text" : "password"}
                        className="pr-11"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 8, message: "Use at least 8 characters" },
                        })}
                      />
                      <button
                        type="button"
                        aria-label={show ? "Hide password" : "Show password"}
                        onClick={() => setShow((s) => !s)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      >
                        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-1.5 flex-1 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={cn(
                              "flex-1 rounded-full transition-colors",
                              i < score
                                ? score <= 1
                                  ? "bg-destructive"
                                  : score === 2
                                    ? "bg-warning"
                                    : "bg-success"
                                : "bg-muted",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{labels[score]}</span>
                    </div>
                  </Field>
                  <Field label="Confirm password" error={errors.confirm?.message}>
                    <Input
                      type={show ? "text" : "password"}
                      {...register("confirm", {
                        required: "Confirm your password",
                        validate: (v) => v === pw || "Passwords do not match",
                      })}
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button type="button" variant="hero" size="lg" onClick={handleNextStep}>
                    Next: Compatibility Questions &rarr;
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/login">Already registered? Login</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
                  <p className="text-sm font-semibold text-primary">Compatibility Questionnaire</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your answers will be displayed to other hostellers to help calculate roommate compatibility scores when applying for hostel rooms.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hometown / City">
                    <Input placeholder="E.g., Erode, Coimbatore, Salem" {...register("hometown")} />
                  </Field>
                  <Field label="Primary Language">
                    <Input placeholder="E.g., Tamil, English, Telugu" {...register("language")} />
                  </Field>
                  <Field label="Sleep Schedule">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("sleep")}>
                      <option>Before 10 PM</option>
                      <option>10 PM – 12 AM</option>
                      <option>After Midnight</option>
                    </select>
                  </Field>
                  <Field label="Wake-up Time">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("wake")}>
                      <option>Before 6 AM</option>
                      <option>6–8 AM</option>
                      <option>After 8 AM</option>
                    </select>
                  </Field>
                  <Field label="Cleanliness Standard">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("cleanliness")}>
                      <option>Very Clean & Organized</option>
                      <option>Moderately Clean</option>
                      <option>Flexible</option>
                    </select>
                  </Field>
                  <Field label="Food Preference">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("food")}>
                      <option>Vegetarian</option>
                      <option>Non-Veg</option>
                      <option>Vegan</option>
                    </select>
                  </Field>
                  <Field label="Personality Type">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("personality")}>
                      <option>Introvert</option>
                      <option>Extrovert</option>
                      <option>Ambivert</option>
                    </select>
                  </Field>
                  <Field label="Noise Tolerance">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("noise")}>
                      <option>Silent / Quiet</option>
                      <option>Moderate</option>
                      <option>Lively / Group Study</option>
                    </select>
                  </Field>
                  <Field label="Preferred Study Time">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("study")}>
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </Field>
                  <Field label="Visitors in Room">
                    <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("visitors")}>
                      <option>Yes</option>
                      <option>Occasionally</option>
                      <option>No</option>
                    </select>
                  </Field>
                  <Field label="Interests & Hobbies (comma separated)" className="sm:col-span-2">
                    <Input placeholder="Coding, Cricket, Gaming, Music, Photography" {...register("interests")} />
                  </Field>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    &larr; Back to Account Details
                  </Button>
                  <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />} Complete & Register
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
