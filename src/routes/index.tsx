import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BedDouble,
  Bell,
  CalendarCheck,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { stats } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BIT Hostel Allocation & Roommate Matchmaking Portal" },
      {
        name: "description",
        content:
          "Apply for BIT hostel rooms, track allocation and find a compatible roommate with lifestyle-based matchmaking for Bannari Amman Institute of Technology students.",
      },
      { property: "og:title", content: "BIT Hostel Allocation & Roommate Matchmaking Portal" },
      {
        property: "og:description",
        content:
          "Smart room allocation, roommate compatibility scoring, complaints, attendance and fees — one portal for BIT hostellers.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BedDouble,
    title: "Smart Room Allocation",
    body: "Rule-based allocation across 10 blocks with year, department and preference weighting.",
  },
  {
    icon: Heart,
    title: "Roommate Matchmaking",
    body: "A 25-point lifestyle questionnaire scores every possible pairing and ranks your best matches.",
  },
  {
    icon: Wrench,
    title: "Complaint Management",
    body: "Raise electricity, water, internet or furniture issues and follow a live resolution timeline.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    body: "Monthly hostel attendance calendar with present, absent and leave breakdown plus reports.",
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "Warden announcements, mess updates and payment reminders in one filterable inbox.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    body: "Occupancy analytics, allocation control, matching approvals and exportable reports.",
  },
];

const testimonials = [
  {
    name: "Keerthana Iyer",
    dept: "CSE · 3rd Year",
    text: "I got matched with someone who studies at the same hours as me. First semester without a single argument about lights.",
    img: "https://i.pravatar.cc/120?img=45",
  },
  {
    name: "Vignesh Balaji",
    dept: "MECH · 2nd Year",
    text: "Applying for the hostel used to mean three counters and a queue. Now it is a form and a status tracker.",
    img: "https://i.pravatar.cc/120?img=15",
  },
  {
    name: "Divya Natarajan",
    dept: "AIDS · 4th Year",
    text: "The complaint timeline is the best part. I can actually see when the electrician was assigned.",
    img: "https://i.pravatar.cc/120?img=32",
  },
];

const faqs = [
  [
    "Who can apply for hostel accommodation?",
    "All full-time BIT students can apply. First year students are allocated on a priority basis, followed by seniors based on distance from campus and application date.",
  ],
  [
    "How is the compatibility score calculated?",
    "Your questionnaire answers are weighted across sleep schedule, cleanliness, study habits, food, noise tolerance and personality. Each candidate pairing produces a score out of 100.",
  ],
  [
    "Can I change my room after allocation?",
    "Yes. Submit a room change request with a reason and supporting proof. The warden reviews it and you can track the status from your dashboard.",
  ],
  [
    "When are hostel fees due?",
    "Fees are collected in two instalments per academic year. Reminders appear in your notifications and receipts are downloadable from the payments page.",
  ],
  [
    "Is my personal information visible to other students?",
    "Only your name, department, year and interests appear on match cards. Contact details are shared after both students accept the roommate request.",
  ],
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden px-5 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 animate-float rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute top-24 -right-24 size-96 animate-float rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <Sparkles className="mr-1.5 size-3.5" /> Bannari Amman Institute of Technology
            </Badge>
            <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-6xl">
              Hostel rooms allocated fairly.
              <span className="text-gradient block">Roommates matched smartly.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              One portal for BIT hostellers — apply for a room, track allocation, raise complaints,
              pay fees, and find a roommate whose routine actually fits yours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/register">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login to Portal</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[5, 12, 32, 45].map((n) => (
                  <img
                    key={n}
                    src={`https://i.pravatar.cc/80?img=${n}`}
                    alt=""
                    className="size-8 rounded-full border-2 border-card object-cover"
                  />
                ))}
              </div>
              <span>
                <strong className="text-foreground">500+</strong> students already allocated this
                academic year
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <Card className="glass rounded-3xl p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Your best match</p>
                  <p className="font-display text-lg font-bold">Karthik Venkatesh</p>
                  <p className="text-xs text-muted-foreground">AIDS · 3rd Year · Erode</p>
                </div>
                <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-display text-xl font-extrabold text-primary">92%</span>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Sleep schedule", 96],
                  ["Cleanliness", 88],
                  ["Study routine", 93],
                  ["Noise tolerance", 84],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="gradient-primary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-muted/60 p-3 text-center text-xs">
                <div>
                  <p className="font-display text-lg font-bold">Kaveri 312</p>
                  <p className="text-muted-foreground">Allocated room</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-accent">Confirmed</p>
                  <p className="text-muted-foreground">Hostel status</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Everything in one place"
            title="Built for students, wardens and admins"
            sub="Six connected modules replace paperwork, WhatsApp groups and notice boards."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Card className="group h-full rounded-2xl border-border/70 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elegant">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border bg-card p-10 shadow-soft">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              [stats.students + "+", "Students Registered", Users],
              [stats.rooms + "+", "Hostel Rooms", BedDouble],
              [stats.boys, "Boys Hostel Blocks", ShieldCheck],
              [stats.girls, "Girls Hostel Blocks", ShieldCheck],
            ].map(([value, label, Icon]) => {
              const I = Icon as typeof Users;
              return (
                <motion.div
                  key={label as string}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <I className="mx-auto size-6 text-primary" />
                  <p className="font-display mt-3 text-4xl font-extrabold">{value as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label as string}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Student voices"
            title="What hostellers say"
            sub="Feedback collected from residents across Kaveri, Nila and Bhavani blocks."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Card className="h-full rounded-2xl p-6 shadow-soft">
                  <Quote className="size-7 text-primary/30" />
                  <p className="mt-3 text-sm leading-relaxed">{t.text}</p>
                  <div className="mt-5 flex items-center gap-3 border-t pt-4">
                    <img src={t.img} alt={t.name} className="size-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.dept}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-warning">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <Accordion type="single" collapsible className="mt-8 space-y-3">
            {faqs.map(([q, a], i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border bg-card px-5 shadow-soft"
              >
                <AccordionTrigger className="text-left text-sm font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="gradient-primary relative mx-auto max-w-6xl overflow-hidden rounded-3xl p-12 text-center text-primary-foreground shadow-elegant">
          <ClipboardList className="mx-auto size-9 opacity-80" />
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Hostel applications for 2026–27 are open
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">
            Complete the compatibility questionnaire early — matches are ranked before allocation
            closes.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="glass">
              <Link to="/apply">Apply for Hostel</Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link to="/roommates">Find a Roommate</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{sub}</p>}
    </div>
  );
}
