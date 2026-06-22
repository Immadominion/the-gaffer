"use client";

import Link from "next/link";
import { Crown, Trophy } from "@/components/icons";
import { avatar, type LadderRow } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";

/* eslint-disable @next/next/no-img-element */

export default function LadderPage() {
  const g = useGameData();
  const ladder = g.ladder;
  const podium = g.podium;
  const [p1, p2, p3] = [podium[0], podium[1], podium[2]];

  // Honest "to overtake": the rating gap from you to the manager directly above.
  const youIdx = ladder.findIndex((r) => r.you);
  const toOvertake = youIdx > 0 ? `+${ladder[youIdx - 1]!.rating - ladder[youIdx]!.rating} pts` : "—";

  return (
    <div className="midpad">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="cd" style={{ fontSize: 24 }}>Squad Ladder</div>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#0A7E40", background: "#E7F6EC", padding: "7px 13px", borderRadius: 20 }}>
          {ladder.length} manager{ladder.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="row" style={{ marginTop: 22 }}>
        {/* LEFT */}
        <div className="col-main">
          {/* podium */}
          <div className="ink podium" style={{ padding: "26px 24px 0" }}>
            <div className="glow" style={{ left: "50%", top: -40, transform: "translateX(-50%)", width: 260, height: 200, background: "radial-gradient(circle,rgba(20,184,90,.22),transparent 65%)" }} />
            <PodiumCol entry={p2} place={2} barH={60} barBg="rgba(255,255,255,.08)" ratingColor="#B8C6BD" placeColor="#C0CABF" />
            <PodiumCol entry={p1} place={1} barH={86} barBg="linear-gradient(180deg,#14B85A,#0A8A41)" ratingColor="#8FE7B0" placeColor="#fff" crown ring="#F2B705" big />
            <PodiumCol entry={p3} place={3} barH={46} barBg="rgba(255,255,255,.08)" ratingColor="#B8C6BD" placeColor="#C0CABF" />
          </div>

          {/* table */}
          <div className="card" style={{ marginTop: 16, padding: "8px 8px" }}>
            {ladder.length === 0 && (
              <div style={{ padding: "28px 16px", textAlign: "center", color: "#8A988F", fontWeight: 600, fontSize: 14 }}>
                No managers on the ladder yet — sign the contract and make a call to take your place.
              </div>
            )}
            {ladder.map((row, i) => (
              <div key={row.rank}>
                {row.you ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: "linear-gradient(100deg,#E7F6EC,#F3FBF5)", borderRadius: 14, border: "1.5px solid #Bde7c9" }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 14, color: "#0A7E40", width: 24 }}>{row.rank}</span>
                    <img src={avatar(row.seed, row.bg)} style={{ width: 38, height: 38, borderRadius: "50%", background: "#d9f2e1", boxShadow: "0 0 0 2px #0BA14A" }} alt="" />
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "#0A5C30" }}>{row.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0BA14A" }}>{row.form}</span>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 14, width: 64, textAlign: "right", color: "#0A5C30" }}>{row.rating.toLocaleString()}</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px" }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 14, color: "#8A988F", width: 24 }}>{row.rank}</span>
                    <img src={avatar(row.seed, row.bg)} style={{ width: 38, height: 38, borderRadius: "50%", background: `#${row.bg}` }} alt="" />
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{row.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: row.formGood ? "#8A988F" : "#C2373B" }}>{row.form}</span>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 14, width: 64, textAlign: "right" }}>{row.rating.toLocaleString()}</span>
                  </div>
                )}
                {i < ladder.length - 1 && (
                  <div style={{ height: 1, background: "#EEF1EC", margin: "0 16px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* POT */}
        <div className="col-side w320">
          <div className="ink" style={{ padding: 24 }}>
            <div className="glow" style={{ right: -30, top: -30, width: 140, height: 140, background: "radial-gradient(circle,rgba(242,183,5,.25),transparent 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, position: "relative" }}>
              <Trophy size={22} weight="fill" color="#F2B705" />
              <span className="cd" style={{ fontSize: 14, letterSpacing: ".5px" }}>THE MANAGER&rsquo;S POT</span>
            </div>
            <div className="mono" style={{ fontWeight: 700, fontSize: 34, marginTop: 14, position: "relative" }}>
              {g.managersPot.toLocaleString()} <span style={{ fontSize: 15, color: "#8FE7B0" }}>WAL</span>
            </div>
            <div style={{ fontSize: 12, color: "#B8C6BD", marginTop: 4, position: "relative" }}>Paid out at the Final · top 10 split</div>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "18px 0", position: "relative" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, position: "relative" }}>
              <span style={{ fontSize: 12.5, color: "#B8C6BD", fontWeight: 600 }}>Funded by the rake</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "#8FE7B0" }}>2.5% / pot</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <span style={{ fontSize: 12.5, color: "#B8C6BD", fontWeight: 600 }}>To overtake the rank above</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{toOvertake}</span>
            </div>
          </div>
          <div className="card" style={{ marginTop: 16, padding: 18 }}>
            <div className="lbl">CLIMB FASTER</div>
            <p style={{ fontSize: 13, color: "#3A4A41", lineHeight: 1.45, margin: "8px 0 14px", fontWeight: 500 }}>
              Win the hard calls — the ones the crowd doesn&rsquo;t back. That&rsquo;s what moves your rating.
            </p>
            <Link href="/matchday" className="btnp" style={{ width: "100%", padding: 11, borderRadius: 12, fontSize: 13.5, textDecoration: "none" }}>
              Make a call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCol({
  entry,
  place,
  barH,
  barBg,
  ratingColor,
  placeColor,
  crown,
  ring,
  big,
}: {
  entry: LadderRow | undefined;
  place: number;
  barH: number;
  barBg: string;
  ratingColor: string;
  placeColor: string;
  crown?: boolean;
  ring?: string;
  big?: boolean;
}) {
  const size = big ? 66 : 54;
  const name = entry?.name ?? "—";
  const bg = entry?.bg ?? "1f3026";
  return (
    <div style={{ textAlign: "center", width: big ? 130 : 120, maxWidth: "31%", position: "relative" }}>
      {crown && <Crown size={24} weight="fill" color="#F2B705" />}
      {entry ? (
        <img
          src={avatar(entry.seed, bg)}
          style={{ width: size, height: size, borderRadius: "50%", background: `#${bg}`, boxShadow: `0 0 0 ${big ? 3 : 2}px ${ring ?? "#B8C6BD"}` }}
          alt=""
        />
      ) : (
        <div style={{ width: size, height: size, borderRadius: "50%", margin: "0 auto", background: "rgba(255,255,255,.06)", boxShadow: `0 0 0 ${big ? 3 : 2}px ${ring ?? "rgba(255,255,255,.15)"}` }} />
      )}
      <div style={{ fontSize: big ? 14 : 13, fontWeight: 700, color: "#fff", marginTop: 7 }}>{name}</div>
      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: ratingColor }}>{entry ? entry.rating.toLocaleString() : "—"}</div>
      <div
        className="cd"
        style={{ marginTop: 8, height: barH, background: barBg, borderRadius: "10px 10px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: big ? 9 : 8 }}
      >
        <span style={{ color: placeColor, fontSize: big ? 20 : 18 }}>{place}</span>
      </div>
    </div>
  );
}
