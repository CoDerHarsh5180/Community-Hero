"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, ImagePlus, X, Loader2, MapPin, ShieldAlert , Sparkles} from "lucide-react";

import { useLocationStore } from "@/app/store/useLocationStore";
import { useUserStore } from "@/app/store/useUserStore"; // 🚀 Added to get userId

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- 1. ZOD SCHEMA VALIDATION ---
const formSchema = z.object({
  category: z.string().min(1, "Category is required."),
  detail: z.string().optional(), // Made optional to match backend logic (if image exists)
  addressText: z.string().min(3, "Location description is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportPage() {
  const router = useRouter();
  const { lat, lng, addressText, isLoading: isLocationLoading } = useLocationStore();
  const { user } = useUserStore(); // 🚀 Grab logged-in user
  
  // Local state for actual Files (for backend) and Base64 strings (for UI previews)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add Sparkles and Wand2 to your lucide-react imports


// Add this state inside your ReportPage component (near isSubmitting)
  const [isEnhancing, setIsEnhancing] = useState(false);
  // Refs for hidden native file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      detail: "",
      addressText: addressText || "",
    },
  });

  const currentDetail = watch("detail");

  // --- 2. MULTIPART IMAGE HANDLING ---
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Save actual File objects for the FormData submission
    setImageFiles((prev) => [...prev, ...files]);

    // Create Base64 previews for the UI
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- AI TEXT ENHANCEMENT ---
  const handleEnhanceDescription = async () => {
    const currentText = control._formValues.detail || "";
    
    if (currentText.trim() === "" && imagePreviews.length === 0) {
      alert("Please add some rough text or at least one photo for the AI to analyze!");
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the raw text and the base64 UI previews
        body: JSON.stringify({ text: currentText, images: imagePreviews }),
      });

      if (!res.ok) throw new Error("Failed to enhance");
      
      const data = await res.json();
      
      // 🚀 Use React Hook Form's setValue to instantly update the text area!
      // (You will need to import useForm from react-hook-form and grab setValue from it)
      // Change your useForm initialization to: const { control, handleSubmit, setValue } = useForm<FormValues>(...)
      setValue("detail", data.enhancedText, { shouldValidate: true, shouldDirty: true });
      
    } catch (error) {
      console.error("AI Enhance failed", error);
      alert("AI enhancement failed. Please write the description manually.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // --- 3. MULTIPART FORM SUBMISSION ---
  const onSubmit = async (values: FormValues) => {
    // Backend validation alignment: Need EITHER an image OR detail text
    if (imageFiles.length === 0 && (!values.detail || values.detail.trim() === "")) {
      alert("Please provide either photographic evidence or a detailed text description.");
      return;
    }

    if (!lat || !lng) {
      alert("GPS Coordinates missing. Please allow location access.");
      return;
    }

    if (!user) {
      alert("User session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚀 CONSTRUCT NATIVE FORMDATA
      const formData = new FormData();
      formData.append("category", values.category);
      formData.append("detail", values.detail || "");
      formData.append("addressText", values.addressText);
      formData.append("lat", lat.toString());
      formData.append("lng", lng.toString());
      formData.append("userId", user._id ); 

      // Append every physical file using the key 'files' that your backend expects
      imageFiles.forEach((file) => {
        formData.append("files", file);
      });

      // 🚀 CRITICAL FIX: DO NOT set 'Content-Type' manually! 
      // The browser automatically sets it to 'multipart/form-data' with the correct boundary hash.
      const res = await fetch("/api/issue", {
        method: "POST",
        body: formData, 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit report");
      }

      router.replace("/dashboard/feed");
      router.refresh(); 

    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-zinc-950 p-4 md:p-8 pb-24 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            File New Report
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Document infrastructure anomalies. Our AI will triage the data to the correct department.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* GPS Location Widget */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-full text-emerald-500">
            {isLocationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">GPS Lock Active</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {lat && lng ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : "Acquiring satellites..."}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          
          {/* CATEGORY */}
          <Controller
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-sm block">Issue Category</label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-12 rounded-xl">
                    <SelectValue placeholder="Select classification..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pothole">Road / Pothole</SelectItem>
                    <SelectItem value="Water Leakage">Water Leakage</SelectItem>
                    <SelectItem value="Streetlight Broken">Streetlight Broken</SelectItem>
                    <SelectItem value="Garbage Dump">Illegal Garbage Dump</SelectItem>
                    <SelectItem value="Fallen Tree">Fallen Tree</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && <p className="text-sm font-medium text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {/* ADDRESS TEXT */}
          <Controller
            control={control}
            name="addressText"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-sm block">Local Landmark</label>
                <Input 
                  placeholder="e.g. Near Gate No. 2, opposite cafe..." 
                  className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 h-12 rounded-xl"
                  {...field} 
                />
                {fieldState.error && <p className="text-sm font-medium text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {/* DETAILS */}
          {/* DETAILS (DIRECT CONTROLLER) */}
          <Controller
            control={control}
            name="detail"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-sm block">
                    Field Notes {imageFiles.length > 0 && <span className="text-slate-400 font-normal">(Optional)</span>}
                  </label>
                  
                  {/* 🚀 THE MAGIC AI BUTTON */}
                  <button
                    type="button"
                    onClick={handleEnhanceDescription}
                    disabled={isEnhancing}
                    className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                  >
                    {isEnhancing ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> AI Enhance</>
                    )}
                  </button>
                </div>

                <Textarea 
                  placeholder="Describe the severity... or just type a few words and click AI Enhance!" 
                  className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl resize-none h-24"
                  {...field} 
                />
                {fieldState.error && <p className="text-sm font-medium text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {/* --- PHOTOGRAPHIC EVIDENCE --- */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 text-sm block mb-3">Photographic Evidence</label>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-zinc-800">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 backdrop-blur-sm rounded-full text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                multiple 
                className="hidden" 
                ref={cameraInputRef} 
                onChange={handleImageCapture}
              />
              <button 
                type="button" 
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors font-bold text-sm"
              >
                <Camera className="w-5 h-5" /> Camera
              </button>

              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                ref={galleryInputRef} 
                onChange={handleImageCapture}
              />
              <button 
                type="button" 
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-bold text-sm"
              >
                <ImagePlus className="w-5 h-5" /> Upload
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> ANALYZING & UPLOADING...</>
          ) : (
            "SUBMIT FIELD REPORT"
          )}
        </button>
      </form>
    </div>
  );
}