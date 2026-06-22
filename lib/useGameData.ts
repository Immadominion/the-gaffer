"use client";

/**
 * The read side: live game data from the backend, shaped for the screens. Public
 * queries (fixtures, ladder, the Manager's Pot) load for everyone; the player's
 * own slice (me, open calls) loads once Privy says they're authenticated. React
 * Query dedupes the `me` fetch this shares with SessionProvider.
 */

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useTRPC } from "@/lib/trpc";
import { toFixture, toLadder, toOpenCall, toPlayer, toSettledCall } from "@/lib/adapters";
import { frostToWal } from "@/lib/format";

export function useGameData() {
  const trpc = useTRPC();
  const { authenticated } = usePrivy();

  const matchesQ = useQuery(trpc.matchday.queryOptions());
  const ladderQ = useQuery(trpc.leaderboard.queryOptions({ by: "gr", limit: 50 }));
  const potQ = useQuery(trpc.managersPot.queryOptions());
  const meQ = useQuery({ ...trpc.me.queryOptions(), enabled: authenticated, retry: false });
  const settledQ = useQuery({ ...trpc.settledCalls.queryOptions({ limit: 50 }), enabled: authenticated, retry: false });

  const matches = matchesQ.data ?? [];
  const fixtures = matches.filter((m) => m.status === "OPEN").map(toFixture);

  const myWallet = meQ.data?.wallet;
  const myRank = myWallet ? ladderQ.data?.find((r) => r.wallet === myWallet)?.rank ?? 0 : 0;
  const me = meQ.data ? toPlayer(meQ.data, myRank) : null;
  const ladder = toLadder(ladderQ.data ?? [], myWallet);

  const firstCall = meQ.data?.openCalls?.[0];
  const callMatch = firstCall ? matches.find((m) => m.fixture.matchId === firstCall.matchId) : undefined;
  const openCall = firstCall ? toOpenCall(firstCall, callMatch) : null;

  const settledCalls = (settledQ.data ?? []).map((c) =>
    toSettledCall(c, matches.find((m) => m.fixture.matchId === c.matchId)),
  );

  return {
    loading: matchesQ.isLoading,
    error: matchesQ.error,
    fixtures,
    featured: fixtures[0] ?? null,
    matchday: fixtures.slice(1),
    matches,
    fixtureById: (id: string) => fixtures.find((f) => f.matchId === id) ?? null,
    matchById: (id: string) => matches.find((m) => m.fixture.matchId === id) ?? null,
    me,
    meRaw: meQ.data ?? null, // full DossierView (traits, landmarks, verdict, open calls)
    ladder,
    podium: ladder.slice(0, 3),
    managersPot: Math.round(frostToWal(potQ.data ?? 0n)),
    openCall,
    settledCalls,
  };
}
