"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, AtSign, Calendar, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (passwordStrength() < 2) {
      setErrorMsg("Please choose a stronger password");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username.trim().toLowerCase(),
            full_name: form.fullName.trim(),
            dob: form.dob,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Also update dob in public.profiles just in case (fallback)
        try {
          await supabase
            .from("profiles")
            .update({ dob: form.dob })
            .eq("id", data.user.id);
        } catch (err) {
          console.warn("Non-blocking profiles update fallback warning:", err);
        }

        setSuccess(true);
        // Wait a few seconds, then redirect to home
        setTimeout(() => {
          router.push("/home");
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  const strength = passwordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-50 p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Account Created!</h2>
          <p className="text-[#6B7280] text-sm">
            Welcome to **hyp**! If confirmation email is required, check your inbox. Otherwise, redirecting you to your feed...
          </p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-lg shadow-blue-100 mb-3">
          <span className="text-3xl font-extrabold text-[#2563EB]">h</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#111827]">Join hyp</h1>
        <p className="text-[#6B7280] text-sm mt-1">Create your account</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-50 p-8">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="relative">
            <label htmlFor="signup-fullname" className="sr-only">Full Name</label>
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="signup-fullname"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Username */}
          <div className="relative">
            <label htmlFor="signup-username" className="sr-only">Username</label>
            <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="signup-username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <label htmlFor="signup-email" className="sr-only">Email address</label>
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="signup-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <label htmlFor="signup-dob" className="sr-only">Date of Birth</label>
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="signup-dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <label htmlFor="signup-password" className="sr-only">Password</label>
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength meter */}
            {form.password.length > 0 && (
              <div className="mt-1.5 flex gap-1 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength ? strengthColor[strength] : "bg-[#E5E7EB]"
                    }`}
                  />
                ))}
                <span className="text-xs text-[#6B7280] ml-1">{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="signup-confirm-password" className="sr-only">Confirm Password</label>
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className={`w-full pl-9 pr-10 py-2.5 bg-[#F9FAFB] border rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all ${
                form.confirmPassword.length > 0 && form.password !== form.confirmPassword
                  ? "border-[#EF4444] focus:border-[#EF4444]"
                  : "border-[#E5E7EB] focus:border-[#2563EB]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
            <p className="text-xs text-[#EF4444] -mt-2">Passwords do not match</p>
          )}

          {/* Create Account button */}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 mt-1 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>

      <p className="mt-5 text-sm text-[#6B7280]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2563EB] font-semibold hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
