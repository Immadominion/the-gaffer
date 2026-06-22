"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Gaffer3D from "@/components/Gaffer3D";
import AddFundsModal from "@/components/flow/AddFundsModal";
import Tour, { type TourStep } from "@/components/tour/Tour";
import {
  ArrowRight,
  Bell,
  CaretRight,
  Fire,
  LockSimple,
  MagnifyingGlass,
  Trophy,
  Wallet,
  ChatCircleDots,
} from "@/components/icons";
import { flag } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";
import { useSession } from "@/lib/session";

/* eslint-disable @next/next/no-img-element */

const FORM_STYLE = (won: boolean) =>
  won
    ? { background: "#14B85A", color: "#06200f" }
    : { background: "rgba(229,107,107,.25)", color: "#E56B6B" };

const TOUR: TourStep[] = [
  { sel: "[data-tour=balance]", title: "Your balance", body: "This is your WAL. Tap it to add funds — every call you make is staked from here." },
  { sel: "[data-tour=hero]", title: "Today's headline", body: "Your featured fixture. The Gaffer's already got a read on you, before you've even bet." },
  { sel: "[data-tour=matchday]", title: "Make your calls", body: "Every open fixture lives in Matchday. Pick one and back your judgement with WAL." },
  { sel: "[data-tour=form]", title: "Your standing", body: "Rating, form and rank. Win the hard calls and you climb the Squad Ladder." },
];

// Notifications are derived from live data in the component (see `notifs`).

const FALLBACK_ME = {
  handle: "Gaffer", sui: "", seed: "Gaffer", bg: "d9f2e1",
  rating: 1000, ratingDelta: 0, record: "0–0", rank: 0, tier: "Trialist",
  balance: 0, available: 0, staked: 0, form: [] as ("W" | "L")[],
  walWon: 0, hitRate: 0, calls: 0,
};

