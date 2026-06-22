"use client";

import { useState } from "react";
import AddFundsModal from "@/components/flow/AddFundsModal";
import CashOutModal from "@/components/flow/CashOutModal";
import { ArrowDown, ArrowUp, LockSimple, Trophy, XCircle } from "@/components/icons";
import { flag, type WalletEntry } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";
import { useSession } from "@/lib/session";
import { flagCode, frostToWal, shortWallet } from "@/lib/format";

/* eslint-disable @next/next/no-img-element */

const tile: Record<WalletEntry["kind"], { bg: string; node: React.ReactNode }> = {
  stake: { bg: "#E7F6EC", node: <LockSimple size={18} weight="fill" color="#0BA14A" /> },
  loss: { bg: "#FBE9EA", node: <XCircle size={18} weight="fill" color="#C2373B" /> },
  win: { bg: "#E7F6EC", node: <Trophy size={18} weight="fill" color="#0BA14A" /> },
  deposit: { bg: "#E6EDFF", node: <ArrowDown size={18} weight="fill" color="#2F6BFF" /> },
};

const amtColor: Record<WalletEntry["amountTone"], string | undefined> = {
  neutral: undefined,
  bad: "#C2373B",
  good: "#0BA14A",
  blue: "#2F6BFF",
};

const pickLabel = (bucket: string, home: string, away: string) =>
  bucket === "HOME" ? home : bucket === "AWAY" ? away : "Draw";

export default function WalletPage() {
  const { session } = useSession();
  const g = useGameData();
  const [add, setAdd] = useState(false);
  const [out, setOut] = useState(false);

  const available = session.balance;
  const staked = session.staked;
  const total = available + staked;

  const openCalls = g.meRaw?.openCalls ?? [];
  const activity: WalletEntry[] = openCalls.map((c) => {
    const m = g.matchById(c.matchId);
    const home = m?.fixture.home ?? "Home";
    const away = m?.fixture.away ?? "Away";
    return {
      kind: "stake",
      title: `Staked · ${pickLabel(c.bucket, home, away)}`,
      sub: `${home} v ${away}`,
      amount: `−${frostToWal(c.stake).toFixed(1)}`,
      amountTone: "neutral",
    };
  });

  return (
    <div className="midpad">
      <div className="cd" style={{ fontSize: 24 }}>Wallet</div>

      <div className="row" style={{ marginTop: 22 }}>
        {/* LEFT */}
        <div className="col-main">
          <div className="ink" style={{ padding: 26 }}>
            <div className="glow" style={{ right: -30, top: -30, width: 150, height: 150, background: "radial-gradient(circle,rgba(20,184,90,.3),transparent 70%)" }} />
            <div className="lbl" style={{ color: "#8FE7B0", position: "relative" }}>TOTAL BALANCE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8, position: "relative" }}>
              <span className="mono" style={{ fontWeight: 700, fontSize: 42 }}>{total.toFixed(1)}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#8FE7B0" }}>WAL</span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "#B8C6BD", marginTop: 3, position: "relative" }}>
              {session.wallet ? shortWallet(session.wallet) : "your Sui wallet"}
            </div>
            {session.bonus > 0 && (
              <div className="mono" style={{ fontSize: 11, color: "#8FE7B0", marginTop: 4, position: "relative" }}>
                incl. {session.bonus.toFixed(1)} starter bonus · play only, not withdrawable
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 22, position: "relative" }}>
              <button onClick={() => setAdd(true)} style={{ background: "#fff", color: "#0E1A14", border: "none", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                <ArrowDown size={16} weight="bold" />
                Deposit
              </button>
              <button onClick={() => setOut(true)} style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                <ArrowUp size={16} weight="bold" />
                Withdraw
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 18, padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
              <div className="cd" style={{ fontSize: 16 }}>Activity</div>
            </div>
            <div style={{ height: 1, background: "#EEF1EC", margin: "0 18px" }} />
            {activity.length === 0 && (
              <div style={{ padding: "22px 18px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#8A988F" }}>
                No activity yet — make a call and your stakes show up here.
              </div>
            )}
            {activity.map((e, i) => (
              <div key={`${e.title}-${i}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: tile[e.kind].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{tile[e.kind].node}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: "#8A988F", fontWeight: 600 }}>{e.sub}</div>
                  </div>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 14, color: amtColor[e.amountTone] }}>{e.amount}</span>
                </div>
                {i < activity.length - 1 && <div style={{ height: 1, background: "#EEF1EC", margin: "0 18px" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-side w320">
          <div style={{ display: "flex", gap: 14 }}>
            <div className="card" style={{ flex: 1, padding: 18 }}>
              <div className="lbl">AVAILABLE</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 20, marginTop: 5 }}>{available.toFixed(1)}</div>
            </div>
            <div className="card" style={{ flex: 1, padding: 18 }}>
              <div className="lbl">STAKED</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 20, color: "#0BA14A", marginTop: 5 }}>{staked.toFixed(1)}</div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14, padding: 20 }}>
            <div className="cd" style={{ fontSize: 16, marginBottom: 14 }}>Open stakes</div>
            {openCalls.length > 0 ? (
              openCalls.map((c) => {
                const m = g.matchById(c.matchId);
                const home = m?.fixture.home ?? "Home";
                const away = m?.fixture.away ?? "Away";
                return (
                  <div key={c.callId} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img src={flag(flagCode(home) ?? "")} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff" }} alt="" />
                      <img src={flag(flagCode(away) ?? "")} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff", marginLeft: -9 }} alt="" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{pickLabel(c.bucket, home, away)}</div>
                      <div style={{ fontSize: 11, color: "#8A988F", fontWeight: 600 }}>{home} v {away}</div>
                    </div>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "#0BA14A" }}>{frostToWal(c.stake).toFixed(1)}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ background: "#F3F6F1", borderRadius: 12, padding: 12, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#8A988F" }}>No open stakes</div>
            )}
          </div>
        </div>
      </div>

      <AddFundsModal open={add} onClose={() => setAdd(false)} />
      <CashOutModal open={out} onClose={() => setOut(false)} />
    </div>
  );
}
