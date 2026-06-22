"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AddFundsModal from "@/components/flow/AddFundsModal";
import { ArrowLeft, Clock, LockSimple } from "@/components/icons";
import { flag } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";
import { useTRPC } from "@/lib/trpc";
import { useSession } from "@/lib/session";
import { walToFrost } from "@/lib/format";

/* eslint-disable @next/next/no-img-element */

const abbr = (s: string) => s.slice(0, 3).toUpperCase();
const RAKE = 0.975;

const placeholderFixture = (matchId: string) => ({
  matchId,
  home: { name: "…", code: "" },
  away: { name: "…", code: "" },
  group: "",
  ko: "",
  koTag: "",
  pot: 0,
  pct: { home: 0, draw: 0, away: 0 },
});

export default function MakeCallPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const { session } = useSession();
  const g = useGameData();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const makeCallM = useMutation(trpc.makeCall.mutationOptions());

  const found = g.fixtureById(params.matchId);
  const fx = found ?? placeholderFixture(params.matchId);
  const balance = session.balance;

  const buckets = [
    { id: "HOME", label: abbr(fx.home.name), pct: fx.pct.home, team: fx.home.name },
    { id: "DRAW", label: "DRAW", pct: fx.pct.draw, team: "the draw" },
    { id: "AWAY", label: abbr(fx.away.name), pct: fx.pct.away, team: fx.away.name },
  ];

  const [pick, setPick] = useState("HOME");
  const [stake, setStake] = useState(() => Math.min(30, Math.max(0, balance)) || 30);
  const [funds, setFunds] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sel = buckets.find((b) => b.id === pick)!;
  const odds = 100 / Math.max(1, sel.pct);
  const projected = stake * odds * RAKE;
  const max = Math.max(balance, 0);
  const insufficient = stake <= 0 || stake > balance;

  const read =
    fx.matchId === g.featured?.matchId
      ? `You're 0–3 on Group F games this tournament. Backing ${fx.home.name} to break the curse, are we? Brave.`
      : sel.pct > 45
        ? `The crowd's on ${sel.team} at ${sel.pct}%. Safe. Tiny payout. You don't get paid for being safe.`
        : `${sel.pct}% on ${sel.team} — contrarian. If it lands, your rating jumps. If it doesn't, I'll remember.`;

  const lock = async () => {
    if (!found) return;
    if (insufficient) {
      setFunds(true);
      return;
    }
    setError(null);
    try {
      await makeCallM.mutateAsync({ matchId: found.matchId, marketId: "RESULT", bucket: pick, stake: walToFrost(stake) });
      await qc.invalidateQueries();
      setDone(true);
      setTimeout(() => router.push("/touchline"), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not lock the call. Try again.");
    }
  };

  const chips = [10, 30, 50];

  return (
    <div className="midpad">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/matchday" className="back"><ArrowLeft size={17} weight="bold" /></Link>
        <div className="cd" style={{ fontSize: 24 }}>Make a call</div>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#8A988F" }}>POT {fx.pot.toLocaleString()} WAL</span>
      </div>

      <div className="row" style={{ marginTop: 24 }}>
        {/* LEFT */}
        <div className="col-main">
          <div className="card" style={{ padding: 28, textAlign: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#C57A12", background: "#FBF0DC", padding: "5px 13px", borderRadius: 20 }}>
              <Clock size={13} weight="fill" />
              Kick-off {fx.ko} · {fx.group}
            </span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 46, marginTop: 22 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <img src={flag(fx.home.code, 160)} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff,0 4px 12px rgba(16,35,26,.14)" }} alt="" />
                <span className="cd" style={{ fontSize: 18 }}>{fx.home.name}</span>
              </div>
              <span className="cd" style={{ fontSize: 20, color: "#C0CABF" }}>VS</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <img src={flag(fx.away.code, 160)} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff,0 4px 12px rgba(16,35,26,.14)" }} alt="" />
                <span className="cd" style={{ fontSize: 18 }}>{fx.away.name}</span>
              </div>
            </div>
          </div>

          <div className="lbl" style={{ margin: "24px 0 12px" }}>YOUR CALL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {buckets.map((b) => {
              const on = b.id === pick;
              return (
                <button
                  key={b.id}
                  onClick={() => setPick(b.id)}
                  className={on ? "btnp" : undefined}
                  style={
                    on
                      ? { flexDirection: "column", borderRadius: 16, padding: "18px 6px", gap: 4 }
                      : { background: "#fff", border: "1.5px solid #E7ECE3", borderRadius: 16, padding: "18px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }
                  }
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: on ? "#fff" : "#10231A" }}>{b.label}</span>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: on ? "#fff" : "#5B6B62" }}>{b.pct}%</span>
                </button>
              );
            })}
          </div>

          <div className="ink" style={{ marginTop: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <img src="/img/gaffer.png" style={{ width: 48, height: 48, borderRadius: 13, objectFit: "cover", objectPosition: "50% 16%", background: "#1a2b22", flex: "none" }} alt="The Gaffer" />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#EAF3ED", lineHeight: 1.42 }}>&ldquo;{read}&rdquo;</span>
          </div>
        </div>

        {/* RIGHT STAKE */}
        <div className="col-side w360">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="lbl">STAKE</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#8A988F" }}>Balance {balance.toFixed(1)} WAL</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, margin: "18px 0" }}>
              <input
                type="number"
                value={stake}
                min={0}
                onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                className="mono"
                style={{ width: 120, textAlign: "right", border: "none", outline: "none", background: "transparent", fontSize: 44, fontWeight: 700, color: "#10231A" }}
              />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#8A988F" }}>WAL</span>
            </div>
            <div style={{ height: 6, background: "#EEF1EC", borderRadius: 6, position: "relative", marginBottom: 16 }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: `${Math.min(100, max ? (stake / max) * 100 : 0)}%`, background: "linear-gradient(90deg,#14B85A,#0A8A41)", borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              {chips.map((c) => (
                <button key={c} onClick={() => setStake(c)} className="mono" style={{ flex: 1, background: stake === c ? "#E7F6EC" : "#F3F6F1", color: stake === c ? "#0A7E40" : "#10231A", border: "none", borderRadius: 11, padding: 10, cursor: "pointer" }}>
                  <b>{c}</b>
                </button>
              ))}
              <button onClick={() => setStake(Math.floor(max))} className="mono" style={{ flex: 1, background: "#F3F6F1", border: "none", borderRadius: 11, padding: 10, cursor: "pointer" }}><b>MAX</b></button>
            </div>
            <div style={{ height: 1, background: "#EEF1EC", margin: "20px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6E7C72" }}>Odds</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{odds.toFixed(2)}×</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6E7C72" }}>If {sel.team === "the draw" ? "it's a draw" : `${sel.team} win`}</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 15, color: "#0BA14A" }}>+{Math.max(0, projected - stake).toFixed(1)} WAL</span>
            </div>
            <button onClick={() => void lock()} disabled={makeCallM.isPending || done} className="btnp" style={{ width: "100%", fontSize: 15, padding: 15, borderRadius: 14, opacity: done || makeCallM.isPending ? 0.7 : 1 }}>
              <LockSimple size={16} weight="fill" />
              {done ? "Call locked ✓" : makeCallM.isPending ? "Locking…" : insufficient ? "Add funds to call" : `Lock my call · ${stake} WAL`}
            </button>
            {error && <p style={{ fontSize: 12, color: "#C2373B", textAlign: "center", marginTop: 10, fontWeight: 600 }}>{error}</p>}
          </div>
        </div>
      </div>

      <AddFundsModal open={funds} onClose={() => setFunds(false)} />
    </div>
  );
}
