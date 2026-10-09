import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, CheckCircle2, User, Moon, Sun, Sparkle, Utensils, Headphones, BookOpen, Users, MapPin, Globe, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CompatibilityModal({ student, currentStudent, isOpen, onClose, onRequest, isRequested }) {
  if (!isOpen || !student) return null;

  const traits = student.traits || {};
  const currentTraits = currentStudent?.traits || {};

  const matches = [
    {
      label: "Sleep Schedule",
      icon: Moon,
      value: traits.sleep || "10 PM – 12 AM",
      myValue: currentTraits.sleep || "10 PM – 12 AM",
      isMatch: traits.sleep === currentTraits.sleep,
    },
    {
      label: "Wake Up Time",
      icon: Sun,
      value: traits.wake || "6–8 AM",
      myValue: currentTraits.wake || "6–8 AM",
      isMatch: traits.wake === currentTraits.wake,
    },
    {
      label: "Cleanliness Level",
      icon: Sparkle,
      value: String(traits.cleanliness || "Very Clean"),
      myValue: String(currentTraits.cleanliness || "Very Clean"),
      isMatch: String(traits.cleanliness) === String(currentTraits.cleanliness),
    },
    {
      label: "Food Preference",
      icon: Utensils,
      value: traits.food || "Non-Veg",
      myValue: currentTraits.food || "Non-Veg",
      isMatch: traits.food === currentTraits.food,
    },
    {
      label: "Personality",
      icon: User,
      value: traits.personality || "Ambivert",
      myValue: currentTraits.personality || "Ambivert",
      isMatch: traits.personality === currentTraits.personality,
    },
    {
      label: "Noise Tolerance",
      icon: Headphones,
      value: traits.noise || "Moderate",
      myValue: currentTraits.noise || "Moderate",
      isMatch: traits.noise === currentTraits.noise,
    },
    {
      label: "Study Time",
      icon: BookOpen,
      value: traits.study || "Night",
      myValue: currentTraits.study || "Night",
      isMatch: traits.study === currentTraits.study,
    },
    {
      label: "Visitors in Room",
      icon: Users,
      value: traits.visitors || "Occasionally",
      myValue: currentTraits.visitors || "Occasionally",
      isMatch: traits.visitors === currentTraits.visitors,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-card p-6 shadow-2xl sm:p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <img
                src={student.avatar || "https://i.pravatar.cc/160"}
                alt={student.name}
                className="size-16 rounded-2xl object-cover ring-2 ring-primary/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-display">{student.name}</h2>
                  <Badge variant="hero" className="rounded-full text-xs">
                    {student.compatibility || 85}% Match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {student.regNo} · {student.dept || student.department} (Year {student.year || 1})
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-primary" /> {student.hometown || "Campus"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="size-3 text-primary" /> {student.language || "Tamil"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Banner */}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Lifestyle & Compatibility Breakdown</p>
                <p className="text-xs text-muted-foreground">
                  Comparing {student.name.split(" ")[0]}'s preferences against your profile answers
                </p>
              </div>
            </div>
            {onRequest && (
              <Button
                variant="hero"
                size="sm"
                disabled={isRequested}
                onClick={() => onRequest(student)}
              >
                <Heart className="mr-1.5 size-4" />
                {isRequested ? "Request Sent" : "Select Roommate"}
              </Button>
            )}
          </div>

          {/* Compatibility Answers Grid */}
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Compatibility Questionnaire Responses
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {matches.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className={`rounded-2xl border p-3.5 transition-all ${
                      m.isMatch
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Icon className="size-3.5 text-primary" /> {m.label}
                      </span>
                      {m.isMatch && (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-[10px] py-0">
                          <CheckCircle2 className="mr-1 size-3" /> Match
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-foreground">{m.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interests & Hobbies */}
          <div className="mt-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Interests & Hobbies
            </h3>
            <div className="flex flex-wrap gap-2">
              {(student.interests && student.interests.length > 0 ? student.interests : ["Coding", "Cricket", "Gaming"]).map((item) => {
                const isShared = (currentStudent?.interests || []).includes(item);
                return (
                  <Badge
                    key={item}
                    variant={isShared ? "hero" : "secondary"}
                    className="px-3 py-1 text-xs"
                  >
                    {isShared && "★ "}
                    {item}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Preferred Roommate Qualities */}
          {traits.qualities && traits.qualities.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Desired Roommate Qualities
              </h3>
              <div className="flex flex-wrap gap-2">
                {traits.qualities.map((q) => (
                  <Badge key={q} variant="outline" className="rounded-full text-xs">
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
