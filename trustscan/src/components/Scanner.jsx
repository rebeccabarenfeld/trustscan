import React, { useState } from 'react'
import { analyzeTrustCenter } from '../lib/claude.js'
import './Scanner.css'

const EXAMPLES = [
  { label: 'Gong demo', url: 'https://secure-trust-sphere.base44.app/TrustCenter?slug=gong' },
  { label: 'trust.gong.io', url: 'https://trust.gong.io' },
  { label: 'trust.safebase.io', url: 'https://trust.safebase.io' },
]

const QTYPES = [
  { id: 'CAIQ', name: 'CAIQ', desc: 'Cloud Security Alliance · 261 q.' },
  { id: 'SIG-Lite', name: 'SIG-Lite', desc: 'Shared Assessments · 150 q.' },
  { id: 'VSA', name: 'VSA', desc: 'Vendor Security Alliance' },
  { id: 'ISO 27001', name: 'ISO 27001', desc: '114 controls' },
  { id: 'SOC 2', name: 'SOC 2', desc: 'Trust Service Criteria' },
  { id: 'Custom', name: 'Custom', desc: 'Upload your own' },
]

const SCAN_STEPS = [
  'Fetching Trust Center content...',
  'Parsing questionnaire structure...',
  'Mapping documents to questions...',
  'Identifying coverage gaps...',
  'Generating gap analysis report...',
]

export default function Scanner({ onComplete }) {
  const [url, setUrl] = useState('')
  const [qtype, setQtype] = useState('CAIQ')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  async function handleScan() {
    if (!url.trim()) {
      setError('Please enter a Trust Center URL')
      return
    }
    setError('')
    setLoading(true)
    setStep(0)

    const interval = setInterval(() => {
      setStep(s => Math.min(s + 1, SCAN_STEPS.length - 1))
    }, 800)

    try {
      const data = await analyzeTrustCenter(url.trim(), qtype)
      clearInterval(interval)
      setStep(SCAN_STEPS.length - 1)
      setTimeout(() => onComplete(data, { url: url.trim(), type: qtype }), 500)
    } catch (err) {
      clearInterval(interval)
      setError('Analysis failed. Please check your API key or try again.')
      setLoading(false)
      setStep(0)
    }
  }

  return (
    <div className="container">
      <div className="sc-hero">
        <div className="sc-badge">
          <span className="sc-badge-dot"></span>
          Free compliance scanner · No signup required
        </div>
        <h1 className="sc-title">How complete is your<br />Trust Center?</h1>
        <p className="sc-subtitle">
          Paste any Trust Center URL, choose a questionnaire standard,
          and get your compliance gap analysis in 60 seconds.
        </p>
      </div>

      {!loading ? (
        <div className="sc-form">
          <div className="card sc-card">
            <div className="sc-step-label">
              <span className="sc-step-num">1</span>
              Your Trust Center URL
            </div>
            <div className="sc-input-wrap">
              <input
                className="sc-input"
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setError('') }}
                placeholder="https://trust.yourcompany.com"
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
            </div>
            <div className="sc-examples">
              <span className="sc-examples-label">Try:</span>
              {EXAMPLES.map(ex => (
                <button key={ex.label} className="sc-ex-btn" onClick={() => setUrl(ex.url)}>
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card sc-card">
            <div className="sc-step-label">
              <span className="sc-step-num">2</span>
              Questionnaire standard
            </div>
            <div className="sc-qtype-grid">
              {QTYPES.map(q => (
                <div
                  key={q.id}
                  className={`sc-qtype${qtype === q.id ? ' selected' : ''}`}
                  onClick={() => setQtype(q.id)}
                >
                  <div className="sc-qtype-name">{q.name}</div>
                  <div className="sc-qtype-desc">{q.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="sc-error">{error}</div>}

          <button
            className="btn btn-primary btn-full btn-lg sc-scan-btn"
            onClick={handleScan}
            disabled={!url.trim()}
          >
            Scan my Trust Center →
          </button>

          <div className="sc-trust">
            <span>🔒 Your URL is never stored</span>
            <span>⚡ Results in ~60 seconds</span>
            <span>🆓 100% free</span>
          </div>
        </div>
      ) : (
        <div className="card sc-loading">
          <div className="sc-loading-title">Analyzing your Trust Center...</div>
          <div className="sc-prog-wrap">
            <div className="sc-prog-track">
              <div
                className="sc-prog-fill"
                style={{ width: `${((step + 1) / SCAN_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="sc-steps">
            {SCAN_STEPS.map((s, i) => (
              <div key={i} className={`sc-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                <span className="sc-step-dot">
                  {i < step ? '✓' : i === step ? <span className="spinner" /> : '○'}
                </span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
