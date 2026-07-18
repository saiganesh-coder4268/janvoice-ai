"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

export default function SetupMPPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set user role to 'mp' in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: "MP / Admin",
        email: email,
        role: "mp",
        createdAt: new Date(),
      });

      setStatus("Successfully created MP account! You can now log in at /mp/login");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="bg-card p-8 rounded-xl shadow-sm border border-border max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Setup MP Account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use this hidden page to create an MP user. You should remove this page in production.
        </p>
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create MP Account"}
          </Button>
          {status && (
            <p className={`text-sm mt-4 ${status.startsWith("Error") ? "text-red-500" : "text-green-500"}`}>
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
