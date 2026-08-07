"use client";

import { useAuth } from "@/context/AuthContext";
import { getPortalDashboard, PortalDashboard } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePortalDashboard(portalType?: string) {
  const { token } = useAuth();
  const [data, setData] = useState<PortalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    getPortalDashboard(token, portalType)
      .then((d) => {
        if (!cancelled && mounted.current) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled && mounted.current) {
          setError(e?.message ?? "Failed to load dashboard");
        }
      })
      .finally(() => {
        if (!cancelled && mounted.current) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, refreshKey, portalType]);

  return { data, loading, error, refresh };
}
