import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sevas', label: 'Sevas' },
  { to: '/sevekari', label: 'Sevekari' },
  { to: '/assignments', label: 'Assignments' },
];

function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-xl justify-around border-t bg-white p-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-xl px-3 py-2 text-xs font-medium ${isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-600'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;
