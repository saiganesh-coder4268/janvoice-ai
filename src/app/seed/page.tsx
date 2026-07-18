"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/lib/firebase/seed";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedDatabase();
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Seeding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
        <p className="text-muted-foreground mb-8">This will populate Firestore with dummy demo data for JanVoice AI .</p>

        <Button
          onClick={handleSeed}
          disabled={loading || success}
          className="w-full"
        >
          {loading ? "Seeding..." : success ? "Seeding Complete!" : "Seed Database"}
        </Button>
      </div>
    </div>
  );
}
