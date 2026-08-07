"use client";

import { useAuth } from "@/context/AuthContext";
import { getClientPortalProfile, updatePortalProfile } from "@/lib/api";
import { KeyRound, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export function PortalSettings() {
  const { token } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [portalType, setPortalType] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    getClientPortalProfile(token)
      .then((p) => {
        setFullName(p.full_name);
        setEmail(p.email);
        setPortalType(p.portal_type);
      })
      .catch(() => {});
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setNotice(null);

    const payload: { full_name?: string; password?: string } = { full_name: fullName.trim() };
    if (password) {
      if (password.length < 6) {
        setNotice({ type: "err", text: "Password must be at least 6 characters." });
        setSaving(false);
        return;
      }
      if (password !== confirm) {
        setNotice({ type: "err", text: "Passwords do not match." });
        setSaving(false);
        return;
      }
      payload.password = password;
    }

    try {
      const updated = await updatePortalProfile(token, payload);
      setFullName(updated.full_name);
      setEmail(updated.email);
      setPassword("");
      setConfirm("");
      setNotice({ type: "ok", text: "Profile updated successfully." });
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm">
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
          <label className="mb-1.5 block text-sm font-medium text-ink">Portal email</label>
          <input value={email} readOnly className="w-full rounded-lg border border-border bg-gray-50 dark:bg-dark-4 px-4 py-2.5 text-sm text-muted-foreground outline-none" />
          <p className="mt-1 text-xs text-muted-foreground">Portal email cannot be changed.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Portal type</label>
          <input value={portalType} readOnly className="w-full rounded-lg border border-border bg-gray-50 dark:bg-dark-4 px-4 py-2.5 text-sm capitalize text-muted-foreground outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Account</label>
          <p className="text-xs text-muted-foreground">Active account</p>
        </div>

        {notice && (
          <p className={`text-sm ${notice.type === "ok" ? "text-green-600" : "text-red-500"}`}>{notice.text}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="size-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-dark-3 rounded-xl border border-border p-6 shadow-sm self-start">
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
        <p className="text-xs text-muted-foreground">Leave blank to keep your current password.</p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary disabled:opacity-50"
        >
          <KeyRound className="size-4" /> {saving ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
