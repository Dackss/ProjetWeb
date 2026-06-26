import { NavLink } from "react-router-dom";
// Tableau des différentes options de notre navbar et leur lien
const links = [
  { to: "/", label: "Accueil" },
  { to: "/visualisation", label: "Visualisation" },
  { to: "/statistiques", label: "Statistiques" },
];

function Header() {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <nav className="flex items-center px-6 py-2 relative">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="bg-slate-800 rounded-xl px-2 py-1">
            <img
              src="../../../public/logo.png"
              alt="logo du site"
              className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_6px_rgba(148,163,184,0.3)]"
            />
          </div>
          <span className="font-semibold text-white tracking-wide">MaBorne</span>
        </NavLink>

        <ul className="absolute left-1/2 -translate-x-1/2 flex gap-6">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "text-sky-400" : "text-white hover:text-sky-300"
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
