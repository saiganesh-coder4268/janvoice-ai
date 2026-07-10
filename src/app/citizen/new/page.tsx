"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Mic, UploadCloud, Camera, X } from "lucide-react";
import gvmcWards from "@/lib/data/gvmc-wards.json";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  // Helper function to compress image in browser using canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.6 quality to ensure it fits in Firestore 1MB limit
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

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
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocationMock({ lat, lng });
          
          try {
            // Using free Nominatim (OpenStreetMap) instead of Google Maps to avoid billing issues
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: {
                'User-Agent': 'janvoice-ai-prototype'
              }
            });
            const data = await res.json();
            
            if (data && data.display_name) {
              const formattedAddress = data.display_name;
              setValue("address", formattedAddress);
              
              // Automatically determine ward based on address
              let foundWard = "";
              for (const ward of gvmcWards) {
                for (const locality of ward.localities) {
                  if (formattedAddress.toLowerCase().includes(locality.toLowerCase())) {
                    foundWard = ward.wardNumber;
                    break;
                  }
                }
                if (foundWard) break;
              }
              
              // Fallback to "other" if no locality matched (to allow issues from outside Vizag)
              if (!foundWard) {
                foundWard = "other";
              }
              
              setValue("ward", foundWard);
            } else {
              setValue("address", "Location detected (address not found)");
            }
          } catch (error) {
            console.error("Geocoding error", error);
            setValue("address", "Auto-detected Location");
          }
          
          // Let the user select the ward manually, since mapping it directly requires a custom spatial index.
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
      let uploadedImageUrls: string[] = [];

      if (imageFile) {
        // Compress image in browser to bypass Vercel file system limits and Firebase Storage requirements
        // We will send it as a Base64 string directly to Firestore (compressed to < 1MB)
        const base64Image = await compressImage(imageFile);
        uploadedImageUrls.push(base64Image);
      }

      let finalLat = locationMock?.lat;
      let finalLng = locationMock?.lng;

      // If locationMock wasn't set via "Use Current Location", try geocoding the entered address
      if (!finalLat || !finalLng) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}`, {
            headers: { 'User-Agent': 'janvoice-ai-prototype' }
          });
          const geodata = await res.json();
          if (geodata && geodata.length > 0) {
            finalLat = parseFloat(geodata[0].lat);
            finalLng = parseFloat(geodata[0].lon);
          } else {
            finalLat = 17.6868;
            finalLng = 83.2185;
          }
        } catch (error) {
          console.error("Geocoding failed in submit", error);
          finalLat = 17.6868;
          finalLng = 83.2185;
        }
      }

      // Then send the data to our Next.js API route to trigger the Gemini pipeline
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: data.description,
          imageURLs: uploadedImageUrls,
          location: {
            lat: finalLat,
            lng: finalLng,
            address: data.address,
            ward: data.ward
          },
          createdBy: user.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit complaint");
      }

      router.push("/citizen");
    } catch (error: any) {
      console.error("Submission error", error);
      alert(error.message || "Failed to submit complaint. Please try again.");
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
              <option value="">Select a ward or area</option>
              {gvmcWards.map(w => (
                <option key={w.wardNumber} value={w.wardNumber}>
                  {w.wardNumber === "other" ? w.wardName : `Ward ${w.wardNumber} (${w.wardName})`}
                </option>
              ))}
            </select>
            {errors.ward && <p className="text-red-500 text-sm">{errors.ward.message}</p>}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">
            Add Photos (Optional)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center p-6 text-center">
            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-6">
                <Camera className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600 font-medium">Tap to capture or upload</span>
                <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
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
