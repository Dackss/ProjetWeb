function Accueil() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* HEADER */}
      <header className="relative w-full h-[300px] md:h-[400px] bg-slate-200 overflow-hidden">
        {/* Image de fond simulée par un dégradé moderne si aucune image n'est chargée */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90 mix-blend-multiply"></div>
        <img
          src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
          alt="Bannière bornes de recharge"
          className="w-full h-full object-cover"
        />
        {/* Texte centré sur l'image */}
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">
            {"Chargeprochedevous"}
          </h1>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16 flex-grow">
        {/* Titre de section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 border-b-2 border-indigo-500 inline-block pb-2">
            Que faisons-nous :
          </h2>
        </div>

        {/* SECTION 1 : Visualisation */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Boite Image à Gauche */}
          <div className="w-full md:w-1/2 h-64 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition duration-300 flex items-center justify-center text-slate-400">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
              alt="Carte de France"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Texte à Droite */}
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium">
              Une visualisation de toutes les bornes de recharge de toute la
              France. Vous trouverez une borne proche de vous.{" "}
              <span className="text-indigo-600 font-bold">:)</span>
            </p>
          </div>
        </div>

        {/* SECTION 2 : Caractéristiques */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          {/* Texte (Gauche) */}
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium md:text-right">
              Une visualisation statistiques des differente bornes de charge.
            </p>
          </div>
          {/* Boite Image (Droite) */}
          <div className="w-full md:w-1/2 h-64 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition duration-300 flex items-center justify-center text-slate-400">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
              alt="Caractéristiques techniques"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* SECTION 3 : Prédiction */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Boite Image à Gauche) */}
          <div className="w-full md:w-1/2 h-64 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition duration-300 flex items-center justify-center text-slate-400">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
              alt="Prédiction IA et clusters"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Texte à Droite */}
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium">
              Nous prédisons pour vous la puissance, l'implantation, et le
              cluster ou est localisé votre point de charge.
            </p>
          </div>
        </div>

        {/* BONNE VISITE & LIENS */}
        <div className="pt-12 text-center space-y-6">
          <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">
            Bonne visite !
          </h3>
        </div>
      </main>
    </div>
  );
}

export default Accueil;
