import Link from "next/link";
import Image from "next/image";
import { SealCheck } from "@/components/icons";
import { avatar } from "@/lib/data";
import { serverTrpc } from "@/lib/serverTrpc";

/* eslint-disable @next/next/no-img-element */

const TRAIT_COLORS = [
  { fg: "#C2373B", bg: "#FBE9EA" },
  { fg: "#0A7E40", bg: "#E7F6EC" },
  { fg: "#C57A12", bg: "#FBF0DC" },
  { fg: "#5B6B62", bg: "#EEF2EB" },
];
const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString([], { day: "2-digit", month: "short" }).toUpperCase();

export default async function PublicDossier({ params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params;
  const short = wallet.length > 12 ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : wallet;

  let dossier: Awaited<ReturnType<typeof serverTrpc.dossier.query>> = null;
  let rank = 0;
  try {
    const [d, board] = await Promise.all([
      serverTrpc.dossier.query({ wallet }),
      serverTrpc.leaderboard.query({ by: "gr", limit: 200 }),
    ]);
    dossier = d;
    rank = board.find((r) => r.wallet === wallet)?.rank ?? 0;
  } catch {
    /* backend unreachable — fall through to the empty state */
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      {/* nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EEF1EC" }}>
        <div className="lp-pad" style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "#10231A" }}>
            <Image src="/img/logo.png" alt="" width={28} height={28} style={{ objectFit: "contain" }} />
            <span className="cd" style={{ fontSize: 16, letterSpacing: ".4px" }}>THE GAFFER</span>
          </Link>
          <Link href="/contract" className="btnp" style={{ fontSize: 13.5, padding: "10px 18px", borderRadius: 30, textDecoration: "none" }}>Sign for the Gaffer</Link>
        </div>
      </div>

      <div className="lp-pad" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 60px" }}>
        {!dossier ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div className="cd" style={{ fontSize: 22 }}>No dossier here yet</div>
            <p style={{ fontSize: 14, color: "#6E7C72", margin: "10px 0 20px" }}>
              <span className="mono">{short}</span> hasn&rsquo;t signed for the Gaffer — or hasn&rsquo;t made a call he remembers.
            </p>
            <Link href="/contract" className="btnp" style={{ padding: "12px 24px", borderRadius: 13, textDecoration: "none" }}>Sign the contract</Link>
          </div>
        ) : (
          <PublicBody dossier={dossier} rank={rank} short={short} wallet={wallet} />
        )}
      </div>
    </div>
  );
}

function PublicBody({
  dossier: d,
  rank,
  short,
  wallet,
}: {
  dossier: NonNullable<Awaited<ReturnType<typeof serverTrpc.dossier.query>>>;
  rank: number;
  short: string;
  wallet: string;
}) {
  const seed = d.handle || wallet.slice(2, 8);
  const calls = d.record.won + d.record.lost + d.record.voided;
  const gafferRead =
    d.lastVerdict?.text ?? "The Gaffer's still building this file. Not enough calls to have a read yet.";

  const timeline = [
    ...(d.lastVerdict ? [{ date: fmtDate(d.lastVerdict.at), text: d.lastVerdict.text, tone: "neutral", at: d.lastVerdict.at }] : []),
    ...d.landmarks.map((l) => ({ date: fmtDate(l.at), text: l.text, tone: "good", at: l.at })),
    ...d.hotTakes.map((h) => ({ date: fmtDate(h.at), text: `Declared: “${h.text}”`, tone: "neutral", at: h.at })),
    { date: fmtDate(d.signedAt), text: "Signed the contract", tone: "muted", at: d.signedAt },
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return (
    <>
      {/* identity */}
      <div className="card" style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <img src={avatar(seed, "d9f2e1")} style={{ width: 68, height: 68, borderRadius: "50%", background: "#d9f2e1", boxShadow: "0 0 0 2px #fff" }} alt="" />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="cd" style={{ fontSize: 22 }}>{d.handle || "Anonymous manager"}</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>{short}</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#0A7E40", background: "#E7F6EC", padding: "7px 12px", borderRadius: 20 }}>
          <SealCheck size={14} weight="fill" /> Verifiable on Walrus
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <Metric label="RATING" value={Math.round(d.gr).toLocaleString()} />
        <Metric label="RECORD" value={`${d.record.won}–${d.record.lost}`} />
        <Metric label="RANK" value={rank ? `#${rank}` : "—"} accent />
        <Metric label="TIER" value={d.tier} small />
      </div>

      {/* gaffer read */}
      <div className="ink" style={{ padding: 24, marginTop: 16 }}>
        <div className="glow" style={{ right: -30, bottom: -30, width: 150, height: 150, background: "radial-gradient(circle,rgba(20,184,90,.22),transparent 70%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative" }}>
          <img src="/img/gaffer.png" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", objectPosition: "50% 16%", background: "#1a2b22" }} alt="" />
          <div>
            <div className="cd" style={{ fontSize: 12, letterSpacing: "1px", color: "#8FE7B0" }}>THE GAFFER&rsquo;S READ</div>
            <div style={{ fontSize: 11, color: "#7E8C84", marginTop: 1 }}>built from {calls} call{calls === 1 ? "" : "s"} on Walrus</div>
          </div>
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.5, fontWeight: 500, color: "#EAF3ED", position: "relative" }}>&ldquo;{gafferRead}&rdquo;</p>
      </div>

      {d.traits.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          {d.traits.map((t, i) => {
            const c = TRAIT_COLORS[i % TRAIT_COLORS.length]!;
            return (
              <span key={t.key} style={{ fontSize: 12, fontWeight: 700, color: c.fg, background: c.bg, padding: "8px 14px", borderRadius: 20 }}>{t.label}</span>
            );
          })}
        </div>
      )}

      {/* timeline */}
      <div className="cd" style={{ fontSize: 16, margin: "26px 0 12px" }}>How the read evolved</div>
      <div className="card" style={{ padding: 22 }}>
        <div style={{ paddingLeft: 6, borderLeft: "2px solid #DCE4DA" }}>
          {timeline.map((t, i) => (
            <div key={`${t.at}-${i}`} style={{ position: "relative", padding: i === timeline.length - 1 ? "0 0 0 18px" : "0 0 18px 18px" }}>
              <span style={{ position: "absolute", left: -7, top: 2, width: 10, height: 10, borderRadius: "50%", background: t.tone === "bad" ? "#C2373B" : t.tone === "muted" ? "#C0CABF" : "#0BA14A", boxShadow: "0 0 0 3px #fff" }} />
              <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: "#8A988F" }}>{t.date}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{t.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,#0E1A14,#143625)", borderRadius: 26, padding: 36, textAlign: "center", marginTop: 26, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: -50, transform: "translateX(-50%)", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,90,.25),transparent 65%)" }} />
        <h2 className="cd" style={{ fontSize: 28, color: "#fff", margin: 0, position: "relative" }}>Think you can do better?</h2>
        <p style={{ fontSize: 15, color: "#B8C6BD", margin: "10px 0 22px", position: "relative" }}>Sign for the Gaffer and find out if you actually know football.</p>
        <Link href="/contract" style={{ background: "#14B85A", color: "#06200f", fontWeight: 700, fontSize: 15, padding: "14px 30px", borderRadius: 14, textDecoration: "none", position: "relative", display: "inline-block" }}>
          Sign the contract
        </Link>
      </div>
    </>
  );
}

function Metric({ label, value, accent, small }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="card" style={{ flex: 1, padding: "14px 16px", textAlign: "center" }}>
      <div className="lbl">{label}</div>
      <div className={small ? "cd" : "mono"} style={{ fontWeight: 700, fontSize: small ? 14 : 19, marginTop: 4, color: accent ? "#0A7E40" : "#10231A" }}>{value}</div>
    </div>
  );
}
