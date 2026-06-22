"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { ArrowDown, Bank, CreditCard, ShieldCheck } from "@/components/icons";
import { useSession } from "@/lib/session";
import { useWalPrice } from "@/lib/useWalPrice";

const CHIPS = [25, 50, 100, 250];

/** "Add funds" — no-crypto deposit. Live: trpc.deposit.mutate({ amount }). */
export default function AddFundsModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone?: (amount: number) => void;
}) {
  const { deposit, busy } = useSession();
  const price = useWalPrice();
  const [amount, setAmount] = useState(50);
  const [method, setMethod] = useState<"card" | "transfer">("card");
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (amount <= 0) {
      onClose();
      return;
    }
    setError(null);
    try {
      await deposit(amount);
      onDone?.(amount);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Deposits settle on-chain — fund your Sui wallet, then transfer to the Sessions wallet.",
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} width={420}>
      <div style={{ padding: 26 }}>
        <h2 className="cd" style={{ fontSize: 22, margin: "0 0 4px" }}>Add funds</h2>
        <p style={{ fontSize: 13, color: "#6E7C72", margin: "0 0 18px" }}>Top up your balance to back your calls.</p>

        <div style={{ background: "#F3F6F1", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
            <input
              type="number"
              value={amount}
              min={0}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="mono"
              style={{ width: 130, textAlign: "right", border: "none", background: "transparent", outline: "none", fontSize: 38, fontWeight: 700, color: "#10231A" }}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#8A988F" }}>WAL</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: "#8A988F", marginTop: 4 }}>≈ {price !== null ? `$${(amount * price).toFixed(2)}` : "—"}</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => setAmount(c)}
              className="mono"
              style={{ flex: 1, background: amount === c ? "#E7F6EC" : "#F3F6F1", color: amount === c ? "#0A7E40" : "#10231A", border: "none", borderRadius: 11, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, margin: "18px 0 4px" }}>
          <MethodTab active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard size={17} weight={method === "card" ? "fill" : "regular"} />} label="Card" />
          <MethodTab active={method === "transfer"} onClick={() => setMethod("transfer")} icon={<Bank size={17} weight={method === "transfer" ? "fill" : "regular"} />} label="Crypto transfer" />
        </div>

        <button onClick={() => void confirm()} disabled={busy} className="btnp" style={{ width: "100%", padding: 14, borderRadius: 14, fontSize: 15, marginTop: 14, opacity: busy ? 0.6 : 1 }}>
          <ArrowDown size={16} weight="bold" />
          {busy ? "Processing…" : `Add ${amount} WAL`}
        </button>
        {error && <p style={{ fontSize: 12, color: "#C2373B", textAlign: "center", marginTop: 12, fontWeight: 600, lineHeight: 1.4 }}>{error}</p>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 11.5, fontWeight: 600, color: "#A6B2A9" }}>
          <ShieldCheck size={14} weight="fill" color="#0BA14A" />
          Held by the Sessions wallet · cash out anytime
        </div>
      </div>
    </Modal>
  );
}

function MethodTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: active ? "#fff" : "#F3F6F1", border: active ? "1.5px solid #0BA14A" : "1.5px solid transparent", color: active ? "#0A7E40" : "#6E7C72", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
    >
      {icon}
      {label}
    </button>
  );
}
