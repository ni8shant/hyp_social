"use client";

import { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Type,
  Sparkles,
  X,
  ChevronRight,
  TrendingUp,
  Camera,
  Upload,
  RotateCw,
  FlipHorizontal,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Video,
  Play,
  Pause,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { createPost, LIFE_UPDATE_CONFIGS } from "@/lib/data";

// Predefined life update types
const lifeUpdateTypes = [
  { label: "New Job", emoji: "💼", gradient: "from-[#2563EB] to-[#60A5FA]" },
  { label: "Started MBA", emoji: "📚", gradient: "from-[#7C3AED] to-[#4F46E5]" },
  { label: "Got Internship", emoji: "📋", gradient: "from-[#D97706] to-[#F59E0B]" },
  { label: "Changed City", emoji: "🏙️", gradient: "from-[#059669] to-[#10B981]" },
  { label: "Birthday", emoji: "🎂", gradient: "from-[#EC4899] to-[#F97316]" },
  { label: "Wedding", emoji: "💍", gradient: "from-[#DB2777] to-[#9333EA]" },
  { label: "Graduation", emoji: "🎓", gradient: "from-[#7C3AED] to-[#4F46E5]" },
  { label: "Achievement", emoji: "🏆", gradient: "from-[#0891B2] to-[#06B6D4]" },
  { label: "New Home", emoji: "🏠", gradient: "from-[#065F46] to-[#10B981]" },
];

const trendingTypes = ["New Job", "Birthday", "Graduation"];

type PostMode = "normal" | "life_update";

// Mock snap options for high-fidelity offline fallback
const mockSnaps = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // Golden sunset beach
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", // Premium Macbook workspace
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", // Aesthetic latte art coffee
];

// Mock stock videos for fallback recording (20-second public links)
const mockVideos = [
  "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-with-stars-and-nebula-44023-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-near-a-sandy-beach-43063-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-computer-keyboard-40333-large.mp4"
];

