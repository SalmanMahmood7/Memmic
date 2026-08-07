"use client";

import { RefreshCw, ServerOff } from "lucide-react";

export function LoadingCard({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-white p-16">
      <div className="text-center">
        <RefreshCw className="mx-auto size-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-white p-10 text-center">
      <ServerOff className="mx-auto size-8 text-red-500" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        <RefreshCw className="size-4" /> Retry
      </button>
    </div>
  );
}
