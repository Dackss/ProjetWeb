const BASE_URL = 'http://localhost:8000/api'

const request = async (method, path, data) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  })
  return res.json()
}

export const getStations = () => request('GET', '/stations.php')

export const getPointsDeCharge = () => request('GET', '/points_de_charge.php')

export const createPointDeCharge = (data) => request('POST', '/points_de_charge.php', data)

export const updatePointDeCharge = (data) => request('PUT', '/points_de_charge.php', data)

export const deletePointDeCharge = (id) => request('DELETE', '/points_de_charge.php', { id })

export const postPrediction = (data) => request('POST', '/predictions.php', data)
