"use client";

import { useState } from "react";
import { FileDown, Printer, Filter, X, Construction, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportsPage() {
  const [showModal, setShowModal] = useState(false);

  const handleComingSoon = () => {
    setShowModal(true);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 p-6 md:p-8 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Generate Reports</h1>
            <p className="text-slate-500 mt-1">Export civic intelligence data for official records and meetings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Reports */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Standard Reports</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-900">Monthly Ward Performance</h3>
                  <p className="text-sm text-slate-500 mt-1">Resolution rates and new issues across all 98 GVMC wards.</p>
                </div>
                <Button onClick={handleComingSoon} variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" /> Export PDF
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-900">Critical Infrastructure Risks</h3>
                  <p className="text-sm text-slate-500 mt-1">High-severity issues near schools and hospitals.</p>
                </div>
                <Button onClick={handleComingSoon} variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" /> Export PDF
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-900">Raw Issue Data (CSV)</h3>
                  <p className="text-sm text-slate-500 mt-1">Complete dataset of all reported issues for external analysis.</p>
                </div>
                <Button onClick={handleComingSoon} variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" /> Download CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Custom Report Builder */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Filter className="h-5 w-5" /> Custom Report
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date Range</label>
                <select className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Quarter</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Specific Ward</label>
                <select className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none">
                  <option>All Wards</option>
                  <option>Ward 1 (Kondapeta)</option>
                  <option>Ward 2 (Madhurawada)</option>
                  <option>Ward 3 (Marikavalasa)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none">
                  <option>All Categories</option>
                  <option>Roads</option>
                  <option>Sanitation</option>
                  <option>Electricity</option>
                  <option>Water</option>
                </select>
              </div>
              <div className="pt-4 flex gap-2">
                <Button onClick={handleComingSoon} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Generate</Button>
                <Button onClick={handleComingSoon} variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full relative text-center"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-100">
                <Construction className="h-7 w-7 text-amber-500 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">Under Construction! 🚧</h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                We're still pouring the digital concrete for this feature! 🏗️
                <br /><br />
                The advanced reporting engine is currently being built by our top engineers and will be rolling out in an upcoming update. Check back soon!
              </p>
              
              <Button 
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-5 rounded-xl"
              >
                Fair enough, I'll wait
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
