"use client";

/**
 * Live WAL→USD price for display-only estimates (deposit/withdraw modals). The
 * real economy is denominated in WAL/FROST end to end; this is purely a "≈ $X"
 * hint. Sourced from CoinGecko (id `walrus-2`), cached ~60s. Returns null while
 * loading or on error so the UI can show "—" rather than a fabricated price.
 */

import { useQuery } from "@tanstack/react-query";

const PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=walrus-2&vs_currencies=usd";

export function useWalPrice(): number | null {
  const { data } = useQuery({
    queryKey: ["wal-usd-price"],
    queryFn: async () => {
      const res = await fetch(PRICE_URL);
      if (!res.ok) throw new Error("price fetch failed");
      const json = (await res.json()) as { "walrus-2"?: { usd?: number } };
      const usd = json["walrus-2"]?.usd;
      return typeof usd === "number" && usd > 0 ? usd : null;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  return data ?? null;
}
