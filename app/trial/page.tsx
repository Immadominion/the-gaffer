"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Gaffer3D from "@/components/Gaffer3D";
import AddFundsModal from "@/components/flow/AddFundsModal";
import { ArrowRight, Coins, LockSimple, Signature } from "@/components/icons";
import { flag } from "@/lib/data";
import { useSession } from "@/lib/session";

const champions = [
  { name: "Argentina", code: "ar" },
  { name: "Brazil", code: "br" },
  { name: "France", code: "fr" },
  { name: "England", code: "gb-eng" },
  { name: "Spain", code: "es" },
  { name: "Germany", code: "de" },
];

const habits = [
  "I chase losses after a bad one",
  "I only ever back the favourite",
  "Heart over head, always",
  "I overthink the easy ones",
];

const lines: Record<number, string> = {
  0: "Don't know you from Adam. Three quick things and we'll see if you've actually got an eye.",
  1: "Who's lifting the trophy? No wrong answer yet — I'm just listening.",
  2: "Every manager has a tell. Go on — what's yours?",
  3: "Right. First call's on the house. Argentina v Croatia — who've you got?",
  4: "Calls are free once. After that you back it with WAL, or it doesn't count.",
  5: "That'll do for a first day. Come back when it's played and we'll see what you're made of.",
};

