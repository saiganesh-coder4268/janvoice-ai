import TopBar from "@/components/layout/TopBar";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

const landingTabs = [
  { name: "About", href: "/#about" },
  { name: "Features", href: "/#features" },
  { name: "Gallery", href: "/gallery" },
];

export default function GalleryPage() {
  const verifiedResolutions = [
    {
      id: "1",
      title: "Pothole on Madhurawada Main Road",
      before: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400&h=300",
      after: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=400&h=300", // using placeholder images
      ward: "2",
      confidence: 94,
    },
    {
      id: "2",
      title: "Garbage cleared at Kondapeta Market",
      before: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400&h=300",
      after: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400&h=300",
      ward: "1",
      confidence: 88,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <TopBar tabs={landingTabs} />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Resolution Gallery</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            AI-verified civic improvements across Visakhapatnam. See the impact of your reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {verifiedResolutions.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{res.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Ward {res.ward}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {res.confidence}% AI Match
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1">
                <div className="relative aspect-[4/3] bg-slate-200 rounded-bl-xl overflow-hidden">
                  <img src={res.before} alt="Before" className="object-cover w-full h-full" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</div>
                </div>
                <div className="relative aspect-[4/3] bg-slate-200 rounded-br-xl overflow-hidden">
                  <img src={res.after} alt="After" className="object-cover w-full h-full" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">AFTER</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
