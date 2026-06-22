"use client";

import Link from "next/link";
import Image from "next/image";
import Gaffer3D from "@/components/Gaffer3D";
import { ArrowCounterClockwise, ShareNetwork, XCircle } from "@/components/icons";
import { useGameData } from "@/lib/useGameData";

export default function VerdictPage() {
  const g = useGameData();
  const v = g.settledCalls[0];
  const streak = g.meRaw?.form.streak ? `${g.meRaw.form.streakKind}${g.meRaw.form.streak}` : "—";
  const won = v?.outcome === "WON";
  const accent = won ? "#8FE7B0" : "#E56B6B";
  const accentBg = won ? "rgba(143,231,176,.15)" : "rgba(229,107,107,.15)";

  return (
    <div className="verdict-overlay">
      <div className="glow" style={{ left: "50%", top: "8%", transform: "translateX(-50%)", width: 460, height: 380, background: `radial-gradient(circle,${won ? "rgba(20,184,90,.3)" : "rgba(197,55,59,.3)"},transparent 65%)` }} />

      <Link
        href="/touchline"
        aria-label="Close"
        style={{ position: "fixed", top: 22, right: 22, width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.08)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
      >
        <XCircle size={22} weight="fill" />
      </Link>

      <div className="verdict-card">
        <Gaffer3D
          mood={won ? "approving" : "disappointed"}
          className="verdict-gaffer"
          dropShadow="drop-shadow(0 20px 36px rgba(0,0,0,.5))"
        />
        <div style={{ flex: 1, minWidth: 0, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Image src="/img/logo.png" alt="" width={24} height={24} style={{ objectFit: "contain" }} />
              <span className="cd" style={{ fontSize: 13, letterSpacing: "1px" }}>THE GAFFER</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, background: accentBg, padding: "6px 13px", borderRadius: 20 }}>
              VERDICT · {v?.outcome ?? "—"}
            </span>
          </div>

          {!v ? (
            <p style={{ margin: "26px 0 0", fontSize: 17, lineHeight: 1.5, fontWeight: 500, color: "#EAF3ED" }}>
              No verdicts yet. Make a call, let the match play, and I&rsquo;ll have plenty to say about it.
            </p>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".6px", color: "#7E8C84", marginTop: 22 }}>
                {v.home.name.toUpperCase()} v {v.away.name.toUpperCase()}
              </div>
              <div className="cd" style={{ fontSize: 46, marginTop: 4 }}>
                {v.score[0]}
                <span style={{ color: "#5B6B62" }}> – </span>
                {v.score[1]}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#B8C6BD", marginTop: 4 }}>
                You backed <span style={{ color: accent }}>{v.backed}</span>
              </div>
              <p style={{ margin: "20px 0 0", fontSize: 18, lineHeight: 1.45, fontWeight: 500, color: "#EAF3ED", fontStyle: "italic" }}>
                &ldquo;{v.line}&rdquo;
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <VBox label="P&L" value={v.pnl} tone={accent} />
                <VBox label="RATING" value={v.gr} tone={accent} />
                <VBox label="STREAK" value={streak} tone="#fff" />
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btnp" style={{ flex: 1, fontSize: 15, padding: 14, borderRadius: 14 }}>
              <ShareNetwork size={17} weight="fill" />
              Share the verdict
            </button>
            <Link
              href="/matchday"
              style={{ background: "rgba(255,255,255,.08)", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              {v ? "Rematch" : "Make a call"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function VBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: 14, padding: 13 }}>
      <div className="lbl" style={{ color: "#7E8C84" }}>{label}</div>
      <div className="mono" style={{ fontWeight: 700, fontSize: 18, color: tone, marginTop: 3 }}>{value}</div>
    </div>
  );
}
