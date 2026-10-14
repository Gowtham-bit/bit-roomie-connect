import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNotifications, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Read hostel, mess, academic and payment announcements from wardens and administrators.",
      },
      { property: "og:title", content: "Notifications · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Read hostel, mess, academic and payment announcements from wardens and administrators.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const student = user || {};

  const { data: notificationData = [] } = useNotifications({ regNo: student.regNo });
  const list = Array.isArray(notificationData) ? notificationData : [];
  return (
    <AppShell
      title="Notifications"
      breadcrumb={["Notifications"]}
      actions={
        <Button variant="outline" onClick={() => toast.success("All notifications marked as read")}>
          Mark all as read
        </Button>
      }
    >
      <div className="space-y-3">
        {list.map((n) => (
          <article
            key={n.id}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-soft ${!n.read ? "border-primary/40" : ""}`}
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{
                  background: n.read ? "var(--color-muted-foreground)" : "var(--color-primary)",
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <Badge variant="outline" className="text-[10px] sm:text-xs">{n.category}</Badge>
                  {!n.read && <Badge variant="secondary" className="text-[10px] sm:text-xs">Unread</Badge>}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.date}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2 sm:pt-0 border-t sm:border-t-0">
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => toast("Marked as read")}>
                Mark read
              </Button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
