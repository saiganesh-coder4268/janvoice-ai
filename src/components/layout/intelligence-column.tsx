import { AlertTriangle, BrainCircuit } from "lucide-react";

export function IntelligenceColumn() {
  return (
    <aside className="w-[320px] bg-card border-l border-border flex flex-col h-full shrink-0">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Intelligence</h2>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          <span className="text-xs text-accent">Active</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Urgent Cases */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-destructive" /> 
            Urgent Cases (2)
          </h3>
          <div className="bg-background border border-destructive/30 rounded p-2 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-destructive font-bold">#C-8891</span>
              <span className="text-muted-foreground">2m ago</span>
            </div>
            <p className="text-foreground">Water main burst flooding Main St.</p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
            <BrainCircuit className="w-3 h-3 text-primary" /> 
            AI Recommendations
          </h3>
          <div className="bg-background border border-border rounded p-2 text-xs">
            <span className="text-primary font-bold mb-1 block">Cluster Detected</span>
            <p className="text-foreground">5 pothole complaints in Ward 4. Recommend prioritizing road repair squad deployment.</p>
            <div className="mt-2 flex gap-2">
              <button className="bg-primary/20 text-primary px-2 py-1 rounded-sm hover:bg-primary/30">Review</button>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}