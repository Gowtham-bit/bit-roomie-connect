import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { matches, } from "@/lib/mock-data";
export const Route = createFileRoute("/requests")({
    head: () => ({
        meta: [
            { title: "Roommate Requests · BIT Hostel Portal" },
            { name: "description", content: "Manage incoming and outgoing roommate requests and start a chat with your match." },
            { property: "og:title", content: "Roommate Requests · BIT Hostel Portal" },
            { property: "og:description", content: "Manage incoming and outgoing roommate requests and start a chat with your match." },
        ],
    }),
    component: Page,
});
function Page() {
    const incoming = matches.slice(0, 4);
    const outgoing = matches.slice(4, 8);
    return (<AppShell title="Roommate requests" breadcrumb={["Requests"]}>
      <div className="grid gap-5 lg:grid-cols-2">
        {[["Incoming requests", incoming, true], ["Outgoing requests", outgoing, false]].map(([label, list, inc]) => (<section key={label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="text-lg font-bold">{label}</h2>
            <ul className="mt-4 space-y-3">
              {list.map((m) => (<li key={m.matchId} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
                  <img src={m.avatar} alt="" className="size-11 rounded-xl object-cover"/>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dept} · Year {m.year}</p>
                  </div>
                  <Badge variant="secondary">{m.compatibility}%</Badge>
                  {inc ? (<div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => toast.success(`Accepted ${m.name}`)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => toast("Request rejected")}>Reject</Button>
                    </div>) : (<Badge variant="outline">Awaiting reply</Badge>)}
                  <Button size="sm" variant="soft" onClick={() => toast("Chat opened", { description: "Messaging is available after both students accept." })}>Chat</Button>
                </li>))}
            </ul>
          </section>))}
      </div>
    </AppShell>);
}
