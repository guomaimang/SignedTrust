import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import CertCheckPage from './CertCheckPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/certcheck" element={<CertCheckPage />} />
      </Routes>
    </Router>
  )
}

export default App
