"use client";

import Link from "next/link";
import { Export, Gear } from "@/components/icons";
import { avatar } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";

/* eslint-disable @next/next/no-img-element */

const TRAIT_COLORS = [
  { fg: "#C2373B", bg: "#FBE9EA" },
  { fg: "#0A7E40", bg: "#E7F6EC" },
  { fg: "#C57A12", bg: "#FBF0DC" },
  { fg: "#5B6B62", bg: "#EEF2EB" },
];
const dotTone: Record<string, string> = { good: "#0BA14A", bad: "#C2373B", neutral: "#0BA14A", muted: "#C0CABF" };

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString([], { day: "2-digit", month: "short" }).toUpperCase();

type TLEntry = { date: string; text: string; tone: string; at: number };

export default function DossierPage() {
  const g = useGameData();
  const d = g.meRaw;
  const me = g.me;

  if (!me || !d) {
    return (
      <div className="midpad" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#8A988F", fontWeight: 600, fontSize: 14 }}>
        {g.loading ? "Opening your dossier…" : "No dossier yet — sign the contract to start your file."}
      </div>
    );
  }

  const gafferRead =
    d.lastVerdict?.text ??
    "The Gaffer's still building your file. Make some calls and he'll have plenty to say.";

  const timeline: TLEntry[] = [
    ...(d.lastVerdict ? [{ date: fmtDate(d.lastVerdict.at), text: d.lastVerdict.text, tone: "neutral", at: d.lastVerdict.at }] : []),
    ...d.landmarks.map((l) => ({ date: fmtDate(l.at), text: l.text, tone: "good", at: l.at })),
    ...d.hotTakes.map((h) => ({ date: fmtDate(h.at), text: `Declared: “${h.text}”`, tone: "neutral", at: h.at })),
    { date: fmtDate(d.signedAt), text: "Signed the contract", tone: "muted", at: d.signedAt },
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return (
    <div className="midpad">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="cd" style={{ fontSize: 24 }}>My Dossier</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", borderRadius: 11, padding: "10px 16px", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 8px rgba(16,35,26,.05)", color: "#0A7E40" }}
            title="Your record is written to Walrus by the backend after every result."
          >
            <Export size={16} weight="bold" color="#0BA14A" />
            On Walrus
          </span>
          <Link href="/settings" aria-label="Settings" style={{ width: 40, height: 40, borderRadius: 11, background: "#fff", boxShadow: "0 2px 8px rgba(16,35,26,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10231A" }}>
            <Gear size={18} weight="regular" />
          </Link>
        </div>
      </div>

      {/* identity */}
      <div className="card" style={{ marginTop: 22, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <img src={avatar(me.seed, me.bg)} style={{ width: 64, height: 64, borderRadius: "50%", background: "#d9f2e1", boxShadow: "0 0 0 2px #fff" }} alt="" />
        <div style={{ flex: 1 }}>
          <div className="cd" style={{ fontSize: 20 }}>{me.handle}</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>{me.sui}</div>
        </div>
        <Stat label={me.rated ? "RATING" : "UNRATED"} value={me.rated ? me.rating.toLocaleString() : "—"} mono />
        <Divider />
        <Stat label="RECORD" value={me.record} mono />
        <Divider />
        <div style={{ textAlign: "center", padding: "0 22px" }}>
          <div className="lbl">RANK</div>
          <div className="cd" style={{ fontSize: 18, marginTop: 5, color: "#0A7E40" }}>{me.rank ? `#${me.rank}` : "—"}</div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 22 }}>
        {/* LEFT */}
        <div className="col-main">
          <div className="ink" style={{ padding: 22 }}>
            <div className="glow" style={{ right: -30, bottom: -30, width: 140, height: 140, background: "radial-gradient(circle,rgba(20,184,90,.22),transparent 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative" }}>
              <img src="/img/gaffer.png" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", objectPosition: "50% 16%", background: "#1a2b22" }} alt="" />
              <div>
                <div className="cd" style={{ fontSize: 12, letterSpacing: "1px", color: "#8FE7B0" }}>THE GAFFER&rsquo;S READ ON YOU</div>
                <div style={{ fontSize: 11, color: "#7E8C84", marginTop: 1 }}>updated after every result</div>
              </div>
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 14.5, lineHeight: 1.5, fontWeight: 500, color: "#EAF3ED", position: "relative" }}>
              &ldquo;{gafferRead}&rdquo;
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            {d.traits.length === 0 && (
              <span style={{ fontSize: 12.5, color: "#8A988F", fontWeight: 600 }}>No traits distilled yet — the Gaffer needs a few calls to read you.</span>
            )}
            {d.traits.map((t, i) => {
              const c = TRAIT_COLORS[i % TRAIT_COLORS.length]!;
              return (
                <span key={t.key} title={t.evidence} style={{ fontSize: 12, fontWeight: 700, color: c.fg, background: c.bg, padding: "8px 14px", borderRadius: 20 }}>
                  {t.label}
                </span>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <Mini label="REALISED P&L" value={`${me.walWon >= 0 ? "+" : ""}${me.walWon}`} tone={me.walWon >= 0 ? "#0BA14A" : "#C2373B"} sub="WAL, all-time" />
            <Mini label="HIT RATE" value={`${me.hitRate}%`} tone="#10231A" sub={`${me.calls} calls made`} />
            <Mini label="CURRENT FORM" value={d.form.streak > 0 ? `${d.form.streakKind}${d.form.streak}` : "—"} tone={d.form.streakKind === "W" ? "#0BA14A" : "#10231A"} sub={d.form.hot ? "on a heater" : d.form.cold ? "ice cold" : "settling in"} />
          </div>
        </div>

        {/* TIMELINE */}
        <div className="col-side w340">
          <div className="card" style={{ padding: 22 }}>
            <div className="cd" style={{ fontSize: 16, marginBottom: 18 }}>Memory timeline</div>
            <div style={{ paddingLeft: 6, borderLeft: "2px solid #DCE4DA" }}>
              {timeline.map((t, i) => (
                <div key={`${t.at}-${i}`} style={{ position: "relative", padding: i === timeline.length - 1 ? "0 0 0 18px" : "0 0 18px 18px" }}>
                  <span style={{ position: "absolute", left: -7, top: 2, width: 10, height: 10, borderRadius: "50%", background: dotTone[t.tone], boxShadow: "0 0 0 3px #fff" }} />
                  <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: "#8A988F" }}>{t.date}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "0 22px" }}>
      <div className="lbl">{label}</div>
      <div className={mono ? "mono" : undefined} style={{ fontWeight: 700, fontSize: 22, marginTop: 3 }}>{value}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 42, background: "#EEF1EC" }} />;
}

function Mini({ label, value, tone, sub }: { label: string; value: string; tone: string; sub: string }) {
  return (
    <div className="card" style={{ flex: 1, padding: 18 }}>
      <div className="lbl">{label}</div>
      <div className="mono" style={{ fontWeight: 700, fontSize: 20, color: tone, marginTop: 5 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#8A988F", fontWeight: 600, marginTop: 2 }}>{sub}</div>
    </div>
  );
}
