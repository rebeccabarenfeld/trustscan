const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

export async function callClaude(prompt, maxTokens = 4000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!response.ok) throw new Error('Claude API error: ' + response.status)
  const data = await response.json()
  return data.content[0].text
}

export async function analyzeTrustCenter(url, questionnaireType) {
  const prompt = `You are a senior security compliance expert specializing in GRC (Governance, Risk, Compliance).

Analyze this Trust Center and map its content against ${questionnaireType} requirements.

Trust Center URL: ${url}

Since you cannot directly access the URL, analyze based on what a typical professional Trust Center at this URL would contain, and what ${questionnaireType} requires.

For context, ${questionnaireType} covers these key domains:
${getQuestionnaireDomains(questionnaireType)}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "company_name": "Company name extracted from URL",
  "overall_score": 52,
  "total_questions": ${getQuestionCount(questionnaireType)},
  "covered": [
    {"id": "A&A-01.1", "domain": "Audit & Assurance", "question": "Are audit policies established?", "evidence": "Typically covered by ISO 27001 certification"}
  ],
  "partial": [
    {"id": "BCR-06.1", "domain": "Business Continuity", "question": "Is BCP tested annually?", "reason": "BCP document exists but no test evidence shown"}
  ],
  "missing": [
    {"id": "IAM-07.1", "domain": "Identity & Access", "question": "Is MFA implemented?", "impact": "High - required for all enterprise security reviews", "doc_needed": "Access Control Policy", "generate_prompt": "Generate a complete Access Control Policy covering MFA requirements, least privilege, and privileged access management"}
  ],
  "domains": [
    {"name": "Audit & Assurance", "score": 65, "covered": 4, "total": 6},
    {"name": "Data Security", "score": 75, "covered": 6, "total": 8},
    {"name": "Encryption", "score": 50, "covered": 3, "total": 6},
    {"name": "Identity & Access", "score": 30, "covered": 2, "total": 7},
    {"name": "Incident Management", "score": 65, "covered": 4, "total": 6},
    {"name": "Infrastructure", "score": 85, "covered": 6, "total": 7},
    {"name": "Business Continuity", "score": 55, "covered": 4, "total": 7},
    {"name": "Vendor Management", "score": 25, "covered": 2, "total": 8}
  ]
}`

  const text = await callClaude(prompt, 3000)
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function generateDocument(docName, context, answers) {
  const answersText = Object.entries(answers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const prompt = `You are a senior security compliance expert.

Generate a complete, professional ${docName} policy document.

Company context:
${context}

User's specific answers:
${answersText}

Requirements:
- Write a complete, ready-to-use policy document
- Include all standard sections for this type of document
- Be specific and actionable, not generic
- Format with clear section headers
- Length: 400-600 words
- Make it realistic and professional, as if written by an actual CISO
- Include version number, date placeholder, and approval section at the top

Return the document in clean markdown format.`

  return await callClaude(prompt, 2000)
}

function getQuestionnaireDomains(type) {
  const domains = {
    'CAIQ': 'Audit & Assurance, Application Security, Business Continuity, Change Control, Encryption & Key Management, Data Security, Governance, HR Security, Identity & Access, Infrastructure, Incident Management, Logging, Supply Chain',
    'SIG-Lite': 'Risk Management, Security Policy, Organizational Security, Asset Management, HR Security, Physical Security, Communications, Access Control, Cryptography, Operations, Incident Management, Business Continuity, Compliance',
    'ISO 27001': 'Information security policies, Organization, Human resource security, Asset management, Access control, Cryptography, Physical security, Operations, Communications, System acquisition, Supplier relationships, Incident management, Business continuity, Compliance',
    'SOC 2': 'Security (CC), Availability (A), Processing Integrity (PI), Confidentiality (C), Privacy (P)',
    'VSA': 'Data Protection, Access Controls, Security Policies, Vulnerability Management, Incident Response, Business Continuity, Compliance',
    'Custom': 'All standard security domains'
  }
  return domains[type] || domains['CAIQ']
}

function getQuestionCount(type) {
  const counts = { 'CAIQ': 261, 'SIG-Lite': 150, 'ISO 27001': 114, 'SOC 2': 64, 'VSA': 86, 'Custom': 100 }
  return counts[type] || 100
}
