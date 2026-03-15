import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard',   label: 'Dashboard' },
  { to: '/collections', label: 'Collections' },
  { to: '/logs',        label: 'Logs' },
  { to: '/settings',    label: 'Settings' },
];

export default function Sidebar() {
  return (
    <nav className="hidden md:flex w-56 bg-gray-900 border-r border-gray-800 flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-sm font-bold text-white leading-tight">
          Maintainerr<br />
          <span className="text-maintainerr-red">Overlay Helper</span>
        </h1>
      </div>
      <ul className="flex-1 py-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-600">v2.0.0</div>
    </nav>
  );
}
