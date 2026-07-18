"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function MPLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
      // Let AuthContext handle user state, we can redirect
      // It might take a moment for AuthContext to fetch the user role, 
      // but the layout will protect routes anyway.
      router.push("/mp");
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl border border-border max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">MP / Admin Portal</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Sign in with your official credentials to access the civic dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="mp@vizag.gov.in"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-primary-foreground rounded-xl font-semibold text-base transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
