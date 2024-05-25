import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Navbar from './components/Navbar/Navbar'
import SellerDashboard from './pages/SellerDashboard/SellerDashboard'
import Home from './pages/Home/Home'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App