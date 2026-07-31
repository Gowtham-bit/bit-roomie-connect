import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Heart, RefreshCw, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { matches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roommates")({
  head: () => ({
    meta: [
      { title: "Roommate Compatibility Matchmaking · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Answer a lifestyle questionnaire and get ranked roommate matches with a compatibility score out of 100.",
      },
      { property: "og:title", content: "Roommate Compatibility Matchmaking · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Sleep schedule, cleanliness, study habits and personality scored into a single compatibility percentage.",
      },
    ],
  }),
  component: RoommatesPage,
});

const questions: Array<{ id: string; q: string; options: string[] }> = [
  { id: "sleep", q: "What time do you usually sleep?", options: ["Before 10 PM", "10 PM – 12 AM", "After midnight"] },
  { id: "wake", q: "What time do you wake up?", options: ["Before 5:30 AM", "5:30 – 7 AM", "After 7 AM"] },
  { id: "study", q: "When do you study best?", options: ["Early morning", "Afternoon", "Late night"] },
  { id: "clean", q: "How tidy do you keep the room?", options: ["Spotless always", "Tidy most days", "Relaxed about it"] },
  { id: "smoke", q: "Do you smoke?", options: ["No", "Occasionally", "Yes"] },
  { id: "drink", q: "Do you drink?", options: ["No", "Occasionally", "Yes"] },
  { id: "music", q: "How do you listen to music?", options: ["Headphones only", "Low speaker volume", "Loud speakers"] },
  { id: "gaming", q: "How often do you game?", options: ["Rarely", "Weekends", "Daily"] },
  { id: "sports", q: "Do you play sports?", options: ["Daily", "Weekends", "Rarely"] },
  { id: "food", q: "Food habit", options: ["Vegetarian", "Non-vegetarian", "Eggetarian"] },
  { id: "language", q: "Preferred language at home", options: ["Tamil", "English", "Telugu / Malayalam", "Hindi"] },
  { id: "hometown", q: "Hometown region", options: ["Kongu belt", "Chennai / North TN", "South TN", "Outside TN"] },
  { id: "dept", q: "Prefer a roommate from", options: ["My department", "Any department", "Different department"] },
  { id: "year", q: "Prefer a roommate from", options: ["My year", "Senior", "Junior", "No preference"] },
  { id: "temp", q: "Room temperature preference", options: ["Cool", "Moderate", "Warm"] },
  { id: "ac", q: "AC preference", options: ["AC room", "Non-AC room", "No preference"] },
  { id: "visitors", q: "How often do friends visit your room?", options: ["Rarely", "Sometimes", "Very often"] },
  { id: "lights", q: "Do you sleep with lights on?", options: ["Lights off", "Night lamp", "Lights on"] },
  { id: "noise", q: "Preferred noise level", options: ["Silent", "Moderate", "Lively"] },
  { id: "personality", q: "How would you describe yourself?", options: ["Introvert", "Ambivert", "Extrovert"] },
  { id: "group", q: "Do you like group study?", options: ["Yes, often", "Sometimes", "Prefer studying alone"] },
  { id: "religion", q: "Religious practice in room", options: ["Daily prayer", "Occasional", "Not applicable"] },
  { id: "weekend", q: "Typical weekend", options: ["Go home", "Stay in hostel", "Outings with friends"] },
  { id: "share", q: "Sharing personal items", options: ["Comfortable", "Ask first", "Prefer not to"] },
  { id: "call", q: "Late night phone calls", options: ["Never", "Occasionally", "Frequently"] },
];

function RoommatesPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);

  const current = questions[step]!;
  const progress = Math.round(((step + (answers[current.id] ? 1 : 0)) / questions.length) * 100);
  const answered = Object.keys(answers).length;

  const results = useMemo(
    () => matches.filter((m) => !rejected.includes(m.matchId)).slice(0, 9),
    [rejected],
  );

  const select = (value: string) => {
    setAnswers((a) => ({ ...a, [current.id]: value }));
    if (step < questions.length - 1) setTimeout(() => setStep((s) => s + 1), 160);
  };

  return (
    <AppShell
      title="Roommate compatibility"
      breadcrumb={["Roommates"]}
      actions={
        done ? (
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
          >
            <RefreshCw className="size-4" /> Retake questionnaire
          </Button>
        ) : undefined
      }
    >
      {!done ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border bg-card p-6 shadow-soft sm:p-9">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="secondary" className="rounded-full">
                Question {step + 1} of {questions.length}
              </Badge>
              <span className="text-muted-foreground">{answered} answered</span>
            </div>
            <Progress value={progress} className="mt-4" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <h2 className="text-2xl font-extrabold">{current.q}</h2>
                <div className="mt-6 grid gap-3">
                  {current.options.map((o) => {
                    const active = answers[current.id] === o;
                    return (
                      <button
                        key={o}
                        onClick={() => select(o)}
                        aria-pressed={active}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all",
                          active
                            ? "border-primary bg-primary/10 text-primary shadow-soft"
                            : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
                        )}
                      >
                        {o}
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border",
                            active && "border-primary bg-primary text-primary-foreground",
                          )}
                        >
                          {active && <Check className="size-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              {step === questions.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={() => {
                    setDone(true);
                    toast.success("Compatibility profile saved", {
                      description: "We ranked 100 hostellers against your answers.",
                    });
                  }}
                >
                  <Sparkles className="size-4" /> See my matches
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setStep((s) => s + 1)}>
                  Skip <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-primary flex flex-wrap items-center justify-between gap-6 rounded-3xl p-8 text-primary-foreground shadow-elegant"
          >
            <div>
              <p className="text-sm opacity-90">Your top compatibility score</p>
              <p className="font-display text-5xl font-extrabold">
                {results[0]?.compatibility ?? 0}%
              </p>
              <p className="mt-1 text-sm opacity-90">
                with {results[0]?.name} · {results[0]?.dept} · Year {results[0]?.year}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <Kpi label="Candidates scored" value="100" />
              <Kpi label="Above 80%" value={String(matches.filter((m) => m.compatibility >= 80).length)} />
              <Kpi label="Requests sent" value={String(requested.length)} />
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {results.map((m, i) => (
                <motion.article
                  key={m.matchId}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
                >
                  <div className="flex items-start gap-4">
                    <img src={m.avatar} alt={m.name} className="size-14 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.dept} · Year {m.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.hometown} · {m.traits.food} · {m.traits.personality}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-extrabold text-primary">
                        {m.compatibility}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">match</p>
                    </div>
                  </div>

                  <Progress value={m.compatibility} className="mt-4" />

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {m.interests.map((it) => (
                      <Badge key={it} variant="outline" className="rounded-full text-[11px]">
                        {it}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/requests">Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="hero"
                      disabled={requested.includes(m.matchId)}
                      onClick={() => {
                        setRequested((r) => [...r, m.matchId]);
                        toast.success(`Request sent to ${m.name.split(" ")[0]}`);
                      }}
                    >
                      <Heart className="size-3.5" />
                      {requested.includes(m.matchId) ? "Sent" : "Request"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRejected((r) => [...r, m.matchId]);
                        toast("Match dismissed", { description: `${m.name} removed from your list.` });
                      }}
                    >
                      <X className="size-3.5" /> Skip
                    </Button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] opacity-90">{label}</p>
    </div>
  );
}
