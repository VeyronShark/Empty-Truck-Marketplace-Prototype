import { useState } from 'react'
import { ArrowLeft, ArrowRight, Truck, UserRound } from 'lucide-react'
import { Field, PageTitle } from '../components/UI.jsx'
import { useMarketplace } from '../store/MarketplaceContext.jsx'

export function SignupPage({ onContinue, onBack }) {
  const { role, update, notify, users, trucks, shipments } = useMarketplace()
  const [form, setForm] = useState({ name: '', business: '', phone: '', role })
  const [submitted, setSubmitted] = useState(false)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!form.name.trim() || !form.business.trim() || !form.phone.trim()) return
    const id = form.role === 'owner' ? 'u1' : 'u2'
    const nextUsers = users.map((user) => user.id === id ? {
      ...user,
      name: form.name.trim(),
      business: form.business.trim(),
      phone: form.phone.trim(),
      role: form.role,
      city: form.role === 'owner' ? 'Bhubaneswar' : 'Cuttack',
      verified: false,
      initials: form.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    } : user)
    update({
      users: nextUsers,
      trucks: form.role === 'owner' ? trucks.map((truck) => truck.ownerId === id ? { ...truck, verified: false } : truck) : trucks,
      shipments: form.role === 'shipper' ? shipments.map((shipment) => shipment.shipperId === id ? { ...shipment, verified: false } : shipment) : shipments,
      role: form.role,
      page: 'Verification',
    })
    notify('Demo account created. Continue to the simulated verification step.')
    onContinue()
  }
  return <>
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to welcome</button>
    <PageTitle eyebrow="DEMO ONBOARDING" title="Create your demo account" description="No password or real sign-in — just enough to experience both sides of the marketplace." />
    <form className="form-card signup-card" onSubmit={submit}>
      <div className="form-section-title"><span className="step-number"><UserRound size={15} /></span><div><strong>Your business profile</strong><small>These details appear on your sample listing.</small></div></div>
      <div className="form-grid">
        <Field label="Your name"><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ramesh Kumar" required /></Field>
        <Field label="Business name"><input value={form.business} onChange={(e) => set('business', e.target.value)} placeholder="e.g. Ramesh Transport" required /></Field>
        <Field label="Phone number"><input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" required /></Field>
        <Field label="I’m joining as"><select value={form.role} onChange={(e) => set('role', e.target.value)}><option value="owner">Truck owner</option><option value="shipper">Shipper</option></select></Field>
      </div>
      {submitted && (!form.name.trim() || !form.business.trim() || !form.phone.trim()) && <p className="form-error">Add your name, business name and phone number to continue.</p>}
      <div className="form-footer"><span><Truck size={16} /> Prefilled example accounts remain available from the header.</span><div><button className="button button-primary" type="submit">Continue to verification <ArrowRight size={15} /></button></div></div>
    </form>
  </>
}
