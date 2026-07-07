"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Mic, Loader2 } from "lucide-react";

export function CitizenComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submit
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Issue reported successfully!");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Describe the Issue</Label>
        <textarea 
          id="description" 
          placeholder="E.g., Large pothole causing accidents..." 
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          required 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" className="flex flex-col h-auto py-4 gap-2">
          <Camera className="w-5 h-5" />
          <span className="text-xs">Photo</span>
        </Button>
        <Button type="button" variant="outline" className="flex flex-col h-auto py-4 gap-2">
          <Mic className="w-5 h-5 text-destructive" />
          <span className="text-xs">Record Voice</span>
        </Button>
        <Button type="button" variant="outline" className="flex flex-col h-auto py-4 gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-xs">GPS Auto-Locate</span>
        </Button>
      </div>
      
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Submit Issue"
        )}
      </Button>
    </form>
  );
}