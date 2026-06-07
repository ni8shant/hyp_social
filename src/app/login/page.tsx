"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      router.push(nextParam || "/home");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6">
      {/* Logo Card */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-lg shadow-blue-100 mb-4">
          <span className="text-4xl font-extrabold text-[#2563EB]">h</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">hyp</h1>
        <p className="text-[#6B7280] text-sm mt-1">Stay connected with real life</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-50 p-8">
        <h2 className="text-xl font-extrabold text-[#111827] mb-6 text-center">Welcome Back</h2>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 text-xs font-semibold text-[#EF4444] slide-up">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label htmlFor="login-email" className="sr-only">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="login-password" className="sr-only">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
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
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 mt-1 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">New to hyp?</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          {/* Link to signup */}
          <Link
            href={nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup"}
            className="w-full py-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] font-semibold rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer text-center text-sm"
          >
            Create an Account
          </Link>
        </form>
      </div>
    </div>
  );
}
