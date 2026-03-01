import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Caregiver from './pages/Caregiver.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/caregiver" element={<Caregiver />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:section" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
