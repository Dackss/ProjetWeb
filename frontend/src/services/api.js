import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

export const getStations = () => api.get('/stations.php')

export const getPointsDeCharge = () => api.get('/points_de_charge.php')

export const createPointDeCharge = (data) => api.post('/points_de_charge.php', data)

export const updatePointDeCharge = (data) => api.put('/points_de_charge.php', data)

export const deletePointDeCharge = (id) => api.delete('/points_de_charge.php', { data: { id } })

export const getStatistiques = (departement) =>
  api.get('/statistiques.php', { params: { departement } })

export const postPrediction = (data) => api.post('/predictions.php', data)

export default api
