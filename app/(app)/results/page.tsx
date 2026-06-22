"use client";

import Link from "next/link";
import { ArrowRight, ShareNetwork, ChatCircleDots } from "@/components/icons";
import { flag, type SettledCall } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";

/* eslint-disable @next/next/no-img-element */

const tone: Record<SettledCall["outcome"], { fg: string; bg: string }> = {
  WON: { fg: "#0A7E40", bg: "#E7F6EC" },
  LOST: { fg: "#C2373B", bg: "#FBE9EA" },
  VOID: { fg: "#5B6B62", bg: "#EEF2EB" },
};

export default function ResultsPage() {
  const g = useGameData();
  const results = g.settledCalls;

  return (
    <div className="midpad">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>
          <div className="cd" style={{ fontSize: 24 }}>Results</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>Every call, settled and on the record</div>
        </div>
        <Link href="/dossier" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#0BA14A", textDecoration: "none" }}>Your dossier</Link>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ marginTop: 22, padding: "40px 24px", textAlign: "center" }}>
          <div className="cd" style={{ fontSize: 18 }}>{g.loading ? "Loading your results…" : "Nothing settled yet"}</div>
          {!g.loading && (
            <>
              <p style={{ fontSize: 14, color: "#6E7C72", margin: "10px 0 18px" }}>
                Make a call and the Gaffer settles it the moment the match finishes — win or lose, it goes on your record.
              </p>
              <Link href="/matchday" className="btnp" style={{ padding: "12px 22px", borderRadius: 13, textDecoration: "none" }}>
                Make a call <ArrowRight size={15} weight="bold" />
              </Link>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
          {results.map((r) => {
            const t = tone[r.outcome];
            return (
              <div key={r.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img src={flag(r.home.code)} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff" }} alt="" />
                    <img src={flag(r.away.code)} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff", marginLeft: -12 }} alt="" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cd" style={{ fontSize: 16 }}>
                      {r.home.name} <span className="mono" style={{ color: "#5B6B62", fontWeight: 700 }}>{r.score[0]}–{r.score[1]}</span> {r.away.name}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>You backed {r.backed} · {r.when}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.fg, background: t.bg, padding: "6px 12px", borderRadius: 20 }}>{r.outcome}</span>
                </div>

                <div style={{ display: "flex", gap: 22, marginTop: 14, paddingTop: 14, borderTop: "1px solid #EEF1EC" }}>
                  <Stat label="P&L" value={r.pnl} tone={r.outcome === "WON" ? "#0BA14A" : r.outcome === "LOST" ? "#C2373B" : "#10231A"} />
                  <Stat label="RATING" value={r.gr} tone={r.outcome === "WON" ? "#0BA14A" : r.outcome === "LOST" ? "#C2373B" : "#10231A"} />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, background: "#0E1A14", borderRadius: 14, padding: "12px 14px" }}>
                  <ChatCircleDots size={16} weight="fill" color="#8FE7B0" style={{ marginTop: 1, flex: "none" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#EAF3ED", lineHeight: 1.42 }}>&ldquo;{r.line}&rdquo;</span>
                </div>

                {r.outcome !== "VOID" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <Link href="/verdict" className="btnp" style={{ fontSize: 13.5, padding: "10px 18px", borderRadius: 12, textDecoration: "none" }}>
                      <ShareNetwork size={15} weight="fill" /> See the Verdict
                    </Link>
                    <Link href="/matchday" style={{ display: "flex", alignItems: "center", gap: 6, background: "#F3F6F1", color: "#10231A", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 12, textDecoration: "none" }}>
                      Make another <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="lbl">{label}</div>
      <div className="mono" style={{ fontWeight: 700, fontSize: 16, color: tone, marginTop: 3 }}>{value}</div>
    </div>
  );
}
