import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Accueil from './pages/Accueil'
import Visualisation from './pages/Visualisation'
import Statistiques from './pages/Statistiques'
import PredictionCluster from './pages/PredictionCluster'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/visualisation" element={<Visualisation />} />
        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/prediction-cluster" element={<PredictionCluster />} />
      </Route>
    </Routes>
  )
}

export default App
