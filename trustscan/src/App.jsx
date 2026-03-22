import React, { useState } from 'react'
import Scanner from './components/Scanner.jsx'
import Results from './components/Results.jsx'
import DocGenerator from './components/DocGenerator.jsx'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('scanner')
  const [scanData, setScanData] = useState(null)
  const [selectedGap, setSelectedGap] = useState(null)
  const [scanInput, setScanInput] = useState({ url: '', type: 'CAIQ' })

  function onScanComplete(data, input) {
    setScanData(data)
    setScanInput(input)
    setScreen('results')
  }

  function onFixGap(gap) {
    setSelectedGap(gap)
    setScreen('generator')
  }

  function onDocDone() {
    setScreen('results')
    setSelectedGap(null)
  }

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => setScreen('scanner')}>
            <span className="nav-logo-icon">⟨/⟩</span>
            <span className="nav-logo-text">TrustScan</span>
            <span className="nav-logo-badge">Beta</span>
          </div>
          <div className="nav-links">
            <span className="nav-link">Free compliance gap analyzer</span>
          </div>
          <div className="nav-status">
            <span className="nav-dot"></span>
            <span>AI-powered</span>
          </div>
        </div>
      </nav>

      <main className="main">
        {screen === 'scanner' && (
          <Scanner onComplete={onScanComplete} />
        )}
        {screen === 'results' && scanData && (
          <Results
            data={scanData}
            input={scanInput}
            onFixGap={onFixGap}
            onRescan={() => setScreen('scanner')}
          />
        )}
        {screen === 'generator' && selectedGap && (
          <DocGenerator
            gap={selectedGap}
            context={scanData}
            onDone={onDocDone}
            onBack={() => setScreen('results')}
          />
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>TrustScan — Free Security Compliance Analyzer</span>
          <span>Powered by Claude AI · Built for cyber-first companies</span>
        </div>
      </footer>
    </div>
  )
}
