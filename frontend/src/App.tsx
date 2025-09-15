import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import SocketTest from './components/socket/socket-test'

function App() {
  return (
    <div className="app min-h-screen">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/socket-test" element={<SocketTest />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
