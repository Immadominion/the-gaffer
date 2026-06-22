"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Gaffer3D from "@/components/Gaffer3D";
import SignContractModal from "@/components/flow/SignContractModal";
import { Brain, Coins, SealCheck, Signature, Trophy } from "@/components/icons";
import { useSession } from "@/lib/session";

const terms = [
  { Icon: Coins, text: "Stake WAL on your match calls" },
  { Icon: Brain, text: "Your record lives on Walrus, forever" },
  { Icon: Trophy, text: "Climb the Squad Ladder, take the Pot" },
];

export default function ContractPage() {
  const { session, ready, authenticated, login } = useSession();
  const router = useRouter();
  const [showHandle, setShowHandle] = useState(false);

  // Fully signed → into the app.
  useEffect(() => {
    if (!ready || session.status !== "signed") return;
    router.replace(session.onboarded ? "/touchline" : "/trial");
  }, [ready, session.status, session.onboarded, router]);

  // Authenticated with Privy but no Dossier yet → name yourself + sign.
  useEffect(() => {
    if (ready && authenticated && session.status === "guest") setShowHandle(true);
  }, [ready, authenticated, session.status]);

  // One action: not logged in → Privy modal; logged in but unsigned → name step.
  const start = () => {
    if (authenticated && session.status === "guest") setShowHandle(true);
    else login();
  };

  return (
    <div className="signin">
      <div className="signin-left">
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.png" alt="" style={{ width: 30, height: 30, objectFit: "contain" }} />
          <span className="cd" style={{ fontSize: 16, letterSpacing: ".4px" }}>THE GAFFER</span>
        </div>

        <h1 className="cd" style={{ fontSize: "clamp(32px,4vw,46px)", lineHeight: 1.05, margin: 0, color: "#10231A", letterSpacing: "-.5px" }}>
          Let&rsquo;s get one
          <br />
          thing straight.
        </h1>

        <div className="ink" style={{ padding: 20, marginTop: 22, maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span className="cd" style={{ fontSize: 12, letterSpacing: "1.2px", color: "#8FE7B0" }}>THE GAFFER</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#7E8C84" }}>· remembers everything</span>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 15.5, lineHeight: 1.45, fontWeight: 500, color: "#EAF3ED" }}>
            &ldquo;I track every call you make. I don&rsquo;t forget, and I don&rsquo;t do flattery. Stake your WAL, back your judgement. Prove you actually know football.&rdquo;
          </p>
        </div>

        <div className="card" style={{ padding: "6px 4px", marginTop: 14, maxWidth: 460 }}>
          {terms.map((t, i) => (
            <div key={t.text}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px" }}>
                <t.Icon size={18} weight="fill" color="#0BA14A" />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "#2C4A39" }}>{t.text}</span>
              </div>
              {i < terms.length - 1 && <div style={{ height: 1, background: "#EEF1EC", margin: "0 14px" }} />}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, maxWidth: 460 }}>
          <button onClick={start} className="btnp" style={{ width: "100%", padding: 15, borderRadius: 15, fontSize: 15 }}>
            <Signature size={18} weight="fill" />
            Sign the contract
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 12, fontWeight: 600, color: "#A6B2A9" }}>
            <SealCheck size={14} weight="fill" color="#0BA14A" />
            Email, Google, X or wallet — no seed phrases. Owned by you, verifiable on Walrus.
          </div>
        </div>
      </div>

      <div className="signin-right">
        <Gaffer3D mood="smug" float={false} className="signin-gaffer" dropShadow="drop-shadow(0 30px 44px rgba(16,35,26,.3))" />
      </div>

      <SignContractModal open={showHandle} onClose={() => setShowHandle(false)} />
    </div>
  );
}
