import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Building2, Eye, EyeOff, GraduationCap, Loader2, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Sign in to the BIT hostel portal as a student, warden or admin using your register number.",
      },
      { property: "og:title", content: "Login · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Secure role based sign in for BIT hostel students, wardens and administrators.",
      },
    ],
  }),
  component: LoginPage,
});

type Form = { regNo: string; password: string; remember: boolean };

const roles = [
  { key: "student", label: "Student", icon: GraduationCap, hint: "Register number" },
  { key: "warden", label: "Warden", icon: Shield, hint: "Staff ID" },
  { key: "admin", label: "Admin", icon: UserCog, hint: "Admin ID" },
] as const;

function LoginPage() {
  const [role, setRole] = useState<(typeof roles)[number]["key"]>("student");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ defaultValues: { regNo: "", password: "", remember: true } });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success(`Signed in as ${role}`, { description: "Welcome back to the BIT hostel portal." });
    navigate({ to: role === "admin" ? "/admin" : role === "warden" ? "/warden" : "/dashboard" });
  });

  const active = roles.find((r) => r.key === role)!;

  return (
    <div className="gradient-hero relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-14">
      <div className="pointer-events-none absolute -top-32 -left-20 size-[26rem] animate-float rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] animate-float rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass relative w-full max-w-md rounded-3xl p-7 shadow-elegant sm:p-9"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-primary flex size-10 items-center justify-center rounded-xl text-primary-foreground">
            <Building2 className="size-5" />
          </span>
          <span className="font-display font-extrabold">BIT Hostel Portal</span>
        </Link>

        <h1 className="mt-7 text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose your role and sign in to continue.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-muted/70 p-1.5">
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              aria-pressed={role === r.key}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all",
                role === r.key
                  ? "bg-card text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <r.icon className="size-4" />
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="regNo">{active.hint}</Label>
            <Input
              id="regNo"
              placeholder={role === "student" ? "7376242AD142" : "BIT-STAFF-1042"}
              aria-invalid={!!errors.regNo}
              {...register("regNo", {
                required: "This field is required",
                minLength: { value: 6, message: "Enter at least 6 characters" },
              })}
            />
            {errors.regNo && <p className="text-xs text-destructive">{errors.regNo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="pr-11"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <Checkbox defaultChecked {...register("remember")} /> Remember me
            </label>
            <button type="button" className="font-medium text-primary hover:underline">
              Forgot password?
            </button>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Login as {active.label}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to the hostel portal?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
