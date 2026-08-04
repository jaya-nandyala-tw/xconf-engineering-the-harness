import { Outlet } from "react-router-dom";
import thoughtworksLogoLight from "../assets/brand/thoughtworks-wordmark-light.png";
import thoughtworksLogoDark from "../assets/brand/thoughtworks-wordmark-dark.png";
import { TabSwitcher } from "./TabSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../lib/theme";

export function LandingLayout() {
  const { isLight } = useTheme();

  return (
    <div className="min-h-screen bg-surface text-ink px-8 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">XConf 2026</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Engineering the Harness</h1>
            <img
              src={isLight ? thoughtworksLogoDark : thoughtworksLogoLight}
              alt="Thoughtworks"
              className="mt-4 h-5 w-auto opacity-80"
            />
          </div>
          <div className="flex items-center gap-3">
            <TabSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
