import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/common/navbar'
import Home from './pages/home'
import LearnTogether from './pages/learn-together'

function App() {
  return (
    <div className="app min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn-together" element={<LearnTogether />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
