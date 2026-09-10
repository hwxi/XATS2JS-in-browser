import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import CompilerPage from './CompilerPage'
import PreludeBrowserPage from './PreludeBrowserPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="brand">XATS2JS in Browser</div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Compiler</Link>
          <Link to="/prelude" className="nav-link">Prelude Browser</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<CompilerPage />} />
        <Route path="/prelude/*" element={<PreludeBrowserPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
