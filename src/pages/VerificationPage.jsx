import { useState } from 'react'
import { BadgeCheck, Check, FileCheck2, ShieldCheck, Upload } from 'lucide-react'
import { PageTitle } from '../components/UI.jsx'
import { useMarketplace } from '../store/MarketplaceContext.jsx'

export function VerificationPage({ onBack }) {
  const { role, users, trucks, shipments, update, notify } = useMarketplace()
  const [files, setFiles] = useState({})
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const ownerDocs = ['Truck RC', 'Driving licence', 'Business ID / GST']
  const shipperDocs = ['Business ID / GST', 'Authorised contact ID']
  const documents = role === 'owner' ? ownerDocs : shipperDocs
  const currentUser = users.find((user) => user.id === (role === 'owner' ? 'u1' : 'u2'))
  const start = () => {
    if (Object.keys(files).length < documents.length) return notify('Choose a demo file for each document before verification.')
    setVerifying(true)
    window.setTimeout(() => {
      const next = users.map((user) => user.id === currentUser.id ? { ...user, verified: true } : user)
      update({
        users: next,
        trucks: role === 'owner' ? trucks.map((truck) => truck.ownerId === currentUser.id ? { ...truck, verified: true } : truck) : trucks,
        shipments: role === 'shipper' ? shipments.map((shipment) => shipment.shipperId === currentUser.id ? { ...shipment, verified: true } : shipment) : shipments,
      })
      setVerifying(false)
      setVerified(true)
      notify('Profile verified for this demo.')
    }, 1400)
  }
  return <>
    <PageTitle eyebrow="TRUST · ONBOARDING" title="Verify your business" description="A quick demo check so every marketplace participant can trade with confidence." />
    <div className="verify-layout"><div className="verify-copy"><span className="verify-shield"><ShieldCheck size={28} /></span><h2>Trust starts with the basics.</h2><p>We verify identity and business details before displaying a profile badge. This prototype simulates the review — no documents are uploaded or sent anywhere.</p><div className="verify-profile"><span className="avatar avatar-large">{currentUser?.initials || 'DM'}</span><div><strong>{currentUser?.business || 'Demo business'}</strong><small>{role === 'owner' ? 'Truck owner' : 'Shipper'} · {currentUser?.city}</small></div>{(verified || currentUser?.verified) && <span className="verified"><BadgeCheck size={15} /> Verified</span>}</div><div className="verify-note"><FileCheck2 size={17} /><span>Files stay in this browser session. For presentation purposes only.</span></div></div>
      <div className="verify-card"><span className="eyebrow">DEMO DOCUMENT CHECK</span><h3>Upload your documents</h3><p>Choose any file — the prototype only uses the filename to simulate a review.</p>{documents.map((document) => <label className={`upload-row ${files[document] ? 'uploaded' : ''}`} key={document}><span className="upload-icon">{files[document] ? <Check size={17} /> : <Upload size={17} />}</span><span className="upload-label"><strong>{document}</strong><small>{files[document] || 'Select a file from your device'}</small></span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFiles((current) => ({ ...current, [document]: e.target.files?.[0]?.name || '' }))} /></label>)}{verified && <div className="verified-result"><BadgeCheck size={18} /> Your demo profile is verified and ready to trade.</div>}<div className="verify-actions"><button className="button button-quiet" onClick={onBack}>Back to dashboard</button><button className="button button-primary" disabled={verifying || verified} onClick={start}>{verifying ? <><span className="spinner spinner-white" /> Verifying…</> : verified ? 'Verified' : 'Start demo verification'}</button></div></div></div>
  </>
}
