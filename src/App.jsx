import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Consultations from './pages/Consultations'
import Calls from './pages/Calls'
import Prescriptions from './pages/Prescriptions'
import Appointments from './pages/Appointments'
import Questions from './pages/Questions'
import Chat from './pages/Chat'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorOnboarding from './pages/DoctorOnboarding'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setIsAuthenticated(true)
    setUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={user?.role === 'doctor' ? "/doctor-dashboard" : "/dashboard"} />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to={user?.role === 'doctor' ? "/doctor-dashboard" : "/dashboard"} />} 
        />
        <Route element={isAuthenticated ? <Layout userData={user || { name: 'User', avatar: 'U', id: 'PT-001' }} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard onLogout={handleLogout} />} />
        </Route>

        <Route path="/doctor-onboarding" element={<DoctorOnboarding onLogout={handleLogout} />} />

        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? (user?.role === 'doctor' ? "/doctor-dashboard" : "/dashboard") : "/login"} />} 
        />
      </Routes>
    </Router>
  )
}

export default App
