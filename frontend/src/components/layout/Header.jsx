import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/visualisation', label: 'Visualisation' },
  { to: '/statistiques', label: 'Statistiques' },
]

function Header() {
  return (
    <header className="bg-slate-900 text-white">
      <nav className="flex items-center gap-6 px-6 py-4">
        <span className="font-bold text-lg">LOGO</span>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'text-sky-400' : 'text-white hover:text-sky-300'
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
