"use client";

import Link from "next/link";
import { ArrowRight, CaretRight, Clock, Fire, Trophy } from "@/components/icons";
import { flag } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";

/* eslint-disable @next/next/no-img-element */

export default function MatchdayPage() {
  const g = useGameData();
  const featured = g.featured;
  const list = g.matchday;

  if (!featured) {
    return (
      <div className="midpad" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#8A988F", fontWeight: 600, fontSize: 14 }}>
        {g.loading ? "Loading fixtures…" : "No fixtures are open right now — check back at kick-off."}
      </div>
    );
  }

  return (
    <div className="midpad">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>
          <div className="cd" style={{ fontSize: 24 }}>Matchday</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>{g.fixtures.length} fixtures open for calls · World Cup 2026</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#0A7E40", background: "#E7F6EC", padding: "7px 13px", borderRadius: 20 }}>{featured.group}</span>
      </div>

      {/* featured */}
      <Link href={`/call/${featured.matchId}`} style={{ display: "block", textDecoration: "none", color: "inherit", marginTop: 22 }}>
        <div style={{ background: "linear-gradient(120deg,#0E1A14,#13251B 70%)", borderRadius: 24, padding: "22px 24px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,90,.25),transparent 70%)" }} />
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <img src={flag(featured.home.code, 160)} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px rgba(255,255,255,.2)" }} alt="" />
            <img src={flag(featured.away.code, 160)} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px rgba(255,255,255,.2)", marginLeft: -16 }} alt="" />
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#14B85A", color: "#06200f", fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20 }}>
              <Fire size={12} weight="fill" /> Featured
            </span>
            <div className="cd" style={{ fontSize: 26, color: "#fff", marginTop: 10 }}>{featured.home.name} <span style={{ color: "#5B6B62" }}>vs</span> {featured.away.name}</div>
            <div style={{ fontSize: 12.5, color: "#B8C6BD", fontWeight: 600, marginTop: 4 }}>{featured.group} · {featured.koTag}</div>
          </div>
          <div style={{ position: "relative", textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", color: "#fff" }}>
              <Trophy size={15} weight="fill" color="#F2B705" />
              <span className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{featured.pot.toLocaleString()}</span>
            </div>
            <span className="btnp" style={{ fontSize: 13.5, padding: "10px 18px", borderRadius: 12, marginTop: 12 }}>
              Make a call <ArrowRight size={15} weight="bold" />
            </span>
          </div>
        </div>
      </Link>

      {/* list */}
      <div className="cd" style={{ fontSize: 16, margin: "26px 0 12px" }}>All fixtures</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((m) => (
          <Link key={m.matchId} href={`/call/${m.matchId}`} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={flag(m.home.code)} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff" }} alt="" />
              <img src={flag(m.away.code)} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff", marginLeft: -12 }} alt="" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cd" style={{ fontSize: 16 }}>{m.home.name} v {m.away.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>
                <Clock size={13} weight="fill" /> {m.ko} · {m.group}
              </div>
            </div>
            <div className="mono" style={{ display: "flex", gap: 10, fontSize: 12, fontWeight: 700, color: "#5B6B62" }}>
              <Odds k="1" v={m.pct.home} hot />
              <Odds k="X" v={m.pct.draw} />
              <Odds k="2" v={m.pct.away} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#8A988F" }}>{m.pot.toLocaleString()} WAL</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: "#0A7E40", marginTop: 4 }}>
                Call <CaretRight size={13} weight="bold" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Odds({ k, v, hot }: { k: string; v: number; hot?: boolean }) {
  return (
    <div style={{ textAlign: "center", minWidth: 34 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#A6B2A9" }}>{k}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: hot ? "#0BA14A" : "#5B6B62", marginTop: 1 }}>{v ? `${v}%` : "—"}</div>
    </div>
  );
}
