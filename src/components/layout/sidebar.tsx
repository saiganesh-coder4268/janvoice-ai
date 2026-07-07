import { 
  LayoutDashboard, 
  Map, 
  FileWarning, 
  Building2, 
  PieChart, 
  FileText, 
  BrainCircuit,
  Wallet,
  Users,
  Settings
} from "lucide-react";

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: FileWarning, label: "Complaints" },
    { icon: Building2, label: "Departments" },
    { icon: Map, label: "Heat Map" },
    { icon: FileText, label: "Projects" },
    { icon: PieChart, label: "Analytics" },
    { icon: FileText, label: "Reports" },
    { icon: BrainCircuit, label: "AI Insights" },
    { icon: Wallet, label: "Budget" },
    { icon: Users, label: "Officers" },
  ];

  return (
    <aside className="w-16 h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 shrink-0">
      <div className="w-10 h-10 bg-primary rounded flex items-center justify-center mb-8">
        <span className="text-primary-foreground font-bold text-xl">J</span>
      </div>
      <nav className="flex flex-col gap-4 flex-1 w-full items-center">
        {navItems.map((item, idx) => (
          <button 
            key={idx} 
            className="p-2 text-muted-foreground hover:text-primary hover:bg-sidebar-accent rounded-md transition-colors"
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-sidebar-border w-full flex justify-center">
        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-sidebar-accent rounded-md transition-colors mt-2" title="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}