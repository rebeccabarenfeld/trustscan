import React, { useState } from 'react'
import { generateDocument } from '../lib/claude.js'
import './DocGenerator.css'

const QUESTIONS = {
  'Access Control Policy': [
    { id: 'idp', label: 'Identity provider / SSO?', opts: ['Okta', 'Azure AD', 'Google Workspace', 'AWS IAM', 'None yet'] },
    { id: 'mfa', label: 'MFA currently enforced?', opts: ['Yes everywhere', 'Partially', 'Not yet'] },
    { id: 'review', label: 'Access review frequency?', opts: ['Monthly', 'Quarterly', 'Annually'] },
  ],
  'Key Management Policy': [
    { id: 'kms', label: 'Key management system?', opts: ['AWS KMS', 'Azure Key Vault', 'HashiCorp Vault', 'GCP KMS', 'Custom'] },
    { id: 'rotation', label: 'Key rotation frequency?', opts: ['30 days', '90 days', '180 days', '1 year'] },
    { id: 'datatype', label: 'Sensitive data handled?', opts: ['PII', 'PHI / HIPAA', 'PCI', 'Financial', 'All types'] },
  ],
  'Vendor Risk Management Policy': [
    { id: 'vendors', label: 'Number of critical vendors?', opts: ['1–5', '6–15', '16–30', '30+'] },
    { id: 'gdpr', label: 'Process EU personal data?', opts: ['Yes — EU customers', 'Yes — EU employees', 'Yes — both', 'No'] },
    { id: 'review_freq', label: 'Vendor review frequency?', opts: ['Annually', 'Bi-annually', 'Quarterly'] },
  ],
  'Disaster Recovery Plan': [
    { id: 'rto', label: 'Target RTO?', opts: ['1 hour', '4 hours', '8 hours', '24 hours'] },
    { id: 'rpo', label: 'Target RPO?', opts: ['15 min', '1 hour', '4 hours', '24 hours'] },
    { id: 'cloud', label: 'Primary cloud setup?', opts: ['AWS single region', 'AWS multi-region', 'AWS + Azure', 'Other'] },
  ],
}

const DEFAULT_QUESTIONS = [
  { id: 'company_size', label: 'Company size?', opts: ['1–10', '11–50', '51–200', '200+'] },
  { id: 'industry', label: 'Industry?', opts: ['Cybersecurity', 'Fintech', 'Healthtech', 'SaaS', 'Other'] },
  { id: 'certifications', label: 'Existing certifications?', opts: ['ISO 27001', 'SOC 2', 'GDPR compliant', 'None yet'] },
]

export default function DocGenerator({ gap, context, onDone, onBack }) {
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [doc, setDoc] = useState(null)
  const [copied, setCopied] = useState(false)

  const docName = gap.doc_needed || 'Security Policy'
  const questions = QUESTIONS[docName] || DEFAULT_QUESTIONS

  const answeredCount = Object.keys(answers).length
  const canGenerate = answeredCount >= Math.ceil(questions.length * 0.5)

  async function handleGenerate() {
    setLoading(true)
    try {
      const context_str = `Company: ${context?.company_name || 'Unknown'}. Trust Center URL scanned. Questionnaire: ${gap.id}.`
      const generated = await generateDocument(docName, context_str, answers)
      setDoc(generated)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(doc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function renderMarkdown(text) {
    return text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|l])/gm, '')
  }

  return (
    <div className="container">
      <div className="dg-top">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back to results</button>
        <div className="dg-gap-info">
          <span className="badge badge-red" style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem' }}>{gap.id}</span>
          <span className="dg-gap-q">{gap.question}</span>
        </div>
      </div>

      <div className="dg-header">
        <span className="section-label">AI Document Generator</span>
        <h2 className="dg-title">Generate: {docName}</h2>
        <p className="dg-subtitle">Answer a few quick questions so we can personalize this document to your exact setup.</p>
      </div>

      {!doc ? (
        <div className="card dg-wizard">
          <div className="dg-questions">
            {questions.map(q => (
              <div key={q.id} className="dg-q">
                <div className="dg-q-label">{q.label}</div>
                <div className="dg-q-opts">
                  {q.opts.map(opt => (
                    <button
                      key={opt}
                      className={`dg-opt${answers[q.id] === opt ? ' selected' : ''}`}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!canGenerate && (
            <div className="dg-hint">
              Answer at least {Math.ceil(questions.length * 0.5)} questions to generate
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg dg-gen-btn"
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
          >
            {loading ? (
              <><span className="spinner" /> Generating with Claude AI...</>
            ) : (
              `Generate ${docName} →`
            )}
          </button>
        </div>
      ) : (
        <div className="dg-result">
          <div className="dg-result-header">
            <div>
              <div className="dg-result-title">{docName}</div>
              <div className="dg-result-subtitle">Generated by Claude AI · Ready to use</div>
            </div>
            <div className="dg-result-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setDoc(null)}>
                Regenerate
              </button>
            </div>
          </div>

          <div className="card dg-doc-preview">
            <div
              className="dg-doc-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(doc) }}
            />
          </div>

          <div className="dg-done-actions">
            <button className="btn btn-primary btn-lg" onClick={onDone}>
              ✓ Done — Back to all gaps
            </button>
            <button className="btn btn-secondary" onClick={() => setDoc(null)}>
              Regenerate with different answers
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
