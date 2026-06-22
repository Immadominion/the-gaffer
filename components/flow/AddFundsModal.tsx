"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Modal from "@/components/ui/Modal";
import { ArrowDown, CheckCircle, ShieldCheck } from "@/components/icons";
import { useTRPC } from "@/lib/trpc";
import { useSession } from "@/lib/session";
import { frostToWal } from "@/lib/format";

/**
 * "Add funds" — custodial deposit. Each player's deposit address is their own
 * Privy Sui wallet; they send WAL to it and the backend sweeps it into the float
 * and credits their balance. "Check for my deposit" calls trpc.syncDeposit (safe
 * to mash — it's idempotent + reconciled).
 */
export default function AddFundsModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone?: (amount: number) => void;
}) {
  const trpc = useTRPC();
  const { refresh } = useSession();
  const addrQ = useQuery(trpc.depositAddress.queryOptions());
  const syncM = useMutation(trpc.syncDeposit.mutationOptions());
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const address = addrQ.data?.address ?? "";
  const available = addrQ.data?.available ?? false;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the address is visible to select manually */
    }
  };

  const check = async () => {
    setMsg(null);
    try {
      const r = await syncM.mutateAsync();
      const credited = frostToWal(r.credited);
      if (credited > 0) {
        setMsg({ ok: true, text: `Credited ${credited.toFixed(2)} WAL` });
        await refresh();
        onDone?.(credited);
      } else {
        setMsg({ ok: false, text: "No new deposit found yet — give it a moment after sending, then check again." });
      }
    } catch {
      setMsg({ ok: false, text: "Couldn't check just now — try again in a moment." });
    }
  };

  return (
    <Modal open={open} onClose={onClose} width={440}>
      <div style={{ padding: 26 }}>
        <h2 className="cd" style={{ fontSize: 22, margin: "0 0 4px" }}>Add funds</h2>
        <p style={{ fontSize: 13, color: "#6E7C72", margin: "0 0 18px" }}>
          Send WAL to your deposit address from any Sui wallet or exchange — it&rsquo;s credited to your balance automatically.
        </p>

        {!available ? (
          <div style={{ background: "#FBF6E9", borderRadius: 12, padding: 14, fontSize: 13, color: "#7A6A2E", fontWeight: 600 }}>
            {addrQ.isLoading ? "Loading your deposit address…" : "Deposits aren't enabled for this account yet."}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", color: "#8A988F" }}>YOUR DEPOSIT ADDRESS · SUI</div>
            <button
              onClick={() => void copy()}
              style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", gap: 12, background: "#F3F6F1", border: "1.5px solid #E7ECE3", borderRadius: 12, padding: "13px 14px", cursor: "pointer", textAlign: "left" }}
            >
              <span className="mono" style={{ flex: 1, fontSize: 12.5, color: "#10231A", wordBreak: "break-all", lineHeight: 1.4 }}>{address}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0A7E40", flex: "none", display: "flex", alignItems: "center", gap: 4 }}>
                {copied ? <><CheckCircle size={15} weight="fill" /> Copied</> : "Copy"}
              </span>
            </button>
            <div style={{ fontSize: 11.5, color: "#A6B2A9", fontWeight: 600, marginTop: 8 }}>
              Only send <b>WAL</b> on the <b>Sui</b> network to this address.
            </div>

            <button
              onClick={() => void check()}
              disabled={syncM.isPending}
              className="btnp"
              style={{ width: "100%", padding: 14, borderRadius: 14, fontSize: 15, marginTop: 18, opacity: syncM.isPending ? 0.6 : 1 }}
            >
              <ArrowDown size={16} weight="bold" />
              {syncM.isPending ? "Checking…" : "I've sent it — check for my deposit"}
            </button>
            {msg && (
              <p style={{ fontSize: 12.5, textAlign: "center", marginTop: 12, fontWeight: 700, lineHeight: 1.4, color: msg.ok ? "#0A7E40" : "#6E7C72" }}>
                {msg.text}
              </p>
            )}
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 11.5, fontWeight: 600, color: "#A6B2A9" }}>
          <ShieldCheck size={14} weight="fill" color="#0BA14A" /> Swept into the Sessions float · cash out anytime
        </div>
      </div>
    </Modal>
  );
}
