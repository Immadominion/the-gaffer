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
import { frostToWal, walToFrost } from "@/lib/format";

/* eslint-disable @next/next/no-img-element */

const abbr = (s: string) => s.slice(0, 3).toUpperCase();
const RAKE_BPS = 250; // 2.5% — taken from the losers' pool only (must match backend)

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
  const [stake, setStake] = useState(() => Math.min(2, Math.max(0, balance)) || 1);
  const [funds, setFunds] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sel = buckets.find((b) => b.id === pick)!;

  // ── Real parimutuel projection from the LIVE pool ──────────────────────────
  // If your outcome wins, you get your stake back plus a pro-rata share of the
  // stake on the OTHER outcomes (the losers' pool), less the rake. Empty pool ⇒
  // nothing to win yet.
  const resultMarket = (g.matchById(params.matchId)?.markets ?? []).find((m) => m.marketId === "RESULT");
  const poolOf = (bucket: string) => {
    const b = resultMarket?.buckets.find((x) => x.bucket === bucket);
    return b ? frostToWal(b.stake) : 0;
  };
  const totalPool = poolOf("HOME") + poolOf("DRAW") + poolOf("AWAY");
  const myBucketPool = poolOf(pick);
  const losersPool = Math.max(0, totalPool - myBucketPool); // your potential winnings come from here
  const newWinnersStake = myBucketPool + stake;
  const distributable = losersPool * (1 - RAKE_BPS / 10000);
  const profit = newWinnersStake > 0 ? (stake / newWinnersStake) * distributable : 0;
  const returnMult = stake > 0 ? (stake + profit) / stake : 1;

  const max = Math.max(balance, 0);
  const insufficient = stake <= 0 || stake > balance;

  const read =
    totalPool === 0
      ? `Nobody's in yet — you'd set the line. Back ${sel.team} and the crowd reacts to you.`
      : sel.pct > 45
        ? `The crowd's on ${sel.team} at ${sel.pct}%. Safe — and a thin payout. You don't get paid for being safe.`
        : `${sel.pct}% on ${sel.team} — contrarian. If it lands, your rating jumps and you scoop the pool.`;

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

  const chips = [1, 2, 5].filter((c) => c <= Math.max(max, 1));

  return (
    <div className="midpad">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/matchday" className="back"><ArrowLeft size={17} weight="bold" /></Link>
        <div className="cd" style={{ fontSize: 24 }}>Make a call</div>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#8A988F" }}>POT {totalPool.toLocaleString(undefined, { maximumFractionDigits: 1 })} WAL</span>
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
                  <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: on ? "#fff" : "#5B6B62" }}>{totalPool > 0 ? `${b.pct}%` : "—"}</span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11.5, color: "#A6B2A9", fontWeight: 500, marginTop: 8 }}>
            {totalPool > 0 ? "% = share of the pot backing each outcome (the crowd's odds)." : "No bets yet — be the first and you set the crowd's line."}
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
                step={0.5}
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
              <button onClick={() => setStake(Math.round(max * 100) / 100)} className="mono" style={{ flex: 1, background: "#F3F6F1", border: "none", borderRadius: 11, padding: 10, cursor: "pointer" }}><b>MAX</b></button>
            </div>
            <div style={{ height: 1, background: "#EEF1EC", margin: "20px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6E7C72" }}>Backing other outcomes</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{losersPool.toFixed(1)} WAL</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6E7C72" }}>If {sel.team === "the draw" ? "it's a draw" : `${sel.team} win`}</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 15, color: profit > 0 ? "#0BA14A" : "#8A988F" }}>
                {profit > 0 ? `+${profit.toFixed(1)} WAL` : "stake back"}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#A6B2A9", fontWeight: 500, lineHeight: 1.4, margin: "0 0 16px" }}>
              {losersPool > 0
                ? `≈ ${returnMult.toFixed(2)}× — a pro-rata share of the ${losersPool.toFixed(1)} WAL on the other outcomes, less a 2.5% rake. Grows as more back against you.`
                : "Your winnings come from people who call it wrong — nothing's against you yet. Needs 3+ players or all stakes are refunded."}
            </p>
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
