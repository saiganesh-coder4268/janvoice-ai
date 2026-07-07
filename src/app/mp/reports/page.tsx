"use client";

import { FileDown, Printer, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 p-6 md:p-8">
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
                <Button variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" /> Export PDF
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-900">Critical Infrastructure Risks</h3>
                  <p className="text-sm text-slate-500 mt-1">High-severity issues near schools and hospitals.</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" /> Export PDF
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-900">Raw Issue Data (CSV)</h3>
                  <p className="text-sm text-slate-500 mt-1">Complete dataset of all reported issues for external analysis.</p>
                </div>
                <Button variant="outline" className="gap-2">
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
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Generate</Button>
                <Button variant="outline" size="icon"><Printer className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
