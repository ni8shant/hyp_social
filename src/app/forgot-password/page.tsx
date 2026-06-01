"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Back */}
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {!sent ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 p-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-5">
              <Mail size={24} className="text-[#2563EB]" />
            </div>

            <h1 className="text-xl font-bold text-[#111827] mb-1">Forgot Password?</h1>
            <p className="text-sm text-[#6B7280] mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <label htmlFor="reset-email" className="sr-only">Email address</label>
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full pl-9 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
                />
              </div>
              <button
                id="reset-submit"
                type="submit"
                className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-md shadow-blue-200"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-[#22C55E]" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Check your email</h2>
            <p className="text-sm text-[#6B7280] mb-6">
              We&apos;ve sent a reset link to{" "}
              <span className="font-semibold text-[#111827]">{email}</span>
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-center transition-all"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
