import BottomNav from "./BottomNav";
import LeftRail from "./LeftRail";
import SquadRail from "./SquadRail";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <LeftRail />
      <main className="appmain">{children}</main>
      <SquadRail />
      <BottomNav />
    </div>
  );
}
