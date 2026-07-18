import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { FileText, ChevronRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
};

export default function ProfileNavList() {
  const closeProfilePanel = useUIStore((state) => state.closeProfilePanel);

  const navItems: NavItem[] = [
    { icon: FileText, label: "My Complaints", href: "/my-complaints" },
  ];

  return (
    <div className="py-2 border-b border-border">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isExternal = item.href.startsWith("mailto:");
        
        return (
          <Link
            key={index}
            href={item.href}
            onClick={() => closeProfilePanel()}
            target={isExternal ? "_blank" : undefined}
            className="flex items-center justify-between px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span>{item.label}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="flex h-5 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              )}
              {!isExternal && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
