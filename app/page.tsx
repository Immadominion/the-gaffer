import Link from "next/link";
import Image from "next/image";
import Gaffer3D from "@/components/Gaffer3D";
import { ArrowRight, Brain, CheckCircle, Coins, PlayCircle, TrendUp, Trophy } from "@/components/icons";
import { serverTrpc } from "@/lib/serverTrpc";
import { frostToWal } from "@/lib/format";

/* eslint-disable @next/next/no-img-element */

export const revalidate = 60; // refresh the live hero stats ~1/min

export default async function LandingPage() {
  let potLabel = "—";
  let fixturesLabel = "—";
  try {
    const [pot, matches] = await Promise.all([serverTrpc.managersPot.query(), serverTrpc.matchday.query()]);
    potLabel = Math.round(frostToWal(pot)).toLocaleString();
    fixturesLabel = matches.filter((m) => m.status === "OPEN").length.toLocaleString();
  } catch {
    /* backend unreachable — keep the dash */
  }
  return (
    <div style={{ width: "100%", background: "#fff", overflow: "hidden", color: "#10231A" }}>
      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EEF1EC" }}>
        <div className="lp-pad" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/img/logo.png" alt="" width={32} height={32} style={{ objectFit: "contain" }} />
            <span className="cd" style={{ fontSize: 18, letterSpacing: ".4px" }}>THE GAFFER</span>
          </div>
          <div className="lp-navlinks" style={{ display: "flex", alignItems: "center", gap: 34, fontSize: 14, fontWeight: 600, color: "#3A4A41" }}>
            <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>How it works</a>
            <a href="#verdict" style={{ color: "inherit", textDecoration: "none" }}>The Gaffer</a>
            <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>Squad Ladder</a>
            <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>Pot</a>
          </div>
          <Link
            href="/contract"
            className="btnp"
            style={{ fontSize: 14, padding: "11px 22px", borderRadius: 30, boxShadow: "0 6px 16px rgba(11,138,60,.25)", textDecoration: "none" }}
          >
            Launch app
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="lp-hero lp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 40px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E7F6EC", color: "#0A7E40", fontSize: 13, fontWeight: 700, padding: "7px 14px", borderRadius: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0BA14A", display: "inline-block" }} />
            World Cup 2026 · Live now
          </div>
          <h1 className="cd lp-h1" style={{ lineHeight: 1.02, letterSpacing: "-1px", margin: "20px 0 0", color: "#10231A" }}>
            Your AI gaffer
            <br />
            remembers <span style={{ color: "#0BA14A" }}>every</span>
            <br />
            call you make.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, fontWeight: 500, color: "#4A5A50", margin: "22px 0 0", maxWidth: 480 }}>
            Stake WAL on the matches. Back your judgement. The Gaffer tracks your record on-chain, coaches you, and roasts you when you bottle it.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32 }}>
            <Link href="/contract" className="btnp" style={{ fontSize: 16, padding: "16px 30px", borderRadius: 14, textDecoration: "none" }}>
              Sign the contract
              <ArrowRight size={18} weight="bold" />
            </Link>
            <a
              href="https://youtu.be/dCW31RNfKVU"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#fff", color: "#10231A", border: "1.5px solid #DDE4DA", fontWeight: 700, fontSize: 16, padding: "16px 26px", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}
            >
              <PlayCircle size={20} weight="fill" color="#0BA14A" />
              Watch the demo
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 36 }}>
            <HeroStat value={potLabel} label="WAL in the Pot" />
            <HeroDivider />
            <HeroStat value={fixturesLabel} label="fixtures live" />
            <HeroDivider />
            <HeroStat value="100%" label="on Walrus" />
          </div>
        </div>

        {/* hero visual */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
          <Gaffer3D
            mood="smug"
            className="lp-herovis"
            style={{ position: "relative" }}
            dropShadow="drop-shadow(0 30px 50px rgba(16,35,26,.3))"
          />
          {/* floating speech */}
          <div style={{ position: "absolute", bottom: 30, left: -10, background: "#0E1A14", color: "#fff", borderRadius: "18px 18px 18px 5px", padding: "14px 16px", maxWidth: 240, boxShadow: "0 18px 40px rgba(14,26,20,.35)" }}>
            <div className="cd" style={{ fontSize: 11, letterSpacing: "1px", color: "#8FE7B0", marginBottom: 6 }}>THE GAFFER</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.4, fontWeight: 500 }}>
              &ldquo;You said Argentina were finished. They&rsquo;re in the quarters. Sit down.&rdquo;
            </div>
          </div>
          {/* floating stat */}
          <div style={{ position: "absolute", top: 24, right: -6, background: "#fff", borderRadius: 16, padding: "13px 16px", boxShadow: "0 14px 34px rgba(16,35,26,.16)", display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "#E7F6EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendUp size={20} weight="fill" color="#0BA14A" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8A988F" }}>Gaffer Rating</div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 17 }}>
                1,842 <span style={{ color: "#0BA14A", fontSize: 12 }}>+24</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" className="lp-pad" style={{ background: "#F5F8F3", padding: "80px 40px", marginTop: 40, scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", color: "#0A7E40" }}>HOW IT WORKS</div>
            <h2 className="cd lp-h2" style={{ margin: "10px 0 0", letterSpacing: "-.5px" }}>Make the call. Live with it.</h2>
          </div>
          <div className="lp-3">
            <Step icon={<Coins size={26} weight="fill" color="#fff" />} title="Stake your WAL" body="Pick an outcome on any World Cup fixture and lock real WAL behind your judgement." />
            <Step icon={<Brain size={26} weight="fill" color="#fff" />} title="The Gaffer remembers" body="Every call, win and excuse is written to your dossier on Walrus. He never forgets a thing." />
            <Step icon={<Trophy size={26} weight="fill" color="#fff" />} title="Climb the Ladder" body="Win calls, climb the Squad Ladder, and take your cut of the Manager's Pot at the Final." />
          </div>
        </div>
      </div>

      {/* VERDICT FEATURE */}
      <div id="verdict" className="lp-2 lp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "90px 40px", scrollMarginTop: 70 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", color: "#0A7E40" }}>THE VERDICT</div>
          <h2 className="cd lp-h2" style={{ margin: "10px 0 16px", letterSpacing: "-.5px", lineHeight: 1.05 }}>
            A manager who
            <br />
            never lets it slide.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "#4A5A50", margin: "0 0 26px", maxWidth: 440 }}>
            After every result the Gaffer delivers his verdict — and it&rsquo;s a shareable card. Win and he&rsquo;ll admit you were right. Lose and the whole squad finds out why.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Check text="Memory-backed roasts that reference your history" />
            <Check text="One-tap share to rally — or humble — your squad" />
            <Check text="Every verdict verifiable on Walrus" />
          </div>
        </div>
        {/* verdict card */}
        <div style={{ background: "#0E1A14", borderRadius: 28, padding: 26, color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 30px 60px rgba(14,26,20,.3)" }}>
          <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(197,55,59,.35),transparent 70%)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Image src="/img/logo.png" alt="" width={22} height={22} style={{ objectFit: "contain" }} />
              <span className="cd" style={{ fontSize: 13, letterSpacing: "1px" }}>THE GAFFER</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E56B6B", background: "rgba(229,107,107,.15)", padding: "5px 12px", borderRadius: 20 }}>VERDICT · LOST</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20, position: "relative" }}>
            <img src="/img/gaffer.png" alt="" style={{ width: 120, height: 120, objectFit: "contain", flex: "none", filter: "drop-shadow(0 12px 20px rgba(0,0,0,.4))" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".6px", color: "#7E8C84" }}>ENGLAND v PORTUGAL</div>
              <div className="cd" style={{ fontSize: 30, marginTop: 3 }}>
                1<span style={{ color: "#5B6B62" }}> – </span>2
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#B8C6BD", marginTop: 3 }}>
                You backed <span style={{ color: "#E56B6B" }}>England</span>
              </div>
            </div>
          </div>
          <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.45, fontWeight: 500, color: "#EAF3ED", position: "relative", fontStyle: "italic" }}>
            &ldquo;Backed the favourite again. We&rsquo;ve talked about this. You don&rsquo;t get paid for being safe.&rdquo;
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20, position: "relative" }}>
            <CardStat label="P&L" value="−20.0" tone="#E56B6B" />
            <CardStat label="RATING" value="−12" tone="#E56B6B" />
            <CardStat label="STREAK" value="L2" tone="#fff" />
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div className="lp-pad" style={{ maxWidth: 1200, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ background: "linear-gradient(135deg,#0E1A14,#143625)", borderRadius: 32, padding: 60, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: -60, transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,90,.25),transparent 65%)" }} />
          <h2 className="cd" style={{ fontSize: 46, color: "#fff", margin: 0, letterSpacing: "-.5px", position: "relative" }}>The Gaffer&rsquo;s waiting.</h2>
          <p style={{ fontSize: 18, color: "#B8C6BD", margin: "14px 0 30px", position: "relative" }}>
            Sign the contract, make your first call, and find out if you actually know football.
          </p>
          <Link
            href="/contract"
            style={{ background: "#14B85A", color: "#06200f", border: "none", fontWeight: 700, fontSize: 17, padding: "17px 38px", borderRadius: 14, cursor: "pointer", boxShadow: "0 12px 30px rgba(20,184,90,.4)", position: "relative", display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none" }}
          >
            Launch the app
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div className="lp-pad" style={{ borderTop: "1px solid #EEF1EC", padding: "36px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/img/logo.png" alt="" width={26} height={26} style={{ objectFit: "contain" }} />
            <span className="cd" style={{ fontSize: 15 }}>THE GAFFER</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8A988F" }}>Built on Sui &amp; Walrus · World Cup 2026</div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="mono" style={{ fontWeight: 700, fontSize: 24, color: "#10231A" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#8A988F" }}>{label}</div>
    </div>
  );
}
function HeroDivider() {
  return <div style={{ width: 1, height: 34, background: "#E6EBE3" }} />;
}
function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 24, padding: 30, boxShadow: "0 2px 14px rgba(16,35,26,.05)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg,#14B85A,#0A8A41)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px rgba(11,138,60,.28)" }}>
        {icon}
      </div>
      <h3 className="cd" style={{ fontSize: 21, margin: "18px 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 15, lineHeight: 1.5, color: "#5A6A60", margin: 0 }}>{body}</p>
    </div>
  );
}
function Check({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <CheckCircle size={22} weight="fill" color="#0BA14A" />
      <span style={{ fontSize: 15, fontWeight: 600, color: "#2C4A39" }}>{text}</span>
    </div>
  );
}
function CardStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: 14, padding: 13 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".6px", color: "#7E8C84" }}>{label}</div>
      <div className="mono" style={{ fontWeight: 700, fontSize: 18, color: tone, marginTop: 3 }}>{value}</div>
    </div>
  );
}
