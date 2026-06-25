import { NavLink } from "react-router-dom";
// Tableau des différentes options de notre navbar et leur lien
const links = [
  { to: "/", label: "Accueil" },
  { to: "/visualisation", label: "Visualisation" },
  { to: "/statistiques", label: "Statistiques" },
];

function Header() {
  return (
    <header className="bg-slate-900 text-white">
      <nav className="flex items-center gap-6 px-6 py-4">
        <img
          src="../../../public/logo.png"
          alt="logo du site"
          class="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
        />
        <ul className="flex gap-4">
          {/* Creation des différantes option de navigation */}
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
