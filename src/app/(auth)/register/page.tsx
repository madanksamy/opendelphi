"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "email" | "phone";

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  async function handleGoogleSignup() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess("Check your email for a confirmation link.");
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: { full_name: name },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setOtpSent(true);
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-card-foreground">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Get started with OpenDelphi for free
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      {/* Mode toggle */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <div className="mb-4 flex rounded-xl border border-border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => { setMode("email"); setError(""); setSuccess(""); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === "email"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => { setMode("phone"); setError(""); setSuccess(""); setOtpSent(false); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === "phone"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Email form */}
      {mode === "email" && (
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
        </form>
      )}

      {/* Phone form */}
      {mode === "phone" && !otpSent && (
        <div className="space-y-4">
          <div>
            <label htmlFor="reg-name-phone" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="reg-name-phone"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Phone number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Include country code (e.g. +1 for US)
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || !phone.trim() || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send verification code
          </button>
        </div>
      )}

      {mode === "phone" && otpSent && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We sent a code to <span className="font-medium text-foreground">{phone}</span>
          </p>
          <div>
            <label htmlFor="reg-otp" className="mb-1.5 block text-sm font-medium text-card-foreground">
              Verification code
            </label>
            <input
              id="reg-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              className="w-full rounded-xl border border-input bg-background py-2.5 px-4 text-center text-lg font-mono tracking-[0.5em] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify & create account
          </button>
          <button
            type="button"
            onClick={() => { setOtpSent(false); setOtp(""); }}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Use a different number
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </div>
  );
}
