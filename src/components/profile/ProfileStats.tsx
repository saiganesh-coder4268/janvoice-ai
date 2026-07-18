import Link from "next/link";

export default function ProfileStats() {
  // TODO: wire to backend/API for real user statistics
  return (
    <div className="grid grid-cols-3 gap-2 p-6 border-b border-border">
      <Link href="/my-complaints?status=reported" className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
        <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">12</span>
        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1 group-hover:text-foreground transition-colors">Reported</span>
      </Link>
      <Link href="/my-complaints?status=resolved" className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
        <span className="text-xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">4</span>
        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1 group-hover:text-foreground transition-colors">Resolved</span>
      </Link>
      <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-secondary/50 cursor-help" title="Upvotes you've received on your reported issues">
        <span className="text-xl font-bold text-foreground">38</span>
        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Upvotes</span>
      </div>
    </div>
  );
}
