"use client"

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { ApiError, getUserProfile, updateAdminProfile, UserMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { KeyRound, Save, UserRound } from "lucide-react";

export default function Page() {
  const { token, isLoading } = useAuth();
  const [profile, setProfile] = useState<UserMe | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (isLoading || !token) return;

    getUserProfile(token)
      .then((p) => {
        setProfile(p);
        setFullName(p.full_name);
        setEmail(p.email);
      })
      .catch((err) => {
        setProfileNotice({
          type: "err",
          text: err instanceof ApiError ? err.message : "Could not load your profile.",
        });
      })
      .finally(() => setProfileLoading(false));
  }, [token, isLoading]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setProfileNotice(null);

    try {
      const updated = await updateAdminProfile(token, {
        full_name: fullName.trim(),
        email: email.trim(),
      });
      setProfile(updated);
      setFullName(updated.full_name);
      setEmail(updated.email);
      setProfileNotice({ type: "ok", text: "Profile updated successfully." });
    } catch (err) {
      setProfileNotice({
        type: "err",
        text: err instanceof ApiError || err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setPasswordNotice(null);

    if (password.length < 8) {
      setPasswordNotice({ type: "err", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setPasswordNotice({ type: "err", text: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      await updateAdminProfile(token, { password });
      setPassword("");
      setConfirm("");
      setPasswordNotice({ type: "ok", text: "Password updated successfully." });
    } catch (err) {
      setPasswordNotice({
        type: "err",
        text: err instanceof ApiError || err instanceof Error ? err.message : "Failed to update password.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-242.5">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            {profileLoading ? "Loading your profile…" : `Signed in as ${profile?.full_name} · ${profile?.role}`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleProfileSubmit}
            className="space-y-5 bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              <h2 className="text-lg font-semibold text-ink">Profile</h2>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-border bg-white dark:bg-dark-4 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-white dark:bg-dark-4 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
                required
              />
            </div>

            {profileNotice && (
              <p className={`text-sm ${profileNotice.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                {profileNotice.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile || profileLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Save className="size-4" /> {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-5 bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm self-start"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              <h2 className="text-lg font-semibold text-ink">Change Password</h2>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-white dark:bg-dark-4 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-white dark:bg-dark-4 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </div>

            {passwordNotice && (
              <p className={`text-sm ${passwordNotice.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                {passwordNotice.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary disabled:opacity-50"
            >
              <KeyRound className="size-4" /> {savingPassword ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
