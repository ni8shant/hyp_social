import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EDE9FE] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white shadow-2xl shadow-blue-100 mb-6">
          <span className="text-5xl font-extrabold text-[#2563EB]">h</span>
        </div>
        <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight">hyp</h1>
        <p className="text-[#6B7280] mt-2 text-base max-w-xs mx-auto leading-relaxed">
          Stay connected with the people who matter in your real life
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/login"
          id="welcome-login"
          className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-center font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-200"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          id="welcome-signup"
          className="w-full py-3.5 bg-white hover:bg-[#F9FAFB] active:scale-[0.98] text-[#2563EB] text-center font-semibold rounded-2xl border border-[#2563EB]/30 transition-all duration-200 shadow-sm"
        >
          Create Account
        </Link>
        <Link
          href="/forgot-password"
          className="text-center text-sm text-[#6B7280] hover:text-[#2563EB] transition-colors mt-1"
        >
          Forgot password?
        </Link>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-[#9CA3AF] text-center px-6">
        By continuing, you agree to hyp&apos;s{" "}
        <a href="#" className="underline hover:text-[#6B7280]">Terms</a> and{" "}
        <a href="#" className="underline hover:text-[#6B7280]">Privacy Policy</a>
      </p>
    </div>
  );
}
