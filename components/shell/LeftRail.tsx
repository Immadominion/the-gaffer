"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  House,
  SoccerBall,
  Trophy,
  FolderOpen,
  ChartDonut,
  Wallet,
  ChatCircleDots,
  Plus,
} from "@/components/icons";

const items = [
  { href: "/touchline", Icon: House, also: [] as string[] },
  { href: "/matchday", Icon: SoccerBall, also: ["/call"] },
  { href: "/ladder", Icon: Trophy, also: [] },
  { href: "/dossier", Icon: FolderOpen, also: [] },
  { href: "/results", Icon: ChartDonut, also: [] },
  { href: "/wallet", Icon: Wallet, also: [] },
  { href: "/gaffer", Icon: ChatCircleDots, also: [] },
];

export default function LeftRail() {
  const path = usePathname();
  const active = (href: string, also: string[]) =>
    (href === "/touchline" ? path === "/touchline" : path.startsWith(href)) ||
    also.some((p) => path.startsWith(p));

  return (
    <div className="lrail">
      <div className="logo">
        <Image src="/img/logo.png" alt="The Gaffer" width={30} height={30} style={{ objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 34 }}>
        {items.map(({ href, Icon, also }) => {
          const on = active(href, also);
          return (
            <Link key={href} href={href} className={`railbtn${on ? " railon" : ""}`} aria-current={on ? "page" : undefined}>
              <Icon size={22} weight={on ? "fill" : "regular"} />
            </Link>
          );
        })}
      </div>
      <div style={{ marginTop: "auto" }}>
        <button
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            border: "1.5px dashed #BFCBC0",
            background: "none",
            color: "#0BA14A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Plus size={22} weight="bold" />
        </button>
      </div>
    </div>
  );
}
