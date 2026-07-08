"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Mic, UploadCloud } from "lucide-react";

const complaintSchema = z.object({
  description: z.string().min(10, "Please provide more details (at least 10 characters)."),
  address: z.string().min(5, "Please provide a valid address or landmark."),
  ward: z.string().min(1, "Please select a ward."),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export default function NewComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationMock, setLocationMock] = useState<{ lat: number, lng: number } | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      description: "",
      address: "",
      ward: "",
    }
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationMock({ lat: position.coords.latitude, lng: position.coords.longitude });
          // In a real app, reverse geocode to get address and ward
          setValue("address", "Auto-detected Location, Visakhapatnam");
          setValue("ward", "2"); // Mock ward
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please enter manually.");
        }
      );
    }
  };

  const onSubmit = async (data: ComplaintFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Then send the data to our Next.js API route to trigger the Gemini pipeline
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: data.description,
          imageURLs: [],
          location: {
            lat: locationMock?.lat || 17.6868,
            lng: locationMock?.lng || 83.2185,
            address: data.address,
            ward: data.ward
          },
          createdBy: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      router.push("/citizen");
    } catch (error) {
      console.error("Submission error", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center py-12">Please sign in to report an issue.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Report an Issue</h1>
        <p className="text-slate-500 mt-1">Help us identify and fix problems in Visakhapatnam.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">

        {/* Describe the issue */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">
            What is the issue? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              {...register("description")}
              className="w-full min-h-[120px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Describe the problem (e.g., Deep pothole near the school gate, garbage overflowing for 3 days...)"
            />
            <button type="button" className="absolute bottom-3 right-3 p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors" title="Record Voice">
              <Mic className="h-4 w-4" />
            </button>
          </div>
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">
            Where is it? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <Button type="button" variant="outline" onClick={handleGetLocation} className="flex-1 gap-2 border-slate-300 text-slate-700">
              <MapPin className="h-4 w-4" /> Use Current Location
            </Button>
          </div>
          <input
            {...register("address")}
            type="text"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Street address or landmark"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Ward Number <span className="text-red-500">*</span></label>
            <select
              {...register("ward")}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Select a ward</option>
              <option value="1">Ward 1 (Kondapeta / Wilsonpeta)</option>
              <option value="2">Ward 2 (Madhurawada / Dabagardens)</option>
              <option value="3">Ward 3 (Marikavalasa)</option>
              <option value="14">Ward 14 (Sample High Density)</option>
            </select>
            {errors.ward && <p className="text-red-500 text-sm">{errors.ward.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-5 w-5" />
                Submit Report
              </>
            )}
          </Button>
          <p className="text-center text-xs text-slate-500 mt-4">
            By submitting, you agree that this report will be publicly visible (anonymized) on the Vizag civic map.
          </p>
        </div>

      </form>
    </div>
  );
}