export default function TrialPage() {
  const { session, ready, completeTrial, claimWelcomeGrant } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [champion, setChampion] = useState<string | null>(null);
  const [habit, setHabit] = useState<number | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [fundsOpen, setFundsOpen] = useState(false);

  // guard: only signed, not-yet-onboarded players belong here
  useEffect(() => {
    if (!ready) return;
    if (session.status === "guest") router.replace("/contract");
    else if (session.onboarded) router.replace("/touchline");
  }, [ready, session.status, session.onboarded, router]);

  const finish = () => {
    completeTrial();
    router.push("/touchline");
  };

  const canNext =
    (step === 1 && champion) || (step === 2 && habit !== null) || (step === 3 && pick) || step === 0;

  return (
    <div style={{ minHeight: "100dvh", background: "radial-gradient(120% 80% at 50% 0%,#EAF0E6,#F4F7F2)", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 48px" }}>
      {/* progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} style={{ width: step >= n ? 26 : 16, height: 6, borderRadius: 6, background: step >= n ? "#0BA14A" : "#D7E0D4", transition: ".25s" }} />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Gaffer3D mood="thinking" style={{ width: 210, height: 230 }} dropShadow="drop-shadow(0 16px 26px rgba(16,35,26,.26))" />

        {/* gaffer line */}
        <div className="ink" style={{ width: "100%", padding: "16px 18px", marginTop: 2 }}>
          <div className="glow" style={{ right: -30, top: -30, width: 110, height: 110, background: "radial-gradient(circle,rgba(20,184,90,.3),transparent 70%)" }} />
          <div className="cd" style={{ fontSize: 11, letterSpacing: "1.2px", color: "#8FE7B0", position: "relative" }}>THE GAFFER</div>
          <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.45, fontWeight: 500, color: "#EAF3ED", position: "relative" }}>&ldquo;{lines[step]}&rdquo;</p>
        </div>

        {/* step body */}
        <div style={{ width: "100%", marginTop: 16 }}>
          {step === 0 && (
            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              <div className="cd" style={{ fontSize: 18 }}>The Trial</div>
              <p style={{ fontSize: 13.5, color: "#6E7C72", lineHeight: 1.5, margin: "8px 0 0" }}>
                Two taste questions and one free call. He&rsquo;s building your dossier from the very first tap.
              </p>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {champions.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setChampion(c.name)}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: champion === c.name ? "1.5px solid #0BA14A" : "1.5px solid #E7ECE3", borderRadius: 14, padding: "12px 14px", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#10231A" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flag(c.code)} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 1.5px #fff" }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {habits.map((h, i) => (
                <button
                  key={h}
                  onClick={() => setHabit(i)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: habit === i ? "1.5px solid #0BA14A" : "1.5px solid #E7ECE3", borderRadius: 14, padding: "14px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#10231A", textAlign: "left" }}
                >
                  {h}
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: habit === i ? "5px solid #0BA14A" : "2px solid #D1D5DB", flex: "none" }} />
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flag("ar", 160)} alt="" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff,0 3px 9px rgba(16,35,26,.12)" }} />
                  <span className="cd" style={{ fontSize: 15 }}>Argentina</span>
                </div>
                <span className="cd" style={{ fontSize: 16, color: "#C0CABF" }}>VS</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flag("hr", 160)} alt="" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 2px #fff,0 3px 9px rgba(16,35,26,.12)" }} />
                  <span className="cd" style={{ fontSize: 15 }}>Croatia</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
                {[
                  { k: "ARG", p: "58%" },
                  { k: "DRAW", p: "22%" },
                  { k: "CRO", p: "20%" },
                ].map((o) => {
                  const on = pick === o.k;
                  return (
                    <button
                      key={o.k}
                      onClick={() => setPick(o.k)}
                      style={{ background: on ? "linear-gradient(135deg,#14B85A,#0A8A41)" : "#F3F6F1", border: "none", borderRadius: 14, padding: "13px 6px", cursor: "pointer", textAlign: "center", boxShadow: on ? "0 8px 18px rgba(11,138,60,.28)" : "none" }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: on ? "#fff" : "#10231A" }}>{o.k}</div>
                      <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, color: on ? "#fff" : "#5B6B62" }}>{o.p}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setFundsOpen(true)} className="btnp" style={{ width: "100%", padding: 15, borderRadius: 15, fontSize: 15 }}>
                <Coins size={18} weight="fill" />
                Add funds
              </button>
              <button
                onClick={() => { void claimWelcomeGrant().catch(() => {}); setStep(5); }}
                style={{ width: "100%", background: "#fff", border: "1.5px solid #E7ECE3", borderRadius: 15, padding: 14, fontWeight: 700, fontSize: 14, color: "#10231A", cursor: "pointer" }}
              >
                Start with 2 WAL on the house
              </button>
              <p style={{ fontSize: 12, color: "#A6B2A9", textAlign: "center", margin: "4px 0 0" }}>You can top up anytime from your wallet.</p>
            </div>
          )}

          {step === 5 && (
            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              <div className="cd" style={{ fontSize: 18 }}>You&rsquo;re signed.</div>
              <p style={{ fontSize: 13.5, color: "#6E7C72", lineHeight: 1.5, margin: "8px 0 0" }}>
                Balance ready, first call logged. The Gaffer&rsquo;s watching now.
              </p>
            </div>
          )}
        </div>

        {/* footer action */}
        <div style={{ width: "100%", marginTop: 18 }}>
          {step === 0 && (
            <button onClick={() => setStep(1)} className="btnp" style={{ width: "100%", padding: 15, borderRadius: 15, fontSize: 15 }}>
              Start the trial <ArrowRight size={16} weight="bold" />
            </button>
          )}
          {(step === 1 || step === 2) && (
            <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btnp" style={{ width: "100%", padding: 15, borderRadius: 15, fontSize: 15, opacity: canNext ? 1 : 0.5 }}>
              Next <ArrowRight size={16} weight="bold" />
            </button>
          )}
          {step === 3 && (
            <button onClick={() => setStep(4)} disabled={!pick} className="btnp" style={{ width: "100%", padding: 15, borderRadius: 15, fontSize: 15, opacity: pick ? 1 : 0.5 }}>
              <LockSimple size={16} weight="fill" /> Lock it in · free
            </button>
          )}
          {step === 5 && (
            <button onClick={finish} className="btnp" style={{ width: "100%", padding: 15, borderRadius: 15, fontSize: 15 }}>
              <Signature size={18} weight="fill" /> Enter the Touchline
            </button>
          )}
        </div>
      </div>

      <AddFundsModal open={fundsOpen} onClose={() => setFundsOpen(false)} onDone={() => setStep(5)} />
    </div>
  );
}
