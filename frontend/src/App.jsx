import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import TripPage from './pages/TripPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home/:clientId" element={<LandingPage />} />
        <Route path="/home/:clientId/trips/:tripId" element={<TripPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
