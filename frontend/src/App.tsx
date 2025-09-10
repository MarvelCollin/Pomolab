import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import LearnTogether from './pages/learn-together'

function Home() {
  return (
    <div className="home-page p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Pomolab</h1>
      <p className="text-lg mb-8">Your productivity and learning companion</p>
      <div className="navigation-buttons flex justify-center gap-4">
        <Link 
          to="/learn-together" 
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Start Video Learning Session
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <nav className="navbar bg-gray-800 text-white p-4">
        <div className="nav-container flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Pomolab
          </Link>
          <div className="nav-links flex gap-4">
            <Link to="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link to="/learn-together" className="hover:text-gray-300">
              Learn Together
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn-together" element={<LearnTogether />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
