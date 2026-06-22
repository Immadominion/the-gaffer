"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SealCheck, SignOut } from "@/components/icons";
import { avatar, me } from "@/lib/data";
import { useSession } from "@/lib/session";

/* eslint-disable @next/next/no-img-element */

export default function SettingsPage() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const handle = session.handle || me.handle;
  const wallet = session.wallet || "0x7f3a…d92c";

  const [notif, setNotif] = useState({ matchday: true, settle: true, ladder: true, mentions: false });
  const [publicDossier, setPublicDossier] = useState(true);

  const out = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="midpad" style={{ maxWidth: 760 }}>
      <div className="cd" style={{ fontSize: 24 }}>Settings</div>

      {/* account */}
      <div className="card" style={{ marginTop: 22, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src={avatar(me.seed, me.bg)} style={{ width: 60, height: 60, borderRadius: "50%", background: "#d9f2e1", boxShadow: "0 0 0 2px #fff" }} alt="" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cd" style={{ fontSize: 19 }}>{handle}</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#8A988F", marginTop: 2 }}>{wallet.slice(0, 8)}…{wallet.slice(-4)}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#0A7E40", background: "#E7F6EC", padding: "6px 12px", borderRadius: 20 }}>Connected via email</span>
      </div>

      <Section title="Notifications">
        <Toggle label="Matchday reminders" desc="A nudge before fixtures lock" on={notif.matchday} set={(v) => setNotif({ ...notif, matchday: v })} />
        <Toggle label="Settlement alerts" desc="When your calls are resolved" on={notif.settle} set={(v) => setNotif({ ...notif, settle: v })} />
        <Toggle label="Promotions & demotions" desc="Moving up (or down) the Squad Ladder" on={notif.ladder} set={(v) => setNotif({ ...notif, ladder: v })} />
        <Toggle label="Verdict mentions" desc="When the squad shares a Verdict about you" on={notif.mentions} set={(v) => setNotif({ ...notif, mentions: v })} last />
      </Section>

      <Section title="Privacy">
        <Toggle label="Public Dossier" desc="Let anyone view the Gaffer's read on you" on={publicDossier} set={setPublicDossier} />
        <Link href={`/p/${wallet}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", textDecoration: "none", color: "inherit" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>View my public page</div>
            <div style={{ fontSize: 12, color: "#8A988F", fontWeight: 600 }}>What visitors see when you share</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0BA14A" }}>Open ↗</span>
        </Link>
      </Section>

      {/* ownership */}
      <div className="ink" style={{ marginTop: 18, padding: 22 }}>
        <div className="glow" style={{ right: -30, bottom: -30, width: 140, height: 140, background: "radial-gradient(circle,rgba(20,184,90,.2),transparent 70%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 9, position: "relative" }}>
          <SealCheck size={20} weight="fill" color="#8FE7B0" />
          <span className="cd" style={{ fontSize: 14, letterSpacing: ".5px", color: "#fff" }}>YOUR MEMORY IS ON WALRUS</span>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "#B8C6BD", fontWeight: 500, position: "relative" }}>
          Every call, trait and Verdict is written to your namespace on Walrus — owned by you, verifiable, and impossible for anyone (even us) to edit.
        </p>
        <div className="mono" style={{ fontSize: 11, color: "#7E8C84", marginTop: 10, position: "relative" }}>gaffer:{wallet.slice(0, 10)}…</div>
      </div>

      <button onClick={out} style={{ marginTop: 18, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", border: "1.5px solid #F0D6D7", color: "#C2373B", borderRadius: 14, padding: 14, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        <SignOut size={17} weight="bold" />
        Sign out
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="cd" style={{ fontSize: 16, margin: "26px 0 12px" }}>{title}</div>
      <div className="card" style={{ padding: 6 }}>{children}</div>
    </>
  );
}

function Toggle({ label, desc, on, set, last }: { label: string; desc: string; on: boolean; set: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: last ? "none" : "1px solid #F3F6F1" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#8A988F", fontWeight: 600 }}>{desc}</div>
      </div>
      <button
        onClick={() => set(!on)}
        aria-pressed={on}
        style={{ width: 46, height: 28, borderRadius: 20, border: "none", cursor: "pointer", background: on ? "#0BA14A" : "#D7E0D4", position: "relative", transition: ".18s", flex: "none" }}
      >
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,.2)", transition: ".18s" }} />
      </button>
    </div>
  );
}
