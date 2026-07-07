import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

const landingTabs = [
  { name: "About", href: "/#about" },
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
                JanVoice AI converts scattered citizen complaints into structured, AI-prioritized development intelligence for Visakhapatnam.
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

        {/* Features / About Placeholder */}
        <section id="about" className="w-full py-16 md:py-24 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">1</div>
                <h3 className="font-bold text-lg mb-2">Citizens Report</h3>
                <p className="text-slate-600 text-sm">Submit text, voice, or photo complaints. GPS automatically tags the exact Visakhapatnam ward.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">2</div>
                <h3 className="font-bold text-lg mb-2">AI Analyzes</h3>
                <p className="text-slate-600 text-sm">Gemini processes the issue, checks for duplicates, and calculates a priority score based on ward population and infrastructure.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-4">3</div>
                <h3 className="font-bold text-lg mb-2">Authorities Resolve</h3>
                <p className="text-slate-600 text-sm">MPs and authorities view data-driven priorities, resolve issues, and verify with before/after photos.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full py-6 bg-slate-900 text-slate-400 text-center">
        <p className="text-sm">Built for Visakhapatnam. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
}
