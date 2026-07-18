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
      before: "/before-pothole.jpg",
      after: "/after-pothole.jpg",
      ward: "2",
      confidence: 94,
    },
    {
      id: "2",
      title: "Garbage cleared at Kondapeta Market",
      before: "/before-garbage.jpg",
      after: "/after-garbage.jpg",
      ward: "1",
      confidence: 88,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <TopBar tabs={landingTabs} />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Resolution Gallery</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-verified civic improvements across India . See the impact of your reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {verifiedResolutions.map((res) => (
            <div key={res.id} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{res.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Ward {res.ward}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" />

                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-muted p-1">
                <div className="relative aspect-[4/3] bg-secondary rounded-bl-xl overflow-hidden">
                  <img src={res.before} alt="Before" className="object-cover w-full h-full" />
                  <div className="absolute top-2 left-2 bg-black/60 text-primary-foreground text-xs font-bold px-2 py-1 rounded">BEFORE</div>
                </div>
                <div className="relative aspect-[4/3] bg-secondary rounded-br-xl overflow-hidden">
                  <img src={res.after} alt="After" className="object-cover w-full h-full" />
                  <div className="absolute top-2 left-2 bg-black/60 text-primary-foreground text-xs font-bold px-2 py-1 rounded">AFTER</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
