import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home/:clientId" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App