export default function TouchlinePage() {
  const { session, completeTour } = useSession();
  const g = useGameData();
  const [funds, setFunds] = useState(false);
  const [bell, setBell] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const me = g.me ?? FALLBACK_ME;
  const featured = g.featured;
  const matchday = g.matchday;
  const openCall = g.openCall;
  const justSettled = g.settledCalls[0];
  const handle = session.handle || me.handle;
  const balance = session.balance;

  // Real notifications, folded from your live data.
  const notifs: { icon: ReactNode; bg: string; title: string; sub: string }[] = [];
  if (justSettled)
    notifs.push({
      icon: <ChatCircleDots size={16} weight="fill" color="#0BA14A" />,
      bg: "#E7F6EC",
      title: `The Gaffer settled your ${justSettled.home.name} call`,
      sub: `${justSettled.outcome === "WON" ? "Won" : justSettled.outcome === "LOST" ? "Lost" : "Void"} ${justSettled.pnl} WAL · ${justSettled.when}`,
    });
  if (openCall)
    notifs.push({
      icon: <LockSimple size={16} weight="fill" color="#2F6BFF" />,
      bg: "#E6EDFF",
      title: `Your ${openCall.pick} call is live`,
      sub: `Locks in ${openCall.lock}`,
    });
  if (me.rank)
    notifs.push({
      icon: <Trophy size={16} weight="fill" color="#0BA14A" />,
      bg: "#E7F6EC",
      title: `You're #${me.rank} on the Squad Ladder`,
      sub: me.tier,
    });

  // spotlight tour on first visit after onboarding
  useEffect(() => {
    if (session.onboarded && !session.tourDone) {
      const t = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(t);
    }
  }, [session.onboarded, session.tourDone]);

  // close the bell popover on outside click
  useEffect(() => {
    if (!bell) return;
    const onClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBell(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [bell]);

  if (!featured) {
    return (
      <div className="midpad" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#8A988F", fontWeight: 600, fontSize: 14 }}>
        {g.loading ? "Loading the Touchline…" : "No fixtures are open right now — check back at kick-off."}
      </div>
    );
  }

  return (
    <div className="midpad">
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8A988F" }}>Good evening,</div>
          <div className="cd" style={{ fontSize: 24, lineHeight: 1, color: "#10231A" }}>{handle.toUpperCase()}</div>
        </div>
        <div className="tl-search" title="Search is coming soon" style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 30, padding: "12px 18px", boxShadow: "0 2px 8px rgba(16,35,26,.05)", maxWidth: 420, cursor: "default", opacity: 0.75 }}>
          <MagnifyingGlass size={18} color="#A6B2A9" />
          <span style={{ fontSize: 14, color: "#A6B2A9", fontWeight: 500 }}>Search fixtures &amp; teams — coming soon</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            data-tour="balance"
            onClick={() => setFunds(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 30, padding: "9px 15px", boxShadow: "0 2px 8px rgba(16,35,26,.05)", border: "none", cursor: "pointer" }}
          >
            <Wallet size={17} weight="fill" color="#0BA14A" />
            <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "#10231A" }}>{balance.toFixed(1)} WAL</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0BA14A", marginLeft: 2 }}>+</span>
          </button>
          <div ref={bellRef} style={{ position: "relative" }}>
            <button
              onClick={() => setBell((b) => !b)}
              style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", border: "none", background: "#fff", boxShadow: "0 2px 8px rgba(16,35,26,.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Bell size={19} weight={bell ? "fill" : "regular"} />
              <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#E5484D", boxShadow: "0 0 0 2px #fff" }} />
            </button>
            {bell && (
              <div style={{ position: "absolute", top: 50, right: 0, width: 320, background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(16,35,26,.18)", zIndex: 40, overflow: "hidden", animation: "popin .15s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #EEF1EC" }}>
                  <span className="cd" style={{ fontSize: 15 }}>Notifications</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0BA14A", cursor: "pointer" }}>Mark all read</span>
                </div>
                {notifs.length === 0 && (
                  <div style={{ padding: "18px 16px", textAlign: "center", fontSize: 12.5, color: "#8A988F", fontWeight: 600 }}>You&rsquo;re all caught up.</div>
                )}
                {notifs.map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, padding: "12px 16px", borderBottom: i < notifs.length - 1 ? "1px solid #F3F6F1" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{n.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{n.title}</div>
                      <div style={{ fontSize: 11.5, color: "#8A988F", fontWeight: 600, marginTop: 2 }}>{n.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="row row-26" style={{ marginTop: 24 }}>
        {/* MAIN COLUMN */}
        <div className="col-main">
          {/* HERO FEATURE */}
          <Link href={`/call/${featured.matchId}`} data-tour="hero" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "linear-gradient(120deg,#0E1A14 0%,#13251B 60%,#16331F 100%)", borderRadius: 26, padding: "30px 32px", position: "relative", overflow: "hidden", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Gaffer3D mood="thinking" float={false} style={{ position: "absolute", right: 0, bottom: -80, width: 500, height: 440 }} dropShadow="drop-shadow(0 18px 36px rgba(0,0,0,.45))" />
              <div style={{ position: "relative", maxWidth: "54%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#14B85A", color: "#06200f", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20 }}>
                    <Fire size={13} weight="fill" />
                    Featured
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.08)", color: "#B8C6BD", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20 }}>
                    {featured.group} · {featured.koTag}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
                  <img src={flag(featured.home.code)} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px rgba(255,255,255,.2)" }} alt="" />
                  <img src={flag(featured.away.code)} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px rgba(255,255,255,.2)", marginLeft: -14 }} alt="" />
                </div>
                <h1 className="cd" style={{ fontSize: 40, lineHeight: 1.02, color: "#fff", margin: "14px 0 0", letterSpacing: "-.5px" }}>
                  {featured.home.name} <span style={{ color: "#5B6B62", fontWeight: 600 }}>vs</span> {featured.away.name}
                </h1>
                <p style={{ fontSize: 14.5, lineHeight: 1.45, color: "#B8C6BD", margin: "12px 0 0", maxWidth: 380 }}>
                  Gaffer: <span style={{ color: "#EAF3ED", fontWeight: 600 }}>&ldquo;You&rsquo;re 0–3 on Group F games. Backing Brazil to break the curse, are we?&rdquo;</span>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
                  <span className="btnp" style={{ fontSize: 15, padding: "13px 26px", borderRadius: 13 }}>
                    Make a call
                    <ArrowRight size={16} weight="bold" />
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.08)", borderRadius: 30, padding: "10px 16px" }}>
                    <Trophy size={15} weight="fill" color="#F2B705" />
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{featured.pot.toLocaleString()} WAL pot</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* MATCHDAY */}
          <div data-tour="matchday">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 14px" }}>
              <div className="cd" style={{ fontSize: 20 }}>Matchday</div>
              <Link href="/matchday" style={{ fontSize: 13, fontWeight: 700, color: "#0BA14A", textDecoration: "none" }}>See all</Link>
            </div>
            <div className="grid3" style={{ gap: 16 }}>
              {matchday.map((m, i) => (
                <Link key={m.matchId} href={`/call/${m.matchId}`} className="card" style={{ flex: 1, padding: 16, textDecoration: "none", color: "inherit", display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#C57A12" : "#5B6B62", background: i === 0 ? "#FBF0DC" : "#EEF2EB", padding: "3px 9px", borderRadius: 20 }}>{m.koTag}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img src={flag(m.home.code)} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff" }} alt="" />
                    <img src={flag(m.away.code)} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff", marginLeft: -12 }} alt="" />
                  </div>
                  <div className="cd" style={{ fontWeight: 600, fontSize: 15, marginTop: 12 }}>{m.home.name} v {m.away.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#8A988F" }}>{m.pot.toLocaleString()} WAL</span>
                    <span style={{ background: "#E7F6EC", color: "#0A7E40", fontWeight: 700, fontSize: 12.5, padding: "7px 14px", borderRadius: 10 }}>Call</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {openCall && (<>
          {/* OPEN CALL */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 14px" }}>
            <div className="cd" style={{ fontSize: 20 }}>Your open call</div>
            <Link href="/wallet" style={{ fontSize: 13, fontWeight: 700, color: "#0BA14A", textDecoration: "none" }}>See all</Link>
          </div>
          <div className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={flag(openCall.home.code)} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff" }} alt="" />
              <img src={flag(openCall.away.code)} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff", marginLeft: -12 }} alt="" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="cd" style={{ fontWeight: 600, fontSize: 16 }}>{openCall.home.name} v {openCall.away.name}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>
                Your call: <span style={{ color: "#0BA14A", fontWeight: 700 }}>{openCall.pick}</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".6px", color: "#8A988F" }}>STAKED</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 15, marginTop: 3 }}>{openCall.staked.toFixed(1)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".6px", color: "#8A988F" }}>PROJECTED</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 15, color: "#0BA14A", marginTop: 3 }}>~{openCall.projected}</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#2F6BFF", background: "#E6EDFF", padding: "8px 13px", borderRadius: 20 }}>
              <LockSimple size={13} weight="fill" />
              {openCall.lock}
            </span>
          </div>
          </>)}

          {justSettled && (<>
          {/* JUST SETTLED */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 14px" }}>
            <div className="cd" style={{ fontSize: 20 }}>Just settled</div>
            <Link href="/results" style={{ fontSize: 13, fontWeight: 700, color: "#0BA14A", textDecoration: "none" }}>See all</Link>
          </div>
          <Link href="/results" className="card" style={{ padding: 18, display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={flag(justSettled.home.code)} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff" }} alt="" />
                  <img src={flag(justSettled.away.code)} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff", marginLeft: -10 }} alt="" />
                </div>
                <div>
                  <div className="cd" style={{ fontSize: 15 }}>{justSettled.home.name} <span className="mono" style={{ color: "#5B6B62", fontWeight: 700 }}>{justSettled.score[0]}–{justSettled.score[1]}</span> {justSettled.away.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#8A988F", marginTop: 1 }}>You backed {justSettled.backed}</div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: justSettled.outcome === "WON" ? "#0A7E40" : justSettled.outcome === "LOST" ? "#C2373B" : "#5B6B62", background: justSettled.outcome === "WON" ? "#E7F6EC" : justSettled.outcome === "LOST" ? "#FBE9EA" : "#EEF2EB", padding: "5px 11px", borderRadius: 20 }}>{justSettled.outcome}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14, background: "#0E1A14", borderRadius: 13, padding: "11px 13px" }}>
              <ChatCircleDots size={15} weight="fill" color="#8FE7B0" style={{ marginTop: 1, flex: "none" }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#EAF3ED", lineHeight: 1.4 }}>
                &ldquo;{justSettled.line}&rdquo;
              </span>
            </div>
          </Link>
          </>)}
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-side w320">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/call/${featured.matchId}`} style={{ background: "#0E1A14", borderRadius: 16, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <img src={flag(featured.home.code)} style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} alt="" />
              <div style={{ flex: 1, color: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{featured.home.name} v {featured.away.name}</div>
                <div style={{ fontSize: 11, color: "#8FE7B0", fontWeight: 600 }}>Featured · {featured.ko}</div>
              </div>
              <CaretRight size={15} weight="bold" color="#5B6B62" />
            </Link>
            {matchday.slice(0, 2).map((m) => (
              <Link key={m.matchId} href={`/call/${m.matchId}`} className="card" style={{ borderRadius: 16, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
                <img src={flag(m.home.code)} style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.home.name} v {m.away.name}</div>
                  <div style={{ fontSize: 11, color: "#8A988F", fontWeight: 600 }}>{m.ko}</div>
                </div>
                <CaretRight size={15} weight="bold" color="#C0CABF" />
              </Link>
            ))}
          </div>

          {/* FORM */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0 14px" }}>
            <div className="cd" style={{ fontSize: 20 }}>Your form</div>
            <Link href="/ladder"><ArrowRight size={16} weight="bold" color="#0BA14A" /></Link>
          </div>
          <Link href="/dossier" data-tour="form" className="ink" style={{ display: "block", padding: 24, textDecoration: "none" }}>
            <div className="glow" style={{ right: -30, top: -30, width: 140, height: 140, background: "radial-gradient(circle,rgba(20,184,90,.3),transparent 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: "conic-gradient(#14B85A 0% 68%,rgba(255,255,255,.1) 68% 100%)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#0E1A14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: "#8FE7B0", fontWeight: 700 }}>RATING</span>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>{me.rating.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#8FE7B0", fontWeight: 700, letterSpacing: ".6px" }}>FORM · LAST 5</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                  {me.form.map((f, i) => (
                    <span key={i} style={{ width: 22, height: 22, borderRadius: 7, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", ...FORM_STYLE(f === "W") }}>{f}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#B8C6BD", fontWeight: 600, marginTop: 10 }}>{me.tier} · #{me.rank}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, position: "relative" }}>
              {[
                { v: `+${me.walWon}`, l: "WAL WON", c: "#0BA14A" },
                { v: `${me.hitRate}%`, l: "HIT RATE", c: "#fff" },
                { v: `${me.calls}`, l: "CALLS", c: "#fff" },
              ].map((s) => (
                <div key={s.l} style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: 13, padding: 11, textAlign: "center" }}>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 15, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#7E8C84", fontWeight: 700, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Link>
        </div>
      </div>

      <AddFundsModal open={funds} onClose={() => setFunds(false)} />
      {showTour && <Tour steps={TOUR} onDone={() => { completeTour(); setShowTour(false); }} />}
    </div>
  );
}
