"use client";

import Link from "next/link";
import { avatar } from "@/lib/data";
import { useGameData } from "@/lib/useGameData";

/* eslint-disable @next/next/no-img-element */

/**
 * Left rail of faces: you on top, the Gaffer at the bottom, and in between your
 * live rivals — the top of the Squad Ladder. Each rival links to their public
 * Dossier. No fake presence; these are real managers (empty until people sign).
 */
export default function SquadRail() {
  const g = useGameData();
  const meSeed = g.me?.seed || "you";
  const meBg = g.me?.bg || "d9f2e1";
  const rivals = g.ladder.filter((r) => !r.you).slice(0, 6);

  return (
    <div className="arail">
      <Link href="/settings" className="ava" aria-label="Your account" title="Account & settings">
        <img src={avatar(meSeed, meBg)} style={{ width: 46, height: 46 }} alt="You" />
        <span className="dot" style={{ background: "#0BA14A" }} />
      </Link>
      {rivals.length > 0 && (
        <>
          <div style={{ width: 30, height: 1, background: "#E7ECE3" }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: "#A6B2A9", letterSpacing: ".5px" }}>LADDER</div>
          {rivals.map((r) => (
            <Link href={`/p/${r.wallet}`} className="ava" key={r.rank} title={`#${r.rank} · ${r.name}`}>
              <img src={avatar(r.seed, r.bg)} alt={r.name} />
              <span className="dot" style={{ background: r.formGood ? "#0BA14A" : "#C0CABF" }} />
            </Link>
          ))}
        </>
      )}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <div style={{ width: 30, height: 1, background: "#E7ECE3" }} />
        <Link href="/gaffer" className="ava" title="Talk to the Gaffer">
          <img
            src="/img/gaffer.png"
            style={{ width: 46, height: 46, objectFit: "cover", objectPosition: "50% 16%", background: "#1a2b22" }}
            alt="The Gaffer"
          />
          <span className="dot" style={{ background: "#E5484D" }} />
        </Link>
      </div>
    </div>
  );
}
