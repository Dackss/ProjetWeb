const BASE_URL = 'http://localhost:8001/api'

// Appelle l'API et renvoie le JSON. Lève une erreur (avec le message du
// backend si dispo) si la réponse HTTP n'est pas un succès, pour que les
// composants puissent faire un try/catch au lieu de recevoir {error: ...}
// comme si c'était une donnée valide.
async function request(method, path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
  })

  const body = await res.json()

  if (!res.ok) {
    throw new Error(body.error || `Erreur HTTP ${res.status}`)
  }

  return body
}

export const getStations = () => request('GET', '/stations.php')

export const getPointsDeCharge = ({ page = 1, limit = 50, commune = '', implantation = '' } = {}) =>
  request(
    'GET',
    `/points_de_charge.php?page=${page}&limit=${limit}&commune=${encodeURIComponent(commune)}&implantation=${encodeURIComponent(implantation)}`
  )

export const getPointDeCharge = (id) => request('GET', `/points_de_charge.php?id=${id}`)

export const createPointDeCharge = (data) => request('POST', '/points_de_charge.php', data)

export const updatePointDeCharge = (id, data) => request('PUT', `/points_de_charge.php?id=${id}`, data)

export const deletePointDeCharge = (id) => request('DELETE', `/points_de_charge.php?id=${id}`)

export const getCommunes = (recherche) => request('GET', `/communes.php?q=${encodeURIComponent(recherche || '')}`)

export const getImplantations = () => request('GET', '/implantations.php')

export const getDepartements = () => request('GET', '/departements.php')

export const getStatistiques = (departement) =>
  request('GET', `/statistiques.php?departement=${encodeURIComponent(departement)}`)

// Endpoint générique : { type: 'cluster' | 'implantation' | 'puissance', features }
// cluster prédit toutes les stations d'un coup, pas besoin de features.
export const postPrediction = (data) => request('POST', '/predictions.php', data)

// Les prédictions implantation/puissance renvoient un tableau "comparatif" trié
// par cv_score décroissant, avec le meilleur marqué "meilleur": true.
export const trouverMeilleurResultat = (comparatif) => comparatif.find((resultat) => resultat.meilleur)
