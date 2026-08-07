"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";import Link from "next/link";
import { useAuth, panelPathForRole } from '@/context/AuthContext';
import { Checkbox } from "@/components/FormElements/checkbox";
import { ApiError, loginUser } from "@/lib/api";
import { decodeJwtPayload } from "@/lib/jwt";
import { Field } from "@/components/ui-elements/field";
import { Icon } from "lucide-react";


interface FormState {

  email: string,
  password: string,
}

const MAIL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
  </svg>
);
const LOCK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function PasswordField({
  label, icon, error, value, onChange, placeholder, id,
}: { label: string; icon: React.ReactNode; error?: string; value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.82rem] font-semibold text-ink">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none">{icon}</span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          minLength={8}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full text-[0.92rem] border-stroke py-3 pl-[42px] pr-10 rounded-[10px] border-[1.5px] bg-[#FBFCFE] text-ink outline-none transition-colors focus:bg-white`}
        />
        <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted" aria-label="Toggle password visibility">
          {!visible ? (
          /* Eye Open SVG */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          /* Eye Closed SVG */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
          
        </button>
      </div>
      {/* {error && <span className="text-[0.74rem] text-danger">{error}</span>} */}
    </div>
  );
}

function SignInPageContent() {
  const router = useRouter();
  const { setTokens, token, role, isLoading } = useAuth();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);



  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const tokens = await loginUser(form.email, form.password);
      setTokens(tokens.access_token, tokens.refresh_token, rememberMe);
      const payload = decodeJwtPayload<{ role?: string }>(tokens.access_token);
      router.push(panelPathForRole(payload?.role ?? null));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (isLoading) return;

    if (token) {
      router.push(panelPathForRole(role));
    }
  }, [token, role, isLoading, router]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <aside className="relative hidden w-[42%] max-w-xl flex-col justify-between overflow-hidden bg-foreground px-12 py-12 text-background lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <RailsMotif className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]" />

        <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight">
          MEMMIC
        </Link>

        <div className="relative z-10 max-w-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-background/60">
            AmanorX Holdings · Financial Platform
          </p>
          <h1 className="mb-4 text-4xl font-semibold leading-[1.15] tracking-tight">
            Verified demand.
            <br />
            Real investment rails.
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-background/70">
            One workspace for investors, admins, and managers to move capital with confidence.
          </p>
          <ul className="space-y-3 text-sm text-background/80">
            <li className="flex items-start gap-2.5">
              <CheckDot />
              Role-based access for investors, admins, and managers
            </li>
            <li className="flex items-start gap-2.5">
              <CheckDot />
              Live visibility into verified investor demand
            </li>
            <li className="flex items-start gap-2.5">
              <CheckDot />
              A single, auditable record for every commitment
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-background/50">
          © {new Date().getFullYear()} AmanorX Holdings. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
              MEMMIC
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">AmanorX Holdings Financial Platform</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back. Enter your details to access your workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
              >
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4.5">
                
              </div>

              <div className="mb-4.5">

                <Field
                  id="email"
                  type="email"
                  label="Email Address"
                  icon={MAIL_ICON}
                  placeholder="Enter your email"
                  required
                  value={form.email}
                  // onChange={(e) => setEmail(e.target.value)}
                  onChange={(e) => set('email', e.target.value)}
                />
                <PasswordField id="password" label="Password *" icon={LOCK_ICON} placeholder="Create a password"
                  value={form.password} onChange={(v) => set('password', v)} />
              </div>

              <div className="mb-6 mt-2 flex items-center justify-between">
                <Checkbox label="Remember me" minimal withBg withIcon="check" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                {/* <div className="flex items-center gap-4">
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div> */}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && <Spinner />}
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>


          {/* <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p> */}
        </div>
      </main>
    </div>
  );
}

function RailsMotif({ className }: { className?: string }) {
  const lines = [60, 150, 240, 330, 420, 510];
  return (
    <svg
      viewBox="0 0 480 560"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {lines.map((y, i) => (
        <g key={y} stroke="currentColor" strokeWidth="1">
          <line x1="0" y1={y} x2="480" y2={y} />
          {[40, 160, 300, 420].map((x, j) => (
            <circle key={x} cx={x + (i % 2) * 30} cy={y} r={j === 1 ? 4 : 2.5} fill="currentColor" stroke="none" />
          ))}
        </g>
      ))}
      <circle r="3.5" fill="currentColor" className="motion-reduce:hidden">
        <animateMotion dur="7s" repeatCount="indefinite" path="M0,60 L480,60" />
      </circle>
    </svg>
  );
}

function CheckDot() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-background/70">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8.2l1.8 1.8L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 6.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="13.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={null}>
      <SignInPageContent />
    </React.Suspense>
  );
}