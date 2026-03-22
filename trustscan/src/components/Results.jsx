import React, { useState } from 'react'
import './Results.css'

export default function Results({ data, input, onFixGap, onRescan }) {
  const [activeTab, setActiveTab] = useState('missing')
  const score = data.overall_score || 52
  const scoreColor = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score >= 70 ? 'Good' : score >= 50 ? 'Needs work' : 'Critical gaps'

  return (
    <div className="container-wide">
      <div className="re-top">
        <button className="btn btn-secondary btn-sm" onClick={onRescan}>
          ← New scan
        </button>
        <div className="re-company">
          <span className="re-company-name">{data.company_name || 'Your Trust Center'}</span>
          <span className="re-company-type">{input.type} · {data.total_questions} questions</span>
        </div>
      </div>

      <div className="re-hero card">
        <div className="re-score-wrap">
          <div className="re-score-circle" style={{ '--score-color': scoreColor }}>
            <svg viewBox="0 0 120 120" className="re-gauge-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={scoreColor} strokeWidth="10"
                strokeDasharray={`${score * 3.14} 314`}
                strokeDashoffset="78.5"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1.2s ease' }}
              />
            </svg>
            <div className="re-score-inner">
              <span className="re-score-num" style={{ color: scoreColor }}>{score}%</span>
              <span className="re-score-lbl">{scoreLabel}</span>
            </div>
          </div>
          <div className="re-score-info">
            <h2 className="re-score-title">CAIQ Coverage Score</h2>
            <p className="re-score-desc">
              Your Trust Center covers <strong>{score}%</strong> of {input.type} requirements.
              {data.missing?.length > 0 && ` Fix ${data.missing.length} critical gaps to reach enterprise-ready status.`}
            </p>
            <div className="re-score-metrics">
              <div className="re-metric">
                <span className="re-metric-num" style={{ color: '#10B981' }}>{data.covered?.length || 0}</span>
                <span className="re-metric-lbl">Covered</span>
              </div>
              <div className="re-metric">
                <span className="re-metric-num" style={{ color: '#F59E0B' }}>{data.partial?.length || 0}</span>
                <span className="re-metric-lbl">Partial</span>
              </div>
              <div className="re-metric">
                <span className="re-metric-num" style={{ color: '#EF4444' }}>{data.missing?.length || 0}</span>
                <span className="re-metric-lbl">Missing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="re-layout">
        <div className="re-main">
          <div className="re-tabs">
            {[
              { id: 'missing', label: `Critical gaps (${data.missing?.length || 0})` },
              { id: 'partial', label: `Partial (${data.partial?.length || 0})` },
              { id: 'covered', label: `Covered (${data.covered?.length || 0})` },
            ].map(tab => (
              <button
                key={tab.id}
                className={`re-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'missing' && (
            <div className="re-items">
              {data.missing?.map((item, i) => (
                <div key={i} className="card re-item re-item-miss">
                  <div className="re-item-head">
                    <div className="re-item-icon re-icon-miss">✕</div>
                    <div className="re-item-info">
                      <div className="re-item-q">{item.question}</div>
                      <div className="re-item-meta">
                        <span className="badge badge-gray" style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem' }}>{item.id}</span>
                        <span className="badge badge-gray">{item.domain}</span>
                        {item.impact?.includes('High') && <span className="badge badge-red">High impact</span>}
                      </div>
                      {item.impact && <div className="re-item-impact">{item.impact}</div>}
                    </div>
                    {item.doc_needed && (
                      <button
                        className="btn btn-primary btn-sm re-fix-btn"
                        onClick={() => onFixGap(item)}
                      >
                        Fix with AI →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'partial' && (
            <div className="re-items">
              {data.partial?.map((item, i) => (
                <div key={i} className="card re-item re-item-part">
                  <div className="re-item-head">
                    <div className="re-item-icon re-icon-part">~</div>
                    <div className="re-item-info">
                      <div className="re-item-q">{item.question}</div>
                      <div className="re-item-meta">
                        <span className="badge badge-gray" style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem' }}>{item.id}</span>
                        <span className="badge badge-gray">{item.domain}</span>
                      </div>
                      {item.reason && <div className="re-item-reason">{item.reason}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'covered' && (
            <div className="re-items">
              {data.covered?.map((item, i) => (
                <div key={i} className="card re-item re-item-ok">
                  <div className="re-item-head">
                    <div className="re-item-icon re-icon-ok">✓</div>
                    <div className="re-item-info">
                      <div className="re-item-q">{item.question}</div>
                      <div className="re-item-meta">
                        <span className="badge badge-gray" style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem' }}>{item.id}</span>
                        <span className="badge badge-gray">{item.domain}</span>
                      </div>
                      {item.evidence && <div className="re-item-evidence">{item.evidence}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="re-sidebar">
          <div className="card re-domains">
            <div className="re-domains-title">Coverage by domain</div>
            {data.domains?.map((d, i) => {
              const color = d.score >= 70 ? '#10B981' : d.score >= 45 ? '#F59E0B' : '#EF4444'
              return (
                <div key={i} className="re-domain">
                  <div className="re-domain-name">{d.name}</div>
                  <div className="re-domain-bar-wrap">
                    <div className="re-domain-bar" style={{ width: `${d.score}%`, background: color }} />
                  </div>
                  <div className="re-domain-pct" style={{ color }}>{d.score}%</div>
                </div>
              )
            })}
          </div>

          {data.missing?.length > 0 && (
            <div className="card re-cta">
              <div className="re-cta-title">Fix all gaps with AI</div>
              <div className="re-cta-desc">
                Generate all {data.missing.length} missing compliance documents
                in minutes. Personalized to your infrastructure.
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={() => onFixGap(data.missing[0])}
              >
                Start fixing gaps →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
