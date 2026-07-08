"use client";

import { motion } from "framer-motion";
import {
  Smartphone, BrainCircuit, ArrowRight,
  Wrench, CheckCircle, Globe,
  Map as MapIcon, ShieldAlert, BarChart3,
  LayoutDashboard, ImageIcon
} from "lucide-react";

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

// --- Interactive Before/After Slider ---
function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: ReactMouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: ReactTouchEvent) => handleMove(e.touches[0].clientX);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-80 relative rounded-2xl overflow-hidden cursor-ew-resize shadow-lg select-none group"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0 bg-emerald-100">
        <img 
          src="/after-pothole.jpg" 
          alt="After" 
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full z-10 shadow-md border border-emerald-200">
          <span className="text-emerald-700 font-bold uppercase tracking-widest text-xs">After</span>
        </div>
      </div>

      {/* Before Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 bg-slate-300 pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src="/before-pothole.jpg" 
          alt="Before" 
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full z-10 shadow-md border border-slate-200">
          <span className="text-slate-600 font-bold uppercase tracking-widest text-xs">Before</span>
        </div>
      </div>

      {/* Slider Line & Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-slate-100 flex items-center justify-center transition-transform group-hover:scale-110">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-slate-300 rounded-full"></div>
            <div className="w-0.5 h-3 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Timeline Data ---
const timelineSteps = [
  {
    icon: Smartphone,
    title: "Report",
    description: "Citizen reports an issue via text, voice, or photo.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: BrainCircuit,
    title: "Analyze",
    description: "AI categorizes, summarizes, and prioritizes the complaint.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: ArrowRight,
    title: "Assign",
    description: "Automatically sent to the correct municipal department.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Wrench,
    title: "Resolve",
    description: "Issue is fixed by the assigned workforce.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: CheckCircle,
    title: "Verify",
    description: "Before & After photos are verified for completion.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: Globe,
    title: "Publish",
    description: "Citizens see transparent progress and analytics.",
    color: "bg-indigo-100 text-indigo-600",
  },
];

// --- Showcase Data ---
const showcaseSlides = [
  {
    title: "Smart Complaint Mapping",
    description: "Every report appears on a live city map, allowing authorities to instantly identify clusters and emerging problems.",
    icon: MapIcon,
    mockup: (
      <div className="w-full h-80 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-200 opacity-20" style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        <div className="relative flex flex-col items-center">
          <MapIcon className="w-20 h-20 text-blue-300 mb-6 drop-shadow-md" />
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-lg animate-pulse"></div>
            <div className="w-5 h-5 rounded-full bg-orange-500 shadow-lg animate-pulse delay-75"></div>
            <div className="w-5 h-5 rounded-full bg-blue-500 shadow-lg animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Intelligent Prioritization",
    description: "Severity, population density, public votes, and proximity to schools or hospitals determine which issues need immediate attention.",
    icon: ShieldAlert,
    mockup: (
      <div className="w-full h-80 bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col gap-5 shadow-inner">
        {[100, 75, 45].map((score, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col gap-3 w-2/3">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-2.5 bg-slate-100 rounded w-2/3"></div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${score > 80 ? 'bg-red-100 text-red-600' : score > 50 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
              Score: {score}
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    title: "Analytics Dashboard",
    description: "Monitor trends, department performance, ward statistics, and resolution efficiency in real time.",
    icon: BarChart3,
    mockup: (
      <div className="w-full h-80 bg-slate-900 rounded-2xl border border-slate-800 p-8 flex items-end justify-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-800/30" style={{ backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)", backgroundSize: "100% 40px" }}></div>
        {[40, 70, 45, 90, 60].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="w-12 bg-blue-500 rounded-t-lg relative z-10"
            style={{
              background: "linear-gradient(180deg, #3b82f6 0%, #1e3a8a 100%)"
            }}
          ></motion.div>
        ))}
      </div>
    )
  },
  {
    title: "Authority Workspace",
    description: "Officials receive actionable insights instead of thousands of scattered complaints.",
    icon: LayoutDashboard,
    mockup: (
      <div className="w-full h-80 bg-white rounded-2xl border border-slate-200 shadow-lg flex overflow-hidden">
        <div className="w-1/4 bg-slate-50 border-r border-slate-100 p-5 flex flex-col gap-4">
          <div className="w-full h-5 bg-slate-200 rounded"></div>
          <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
          <div className="w-full h-4 bg-slate-200 rounded mt-6"></div>
          <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-5 bg-slate-50">
          <div className="flex gap-5">
            <div className="flex-1 h-24 bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="w-1/2 h-3 bg-blue-200 rounded mb-3"></div>
              <div className="w-3/4 h-5 bg-blue-300 rounded"></div>
            </div>
            <div className="flex-1 h-24 bg-emerald-50 rounded-xl border border-emerald-100 p-4">
              <div className="w-1/2 h-3 bg-emerald-200 rounded mb-3"></div>
              <div className="w-3/4 h-5 bg-emerald-300 rounded"></div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-100 p-5 flex flex-col gap-4">
            <div className="w-full h-4 bg-slate-100 rounded"></div>
            <div className="w-full h-4 bg-slate-100 rounded"></div>
            <div className="w-2/3 h-4 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Resolution Verification",
    description: "AI helps verify completed work, creating transparent evidence of public service.",
    icon: ImageIcon,
    mockup: <BeforeAfterSlider />
  }
];

export function AnimatedSections() {
  return (
    <>
      {/* Animated Timeline */}
      <section id="how-it-works" className="w-full py-24 md:py-40 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-20 md:mb-32">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">How JanVoice Works</h2>
            <p className="text-slate-600 md:text-xl max-w-2xl mx-auto">A seamless, AI-powered pipeline from citizen report to verified resolution.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-10 md:left-1/2 top-10 bottom-10 w-1 bg-slate-200 -translate-x-1/2 hidden sm:block rounded-full"></div>

            {timelineSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative flex flex-col sm:flex-row items-center gap-8 sm:gap-16 mb-16 sm:mb-24 last:mb-0 ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}
              >
                {/* Center Node */}
                <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-slate-100 shadow-sm items-center justify-center z-10">
                  <div className={`w-6 h-6 rounded-full ${step.color.split(' ')[0].replace('100', '500')}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 w-full sm:w-1/2 ${index % 2 === 0 ? 'sm:text-right sm:pr-20' : 'sm:pl-20'} text-center sm:text-left`}>
                  <div className={`inline-flex h-24 w-24 rounded-3xl items-center justify-center mb-6 sm:mb-8 shadow-sm ${step.color}`}>
                    <step.icon className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 text-xl leading-relaxed max-w-md mx-auto sm:mx-0 ${index % 2 === 0 ? 'sm:ml-auto' : ''}">{step.description}</p>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden sm:block flex-1 w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Platform Showcase */}
      <section id="features" className="w-full py-24 md:py-40 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-24 md:mb-40">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Interactive Platform Showcase</h2>
            <p className="text-slate-600 md:text-xl max-w-2xl mx-auto">See how our purpose-built tools empower authorities to act faster.</p>
          </div>

          <div className="flex flex-col gap-32 md:gap-48">
            {showcaseSlides.map((slide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col lg:flex-row gap-16 lg:gap-32 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 w-full max-w-xl text-center lg:text-left">
                  <div className="inline-flex h-20 w-20 rounded-3xl bg-slate-100 text-slate-700 items-center justify-center mb-8 shadow-sm">
                    <slide.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{slide.title}</h3>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{slide.description}</p>
                </div>
                <div className="flex-1 w-full max-w-3xl">
                  {slide.mockup}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
