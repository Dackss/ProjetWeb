import { Link } from "react-router-dom";

function Accueil() {
  return (
    <div className="space-y-16">
      {/* HERO — négatif margin pour casser le p-6 du Layout */}
      <section
        className="relative h-[300px] md:h-[400px] overflow-hidden -mx-6 -mt-6 rounded-b-3xl"
        style={{ width: "calc(100% + 3rem)" }}
      >
        <img
          src="/hero.jpg"
          alt="Bannière bornes de recharge"
          className="w-full h-full object-cover object-center"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">
            MaBorne
          </h1>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 border-b-2 border-indigo-500 inline-block pb-2">
            Que faisons-nous :
          </h2>
        </div>

        {/* SECTION 1 : Visualisation */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 h-64 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition duration-300">
            <img
              src="/carte-france.jpg"
              alt="Carte de France"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium">
              Une visualisation de toutes les bornes de recharge de toute la
              France. Vous trouverez une borne proche de vous.
            </p>
            <Link
              to="/visualisation"
              className="inline-block px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded"
            >
              Voir la carte
            </Link>
          </div>
        </div>

        {/* SECTION 2 : Statistiques */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium md:text-right">
              Une visualisation statistique des différentes bornes de charge.
            </p>
            <div className="md:text-right">
              <Link
                to="/statistiques"
                className="inline-block px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded"
              >
                Voir les statistiques
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-64 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition duration-300">
            <img
              src="/statistiques.jpg"
              alt="Caractéristiques techniques"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* SECTION 3 : Prédiction */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 h-64 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition duration-300">
            <img
              src="/prediction.jpg"
              alt="Prédiction IA et clusters"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 font-medium">
              Nous prédisons pour vous la puissance, l'implantation, et le
              cluster où est localisé votre point de charge.
            </p>
            <Link
              to="/prediction-cluster"
              className="inline-block px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded"
            >
              Essayer les prédictions
            </Link>
          </div>
        </div>

        {/* BONNE VISITE & CTA */}
        <div className="pt-12 text-center space-y-6 pb-6">
          <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">
            Bonne visite !
          </h3>
        </div>
      </div>
    </div>
  );
}

export default Accueil;
