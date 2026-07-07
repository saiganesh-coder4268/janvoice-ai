export function BottomStrip() {
  return (
    <footer className="h-12 bg-card border-t border-border flex items-center px-4 shrink-0 text-xs overflow-hidden">
      <div className="flex items-center gap-4 border-r border-border pr-4 h-full">
        <span className="text-muted-foreground font-medium uppercase tracking-widest">System Status</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full"></span>
          <span className="text-accent">All Systems Nominal</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6 px-4 flex-1 h-full">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Open Complaints:</span>
          <span className="text-foreground font-mono font-bold">1,245</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Officers Active:</span>
          <span className="text-foreground font-mono font-bold">84</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">AI Processing Rate:</span>
          <span className="text-foreground font-mono font-bold">1.2s</span>
        </div>
      </div>
    </footer>
  );
}