"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createRealtimeClient, type RealtimeClient } from "@neon/realtime/client";
import { RealtimeProvider } from "@neon/realtime-react";

const realtimeUrl = process.env.NEXT_PUBLIC_NEON_REALTIME_URL || "";

const RealtimeEnabledContext = createContext(false);

export function useRealtimeEnabled() {
  return useContext(RealtimeEnabledContext);
}

export function RealtimeRoot({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<RealtimeClient | null>(null);

  useEffect(() => {
    if (!realtimeUrl) return;
    let cancelled = false;
    let instance: RealtimeClient | null = null;

    Promise.resolve().then(() => {
      if (cancelled) return;
      instance = createRealtimeClient({ url: realtimeUrl });
      setClient(instance);
    });

    return () => {
      cancelled = true;
      instance?.close();
    };
  }, []);

  if (!client) {
    return (
      <RealtimeEnabledContext.Provider value={false}>
        {children}
      </RealtimeEnabledContext.Provider>
    );
  }

  return (
    <RealtimeEnabledContext.Provider value={true}>
      <RealtimeProvider client={client}>{children}</RealtimeProvider>
    </RealtimeEnabledContext.Provider>
  );
}
