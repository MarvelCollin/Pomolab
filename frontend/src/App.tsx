import { Routes, Route, Link } from 'react-router-dom'
import { Camera, Home as HomeIcon } from 'lucide-react'
import './App.css'
import LearnTogether from './pages/learn-together'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Pomolab</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Your productivity and learning companion for enhanced focus and collaboration
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/learn-together" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 font-semibold text-lg"
          >
            <Camera className="w-6 h-6" />
            Start Video Learning Session
          </Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              Pomolab
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
              <Link to="/learn-together" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Camera className="w-4 h-4" />
                Learn Together
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn-together" element={<LearnTogether />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
