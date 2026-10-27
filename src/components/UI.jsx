import { BadgeCheck, Star } from 'lucide-react'

export function Status({ children }) {
  const tone = /confirmed|available|verified|released|delivered/i.test(children)
    ? 'green'
    : /negotiat|transit|pickup|escrow|paid|requested/i.test(children)
      ? 'amber'
      : /declin|cancel|closed/i.test(children) ? 'red' : 'blue'
  return <span className={`status status-${tone}`}>{children}</span>
}

export function Verified() {
  return <span className="verified"><BadgeCheck size={14} /> Verified</span>
}

export function Stars({ rating, reviews }) {
  return <span className="stars"><Star size={14} fill="currentColor" /> {rating.toFixed(1)} <span className="muted">({reviews})</span></span>
}

export function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

export function EmptyState({ title, text, action }) {
  return <div className="empty-state"><div className="empty-icon">↗</div><h3>{title}</h3><p>{text}</p>{action}</div>
}

export function Field({ label, children, className = '' }) {
  return <label className={`field ${className}`}><span>{label}</span>{children}</label>
}
