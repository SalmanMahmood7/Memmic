"use client"
import Link from "next/link";
import { Suspense, useState } from "react";
import { ApiError, registerUser } from "@/lib/api";
import { Field } from "@/components/ui-elements/field";
import { useRouter } from "next/navigation";

interface FormState {

  full_name: string;
  email: string;
  password: string;
  role_id: number;
}

const USER_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
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


export default function SignUpPage() {

  const [form, setForm] = useState<FormState>({ full_name: '', email: '', password: '', role_id: 1 })
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();


  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("Hello World")

    const nextError: Record<string, string> = {};

    if (Object.keys(nextError).length) {

      console.log("errors")
      setErrors(nextError);
      return;

    }

    setSubmitting(true);
    setErrors({});

    try {
      await registerUser({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role_id: form.role_id
      })

      router.push("/signin")
    } catch (err) {
      console.log(err)
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      }
    } finally {
      setSubmitting(false)
    }


  }

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  //   setForm({
  //     ...form,
  //     [e.target.name]: e.target.value,
  //   })
  // };

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
            Start your journey with verified demand.
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-background/70">
            Create an account to move capital across investment rails built for investors, admins, and managers.
          </p>
          <ul className="space-y-3 text-sm text-background/80">
            <li className="flex items-start gap-2.5">
              <CheckDot />
              Onboard in minutes, no paperwork chase
            </li>
            <li className="flex items-start gap-2.5">
              <CheckDot />
              A role-based workspace from day one
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
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start your journey with verified demand and investment rails.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <Suspense fallback={<div>Loading...</div>}>

              <div className="my-6 flex items-center justify-center">
                <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
                <div className="block w-full min-w-fit bg-white px-3 text-center font-medium dark:bg-gray-dark">
                  Or sign up with email
                </div>
                <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
              </div>

              <div>
                <form onSubmit={handleSubmit}>
                  {/* <InputGroup
                    type="text"
                    label="Name"
                    className="mb-4 [&_input]:py-3.75"
                    placeholder="Enter your name"
                    name="full_name"
                    handleChange={handleChange}
                    value={form.full_name}
                    // icon={}
                  /> */}
                  <Field
                  id="full_name"
                  label="Full Name"
                  icon={USER_ICON}
                  placeholder="Enter your full name"
                  required
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                />

                 <Field
                  id="email"
                  type="email"
                  label="Email Address"
                  icon={MAIL_ICON}
                  placeholder="Enter your email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                /> 

                  <Field
                  id="password"
                  type="password"
                  label="Password"
                  icon={LOCK_ICON}
                  placeholder="Create a password"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                />

                  <div className="mb-4.5">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="hover:bg-opacity-90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Sign Up
                      {submitting && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
                      )}
                    </button>
                  </div>

                  {/* {error && <p className="text-sm text-red-500">{error}</p>} */}
                </form>
              </div>

            </Suspense>
          </div>

          {errors.form && <p className="text-sm text-danger mb-4">{errors.form}</p>}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
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