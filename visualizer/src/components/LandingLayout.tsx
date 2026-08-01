import { Outlet } from "react-router-dom";
import thoughtworksLogo from "../assets/brand/thoughtworks-wordmark-light.png";
import { TabSwitcher } from "./TabSwitcher";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-wave text-white px-8 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">XConf 2026</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Engineering the Harness</h1>
            <img src={thoughtworksLogo} alt="Thoughtworks" className="mt-4 h-5 w-auto opacity-80" />
          </div>
          <TabSwitcher />
        </div>

        <div className="mt-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
