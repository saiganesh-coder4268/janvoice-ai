import TopBar from "@/components/layout/TopBar";

const citizenTabs = [
  { name: "Public Complaints", href: "/citizen" },
  { name: "Report Issue", href: "/citizen/new" },
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <TopBar tabs={citizenTabs} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
