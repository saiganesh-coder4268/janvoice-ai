import TopBar from "@/components/layout/TopBar";

const mpTabs = [
  { name: "Dashboard", href: "/mp" },
  { name: "Map", href: "/mp/map" },
  { name: "Issues", href: "/mp/issues" },
  { name: "Insights", href: "/mp/insights" },
  { name: "Reports", href: "/mp/reports" },
];

export default function MPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <TopBar tabs={mpTabs} />
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
