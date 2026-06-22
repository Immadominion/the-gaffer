"use client";

/**
 * Client session — "who's signed in and what's in the bank" — now backed by the
 * live system. Identity comes from Privy (email/social/wallet → an embedded Sui
 * wallet); money + standing come from the backend Dossier (the `me` query).
 *
 *   login()              ->  Privy modal, then the access token authenticates tRPC
 *   signContract(handle) ->  trpc.signContract.mutate({ handle })
 *   deposit(wal, proof)  ->  trpc.deposit.mutate({ amount, proof })   (custody verifies on-chain)
 *   withdraw(wal)        ->  trpc.withdraw.mutate({ amount })
 *
 * Calls are placed with trpc.makeCall on the Call screen; the resulting balance
 * change flows back through the `me` query. The Trial + spotlight tour are local
 * onboarding flags, persisted to localStorage.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";
import { frostToWal, walToFrost } from "@/lib/format";

export type Session = {
  status: "guest" | "signed";
  handle: string;
  wallet: string;
  balance: number; // spendable WAL (free + bonus) — what you can stake
  withdrawable: number; // free WAL only — what you can cash out
  bonus: number; // non-withdrawable starter bonus
  staked: number; // locked WAL
  onboarded: boolean; // completed The Trial
  tourDone: boolean; // seen the spotlight tour
};

const LOCAL_KEY = "gaffer.onboarding.v1";

type Ctx = {
  session: Session;
  ready: boolean; // safe to make routing decisions (Privy settled + me resolved)
  authReady: boolean;
  authenticated: boolean;
  busy: boolean; // a write is in flight
  login: () => void;
  signContract: (handle: string) => Promise<void>;
  deposit: (wal: number, proof?: string) => Promise<void>;
  withdraw: (wal: number) => Promise<void>;
  claimWelcomeGrant: () => Promise<void>;
  refresh: () => void;
  completeTrial: () => void;
  completeTour: () => void;
  signOut: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { ready: authReady, authenticated, login, logout } = usePrivy();

  const meQ = useQuery({ ...trpc.me.queryOptions(), enabled: authenticated, retry: false, staleTime: 5_000 });

  // Local onboarding flags (The Trial + the spotlight tour).
  const [local, setLocal] = useState({ onboarded: false, tourDone: false });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setLocal((l) => ({ ...l, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, []);
  const persistLocal = useCallback((next: { onboarded: boolean; tourDone: boolean }) => {
    setLocal(next);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const dossier = meQ.data ?? null;
  const signed = authenticated && !!dossier;

  const session: Session = {
    status: signed ? "signed" : "guest",
    handle: dossier?.handle ?? "",
    wallet: dossier?.wallet ?? "",
    balance: dossier ? frostToWal(dossier.balance + dossier.bonus) : 0,
    withdrawable: dossier ? frostToWal(dossier.balance) : 0,
    bonus: dossier ? frostToWal(dossier.bonus) : 0,
    staked: dossier ? frostToWal(dossier.locked) : 0,
    onboarded: local.onboarded,
    tourDone: local.tourDone,
  };

  // Ready to route once Privy has settled and (if logged in) `me` resolved once.
  const ready = authReady && (!authenticated || !meQ.isLoading);

  const signContractM = useMutation(trpc.signContract.mutationOptions());
  const depositM = useMutation(trpc.deposit.mutationOptions());
  const withdrawM = useMutation(trpc.withdraw.mutationOptions());
  const grantM = useMutation(trpc.claimWelcomeGrant.mutationOptions());
  const busy = signContractM.isPending || depositM.isPending || withdrawM.isPending || grantM.isPending;

  const invalidateMe = useCallback(
    () => qc.invalidateQueries({ queryKey: trpc.me.queryKey() }),
    [qc, trpc],
  );

  const value: Ctx = {
    session,
    ready,
    authReady,
    authenticated,
    busy,
    login,
    signContract: async (handle: string) => {
      await signContractM.mutateAsync({ handle: handle || undefined });
      await invalidateMe();
    },
    deposit: async (wal: number, proof?: string) => {
      await depositM.mutateAsync({ amount: walToFrost(wal), proof });
      await invalidateMe();
    },
    withdraw: async (wal: number) => {
      await withdrawM.mutateAsync({ amount: walToFrost(wal) });
      await invalidateMe();
    },
    claimWelcomeGrant: async () => {
      await grantM.mutateAsync();
      await invalidateMe();
    },
    refresh: () => void invalidateMe(),
    completeTrial: () => persistLocal({ ...local, onboarded: true }),
    completeTour: () => persistLocal({ ...local, tourDone: true }),
    signOut: () => {
      void logout();
      persistLocal({ onboarded: false, tourDone: false });
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
