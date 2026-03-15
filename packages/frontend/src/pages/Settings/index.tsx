import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import PlexSettings from './PlexSettings';
import MaintainerrSettings from './MaintainerrSettings';
import OverlaySettings from './OverlaySettings';
import SchedulerSettings from './SchedulerSettings';

const tabs = [
  { to: 'plex',        label: 'Plex' },
  { to: 'maintainerr', label: 'Maintainerr' },
  { to: 'overlay',     label: 'Overlay' },
  { to: 'scheduler',   label: 'Scheduler' },
];

export default function Settings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>

      <div className="flex gap-1 border-b border-gray-800">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'text-white border-maintainerr-red'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<Navigate to="plex" replace />} />
        <Route path="plex"        element={<PlexSettings />} />
        <Route path="maintainerr" element={<MaintainerrSettings />} />
        <Route path="overlay"     element={<OverlaySettings />} />
        <Route path="scheduler"   element={<SchedulerSettings />} />
      </Routes>
    </div>
  );
}
