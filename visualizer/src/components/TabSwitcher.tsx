import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Gallery", end: true },
  { to: "/visualizer", label: "Visualizer", end: false },
];

export function TabSwitcher() {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
              isActive ? "bg-flamingo text-white" : "text-white/50 hover:text-white/80"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
