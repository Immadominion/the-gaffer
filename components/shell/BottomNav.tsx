"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatCircleDots, FolderOpen, House, SoccerBall, Wallet } from "@/components/icons";

const items = [
  { href: "/touchline", Icon: House, also: [] as string[] },
  { href: "/matchday", Icon: SoccerBall, also: ["/call"] },
  { href: "/gaffer", Icon: ChatCircleDots, also: [] },
  { href: "/dossier", Icon: FolderOpen, also: [] },
  { href: "/wallet", Icon: Wallet, also: [] },
];

export default function BottomNav() {
  const path = usePathname();
  const active = (href: string, also: string[]) =>
    (href === "/touchline" ? path === "/touchline" : path.startsWith(href)) ||
    also.some((p) => path.startsWith(p));

  return (
    <nav className="bottomnav">
      <div className="bottomnav-inner">
        {items.map(({ href, Icon, also }) => {
          const on = active(href, also);
          return (
            <Link key={href} href={href} className={`navbtn${on ? " navon" : ""}`} aria-current={on ? "page" : undefined}>
              <Icon size={21} weight={on ? "fill" : "regular"} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
