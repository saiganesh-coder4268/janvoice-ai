import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

import { AnimatedSections } from "@/components/home/AnimatedSections";

const landingTabs = [
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Features", href: "/#features" },
  { name: "Gallery", href: "/gallery" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <TopBar tabs={landingTabs} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 bg-white border-b border-slate-200">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900">
                From Citizen Voices to <br className="hidden sm:block" />
                <span className="text-blue-600">Smarter Development</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-slate-600 md:text-xl leading-relaxed">
                JanVoice transforms citizen reports into structured, prioritized civic intelligence—helping governments identify, understand, and resolve community issues faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/citizen">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                    Report an Issue
                  </Button>
                </Link>
                <Link href="/mp">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    MP / Authority Dashboard
                  </Button>
                </Link>
                <Link href="/map">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white w-full sm:w-auto shadow-md border-0 transition-all hover:scale-105 duration-200 flex items-center justify-center gap-2">
                    <Map className="h-5 w-5" />
                    Public Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <AnimatedSections />
      </main>

      <footer className="w-full py-6 bg-slate-900 text-slate-400 text-center">
        <p className="text-sm">Built for India. Powered by AI AI.</p>
      </footer>
    </div>
  );
}