export default function CreatePage() {
  const { profile } = useAuth();
  const [mode, setMode] = useState<PostMode>("normal");
  const [caption, setCaption] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);
  const [customUpdateText, setCustomUpdateText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Media Preview states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  
  // Share post status
  const [postShared, setPostShared] = useState(false);

  // Camera settings
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Video Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Fallback indices
  const [mockSnapIndex, setMockSnapIndex] = useState(0);
  const [mockVideoIndex, setMockVideoIndex] = useState(0);

  // Editor states
  const [presetFilter, setPresetFilter] = useState("Normal");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [showSliders, setShowSliders] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset editor settings
  const handleResetEdits = () => {
    setPresetFilter("Normal");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipHorizontal(false);
  };

  // Compile CSS filter styles
  const getFilterStyle = () => {
    let filterStr = "";
    
    // Applying Preset Filters
    if (presetFilter === "Chrome") filterStr += "saturate(150%) contrast(110%) ";
    else if (presetFilter === "Noir") filterStr += "grayscale(100%) contrast(135%) brightness(95%) ";
    else if (presetFilter === "Sepia") filterStr += "sepia(75%) contrast(90%) brightness(95%) ";
    else if (presetFilter === "Cool") filterStr += "hue-rotate(25deg) saturate(110%) brightness(105%) ";
    
    // Applying adjustment sliders
    filterStr += `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Transforms
    const transformStr = `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1})`;

    return {
      filter: filterStr.trim(),
      transform: transformStr,
      transition: "filter 0.15s ease, transform 0.25s ease",
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideoFile = file.type.startsWith("video/");
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setMediaType(isVideoFile ? "video" : "image");
        handleResetEdits();
      };
      reader.readAsDataURL(file);
    }
  };

  // Start live webcam streaming
  const handleStartCamera = async (modeOption?: "photo" | "video") => {
    setCameraError(null);
    setShowCamera(true);
    setImagePreview(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (modeOption) setCameraMode(modeOption);
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: modeOption === "video" ? { echoCancellation: true } : false,
        });
        
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        throw new Error("navigator.mediaDevices not supported in this browser environment");
      }
    } catch (err) {
      console.warn("Failed to capture stream, loading premium mock capture mode:", err);
      setCameraError(
        modeOption === "video"
          ? "Webcam blocked. Launching 20-second video recording simulator."
          : "Webcam blocked. Launching mirrored snap camera simulator."
      );
    }
  };

  // Capture frame to canvas (Photo capture)
  const handleCapturePhoto = () => {
    if (cameraStream && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the canvas context horizontally (always mirrored photo)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImagePreview(dataUrl);
        setMediaType("image");
        handleResetEdits();
        handleStopCamera();
      }
    } else {
      // Fallback take mock photo
      const mockPhoto = mockSnaps[mockSnapIndex % mockSnaps.length];
      setImagePreview(mockPhoto);
      setMediaType("image");
      setMockSnapIndex((prev) => prev + 1);
      // Reset edits but enable flipHorizontal by default to mirror mock snaps
      setPresetFilter("Normal");
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setRotation(0);
      setFlipHorizontal(true); 
      handleStopCamera();
    }
  };

  // Start 20-second media recording
  const handleStartRecording = () => {
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setIsRecording(true);

    if (cameraStream) {
      try {
        const recorder = new MediaRecorder(cameraStream, { mimeType: "video/webm;codecs=vp9" });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          setImagePreview(url);
          setMediaType("video");
          handleResetEdits();
          setFlipHorizontal(true); // Always mirrored video preview by default!
        };

        recorder.start();
      } catch (err) {
        console.warn("Failed to start MediaRecorder, utilizing mock countdown:", err);
      }
    }

    // Set countdown timer for up to 20 seconds
    let counter = 0;
    timerIntervalRef.current = setInterval(() => {
      counter += 1;
      setRecordingSeconds(counter);
      
      if (counter >= 20) {
        handleStopRecording();
      }
    }, 1000);
  };

  // Stop media recording
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setIsRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      handleStopCamera();
    } else {
      // Fallback mock video selection
      const mockVid = mockVideos[mockVideoIndex % mockVideos.length];
      setImagePreview(mockVid);
      setMediaType("video");
      setMockVideoIndex((prev) => prev + 1);
      
      // Default to mirrored for mock recording fallback as well
      setPresetFilter("Normal");
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setRotation(0);
      setFlipHorizontal(true);
      handleStopCamera();
    }
  };

  // Stop camera tracks
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Handle stream shutdown on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [cameraStream]);

  const selectedUpdateData = lifeUpdateTypes.find(
    (u) => u.label === (showCustomInput ? customUpdateText : selectedUpdate)
  );

  const handleSharePost = () => {
    if (!profile) return;

    const updateLabel = showCustomInput ? customUpdateText : selectedUpdate;
    const updateConfig = updateLabel ? LIFE_UPDATE_CONFIGS[updateLabel] : null;

    createPost({
      authorId: profile.id,
      authorUsername: profile.username,
      authorDisplayName: profile.fullName,
      authorInitial: profile.avatarInitial,
      content: caption.trim() || (updateLabel ? `${updateLabel}!` : "Shared a moment ✨"),
      imageUrl: imagePreview || undefined,
      mediaType: imagePreview ? mediaType : undefined,
      postType: mode === "life_update" ? "life_update" : "normal",
      updateType: mode === "life_update" ? (updateLabel || undefined) : undefined,
      updateEmoji: updateConfig?.emoji,
      updateGradient: updateConfig?.gradient,
    });

    setPostShared(true);
    setTimeout(() => {
      setPostShared(false);
      setImagePreview(null);
      setCaption("");
      setSelectedUpdate(null);
      setCustomUpdateText("");
      setShowCustomInput(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-4xl mx-auto relative md:px-12">
      <TopBar showSearch={true} />

      <main className="pb-24 pt-4 max-w-2xl mx-auto px-4">
        
        {/* Success Shared Toast */}
        {postShared && (
          <div className="fixed top-18 inset-x-4 max-w-md mx-auto z-50 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl p-4 text-center text-sm font-extrabold text-[#7C3AED] shadow-2xl flex items-center justify-center gap-2 slide-up">
            <div className="w-6 h-6 bg-emerald-100 text-[#22C55E] rounded-full flex items-center justify-center shadow-sm">
              <Check size={14} className="stroke-[3]" />
            </div>
            Post shared successfully on feed!
          </div>
        )}

        <h1 className="text-xl font-extrabold text-[#111827] tracking-tight mb-4 pl-1">Create Post</h1>

        {/* Mode selector tab */}
        <div className="flex gap-2 mb-5 bg-slate-100 p-1.5 rounded-[1.4rem] border border-slate-200/50 shadow-inner">
          <button
            id="create-mode-post"
            onClick={() => setMode("normal")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              mode === "normal"
                ? "bg-white text-[#111827] shadow-sm border border-slate-200/20"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <ImageIcon size={14} />
            Post
          </button>
          <button
            id="create-mode-update"
            onClick={() => setMode("life_update")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              mode === "life_update"
                ? "bg-white text-[#111827] shadow-sm border border-slate-200/20"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <Sparkles size={14} />
            Life Update
          </button>
        </div>

        {/* NORMAL POST MODE WITH CAMERA, VIDEO RECORDER & EDITOR */}
        {mode === "normal" && (
          <div className="flex flex-col gap-4.5 slide-up">
            
            {showCamera ? (
              /* Live Camera / Video Recorder Interface block */
              <div className="w-full aspect-[4/3] rounded-[2.2rem] bg-black border-2 border-[#CBD5E1] overflow-hidden relative shadow-md flex flex-col justify-between p-4">
                
                {/* On-screen progress indicators */}
                <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#7C3AED] text-white"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-white ${isRecording ? "animate-ping" : ""}`} />
                      {isRecording ? "REC" : cameraMode === "video" ? "VIDEO STANDBY" : "PHOTO STANDBY"}
                    </span>
                    
                    {isRecording && (
                      <span className="bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold text-white px-2 py-0.5 rounded-full border border-white/10">
                        {recordingSeconds < 10 ? `00:0${recordingSeconds}` : `00:${recordingSeconds}`} / 00:20
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStopCamera}
                    disabled={isRecording}
                    className="w-7 h-7 bg-black/40 hover:bg-black/60 text-white disabled:opacity-30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close Camera"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Progress bar overlay for video recording limit */}
                {isRecording && (
                  <div className="absolute top-0 left-0 h-1 bg-[#EF4444] transition-all duration-1000 z-30" style={{ width: `${(recordingSeconds / 20) * 100}%` }} />
                )}

                {/* Video feed or mock snapping block */}
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white bg-slate-900/90 gap-2.5">
                    <Camera size={44} className="text-slate-400 animate-pulse" />
                    <p className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider pl-1.5 pr-1.5">{cameraError}</p>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                      {cameraMode === "video"
                        ? "Tap the record button to run the 20-second simulated overlay capturing stock MP4 video."
                        : "Tap the capture button to take a gorgeous mock snap from the location feed library."}
                    </p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  />
                )}

                {/* Shutter / Record Control Panel */}
                <div className="flex flex-col items-center gap-3 w-full z-10 mt-auto">
                  
                  {/* Camera Mode sub selector - Photo vs Video */}
                  {!isRecording && (
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex gap-4 text-[10px] font-bold text-white mb-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleStartCamera("photo")}
                        className={`transition-colors cursor-pointer hover:text-white ${
                          cameraMode === "photo" ? "text-[#7C3AED]" : "text-white/60"
                        }`}
                      >
                        PHOTO
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartCamera("video")}
                        className={`transition-colors cursor-pointer hover:text-white ${
                          cameraMode === "video" ? "text-[#7C3AED]" : "text-white/60"
                        }`}
                      >
                        20S VIDEO
                      </button>
                    </div>
                  )}

                  {/* Dynamic Shutter Button (toggles photo vs video recorder) */}
                  <div className="flex justify-center items-center">
                    {cameraMode === "video" ? (
                      isRecording ? (
                        /* Stop Recording Shutter button */
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                          aria-label="Stop Recording"
                        >
                          <div className="w-6 h-6 rounded-md bg-[#EF4444] shadow-inner" />
                        </button>
                      ) : (
                        /* Start Recording Shutter button */
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          aria-label="Start Recording"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#EF4444] hover:bg-[#DC2626] shadow-inner" />
                        </button>
                      )
                    ) : (
                      /* Photo Snapping Shutter button */
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 border-4 border-slate-300 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label="Capture Photo"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-900 shadow-inner" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : imagePreview ? (
              /* Media display card with the Photo Editor Panel */
              <div className="space-y-4">
                
                {/* Visual Preview Box (renders video or image natively) */}
                <div className="w-full aspect-[4/3] rounded-[2.2rem] border border-[#CBD5E1] bg-slate-950 overflow-hidden relative shadow-sm flex items-center justify-center">
                  
                  {mediaType === "video" ? (
                    <video
                      src={imagePreview}
                      controls
                      autoPlay
                      loop
                      playsInline
                      style={getFilterStyle()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      style={getFilterStyle()} 
                      className="w-full h-full flex items-center justify-center overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Captured Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Remove image button */}
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors shadow-lg z-20 cursor-pointer"
                    aria-label="Delete media"
                  >
                    <X size={15} className="text-white stroke-[2.5]" />
                  </button>
                </div>

                {/* HIGH-FIDELITY PHOTO & VIDEO EDITOR SUITE */}
                <div className="bg-white border border-[#CBD5E1]/70 rounded-[2.2rem] p-4.5 shadow-sm space-y-4">
                  
                  {/* Editor toolbar head */}
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                      {mediaType === "video" ? "Video Adjustments" : "Photo Adjustments"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSliders(!showSliders)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                          showSliders
                            ? "bg-violet-50 border-[#7C3AED]/20 text-[#7C3AED]"
                            : "bg-slate-50 border-slate-200 text-[#4B5563]"
                        }`}
                      >
                        <SlidersHorizontal size={12} />
                        <span>Sliders</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetEdits}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-[#4B5563] border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <RefreshCw size={12} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset Filters selector */}
                  <div>
                    <p className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-2 pl-0.5">Filters</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                      {["Normal", "Chrome", "Noir", "Sepia", "Cool"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setPresetFilter(f)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            presetFilter === f
                              ? "bg-[#7C3AED] border-transparent text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-[#4B5563] hover:border-[#7C3AED]"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rotation & Flip Controls */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-[#4B5563] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw size={13} />
                      <span>Rotate 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipHorizontal(!flipHorizontal)}
                      className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        flipHorizontal
                          ? "bg-violet-50/50 border-[#7C3AED]/20 text-[#7C3AED]"
                          : "border-slate-200 hover:bg-slate-50 text-[#4B5563]"
                      }`}
                    >
                      <FlipHorizontal size={13} />
                      <span>Flip Horizontal</span>
                    </button>
                  </div>

                  {/* Adjustment Sliders fine tuning */}
                  {showSliders && (
                    <div className="space-y-3.5 border-t border-slate-50 pt-3.5 slide-up">
                      {/* Brightness slider */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#6B7280] mb-1">
                          <span>Brightness</span>
                          <span>{brightness}%</span>
                        </div>
                        <input
                          id="slider-brightness"
                          type="range"
                          min="50"
                          max="180"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Contrast slider */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#6B7280] mb-1">
                          <span>Contrast</span>
                          <span>{contrast}%</span>
                        </div>
                        <input
                          id="slider-contrast"
                          type="range"
                          min="50"
                          max="180"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Saturation slider */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#6B7280] mb-1">
                          <span>Saturation</span>
                          <span>{saturation}%</span>
                        </div>
                        <input
                          id="slider-saturation"
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* Photo & Video upload choice selectors - exact premium layout */
              <div className="grid grid-cols-2 gap-4">
                
                {/* Take Photo or Video (Camera Capture portal) */}
                <button
                  type="button"
                  onClick={() => handleStartCamera("photo")}
                  className="w-full aspect-[4/3] rounded-[2.2rem] border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:border-[#7C3AED] hover:bg-[#F5F3FF] hover:text-[#7C3AED] transition-all duration-300"
                >
                  <Camera size={30} className="text-[#CBD5E1] group-hover:text-[#7C3AED]" />
                  <p className="text-xs font-bold">Use Camera Stream</p>
                  <p className="text-[10px] text-[#9CA3AF]">Snaps & 20s Video recorder</p>
                </button>

                {/* Upload File button (Image or video upload) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-[2.2rem] border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:border-[#7C3AED] hover:bg-[#F5F3FF] hover:text-[#7C3AED] transition-all duration-300"
                >
                  <ImageIcon size={30} className="text-[#CBD5E1] group-hover:text-[#7C3AED]" />
                  <p className="text-xs font-bold">Upload Media File</p>
                  <p className="text-[10px] text-[#9CA3AF]">Photos & Video files</p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}

            {/* Caption */}
            <div className="bg-white rounded-[2.2rem] border border-[#CBD5E1] overflow-hidden">
              <label htmlFor="post-caption" className="sr-only">Write caption</label>
              <textarea
                id="post-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={4}
                maxLength={2200}
                className="w-full p-4.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none resize-none"
              />
              <div className="flex items-center justify-between px-5 pb-3.5">
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#111827]">
                  <Type size={14} /> formatting
                </button>
                <span className="text-[10px] font-bold text-[#9CA3AF]">{caption.length}/2200</span>
              </div>
            </div>

            {/* Share button */}
            <button
              id="post-share"
              onClick={handleSharePost}
              disabled={!imagePreview && !caption.trim()}
              className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-violet-200"
            >
              Share Post
            </button>

          </div>
        )}

        {/* LIFE UPDATE CARD MODE */}
        {mode === "life_update" && (
          <div className="flex flex-col gap-5 slide-up">
            {/* Preview card */}
            {(selectedUpdate || (showCustomInput && customUpdateText)) && (
              <div
                className={`rounded-[2.2rem] p-5 text-white bg-gradient-to-br ${
                  selectedUpdateData?.gradient || "from-[#374151] to-[#6B7280]"
                } shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{selectedUpdateData?.emoji || "✨"}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    Life Update
                  </span>
                </div>
                <p className="text-lg font-black tracking-tight mt-1">
                  {showCustomInput ? customUpdateText : selectedUpdate}
                </p>
                {caption && <p className="text-xs opacity-90 mt-1.5 leading-relaxed">"{caption}"</p>}
              </div>
            )}

            {/* Trending picks */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 pl-1">
                <TrendingUp size={13} className="text-[#F59E0B]" />
                <p className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider">
                  Trending on hyp
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {lifeUpdateTypes
                  .filter((u) => trendingTypes.includes(u.label))
                  .map((u) => (
                    <button
                      key={u.label}
                      onClick={() => {
                        setSelectedUpdate(u.label);
                        setShowCustomInput(false);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                        selectedUpdate === u.label && !showCustomInput
                          ? "bg-[#7C3AED] text-white border-transparent shadow-sm"
                          : "bg-white text-[#374151] border-slate-200 hover:border-[#7C3AED]"
                      }`}
                    >
                      {u.emoji} {u.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* All update types grid */}
            <div>
              <p className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider mb-2 pl-1">
                All Updates
              </p>
              <div className="grid grid-cols-2 gap-2">
                {lifeUpdateTypes.map((u) => (
                  <button
                    key={u.label}
                    onClick={() => {
                      setSelectedUpdate(u.label);
                      setShowCustomInput(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      selectedUpdate === u.label && !showCustomInput
                        ? "bg-violet-50/65 border-[#7C3AED] text-[#7C3AED]"
                        : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <span className="text-lg">{u.emoji}</span>
                    <span className="truncate">{u.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom update */}
            <button
              onClick={() => {
                setShowCustomInput(true);
                setSelectedUpdate(null);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showCustomInput
                  ? "bg-violet-50/65 border-[#7C3AED] text-[#7C3AED]"
                  : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#CBD5E1]"
              }`}
            >
              <span>✍️ Write something custom...</span>
              <ChevronRight size={14} />
            </button>

            {showCustomInput && (
              <input
                id="custom-update-text"
                type="text"
                value={customUpdateText}
                onChange={(e) => setCustomUpdateText(e.target.value)}
                placeholder="e.g. Started a podcast 🎙️"
                className="w-full px-4 py-3 bg-white border border-[#7C3AED] rounded-xl text-xs text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#7C3AED]/20 -mt-2 slide-up"
              />
            )}

            {/* Caption */}
            <textarea
              id="update-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a message to share with friends..."
              rows={3}
              className="w-full p-4 bg-white border border-[#E5E7EB] rounded-2xl text-xs text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#7C3AED]/20 resize-none"
            />

            {/* Share button */}
            <button
              id="update-share"
              onClick={handleSharePost}
              disabled={!selectedUpdate && !customUpdateText.trim()}
              className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-violet-200"
            >
              Share Life Update ✨
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
