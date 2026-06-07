"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, AtSign, Calendar, AlertCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next");

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    dob: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters");
      return;
    }
    if (passwordStrength() < 2) {
      setErrorMsg("Please choose a stronger password");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // Sign up with email confirmation disabled (no OTP)
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username.trim().toLowerCase(),
            full_name: form.fullName.trim(),
            dob: form.dob,
          },
          // Skip email confirmation
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Try to update dob in profiles table (fallback)
        try {
          await supabase
            .from("profiles")
            .update({ dob: form.dob })
            .eq("id", data.user.id);
        } catch (err) {
          console.warn("Non-blocking profiles update fallback warning:", err);
        }

        // Auto sign-in immediately after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) {
          console.warn("Auto-login after signup failed:", signInError.message);
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(nextParam || "/home");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-50 p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
            <Check size={32} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Welcome to hyp!</h2>
          <p className="text-[#6B7280] text-sm">
            Your account has been created. Redirecting you to your feed...
          </p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo Card */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-blue-100 mb-3">
          <span className="text-3xl font-extrabold text-[#2563EB]">h</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">hyp</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-50 p-8">
        <h2 className="text-xl font-extrabold text-[#111827] mb-5 text-center">Join hyp</h2>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 text-xs font-semibold text-[#EF4444] slide-up">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label htmlFor="signup-fullname" className="sr-only">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="signup-fullname"
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="signup-username" className="sr-only">Username</label>
            <div className="relative">
              <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="signup-username"
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Username (e.g. rahul_k)"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Birthday */}
          <div>
            <label htmlFor="signup-dob" className="sr-only">Birthday</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="signup-dob"
                type="text"
                name="dob"
                required
                value={form.dob}
                onChange={handleChange}
                placeholder="Birthday (e.g. August 15, 2002)"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Email address */}
          <div>
            <label htmlFor="signup-email" className="sr-only">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="signup-email"
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="signup-password" className="sr-only">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-1.5 flex gap-1 items-center px-1">
                <span className="text-[10px] text-[#9CA3AF] font-bold">Strength:</span>
                <div className="flex gap-0.5 flex-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength()
                          ? passwordStrength() <= 2
                            ? "bg-amber-400"
                            : "bg-green-500"
                          : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 mt-1 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Already a user?</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          {/* Link to login */}
          <Link
            href={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
            className="w-full py-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] font-semibold rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer text-center text-sm"
          >
            Log In
          </Link>
        </form>
      </div>
    </div>
  );
}
