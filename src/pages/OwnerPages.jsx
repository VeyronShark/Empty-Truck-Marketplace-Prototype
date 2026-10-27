import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BadgeIndianRupee, Check, Clock3, MapPin, PackageCheck, Plus, Star, Truck, Zap } from 'lucide-react'
import { useMarketplace } from '../store/MarketplaceContext.jsx'
import { EmptyState, Field, PageTitle, Stars, Status, Verified } from '../components/UI.jsx'

export function OwnerDashboard({ onPost, onDeliveryDone, ownerProfile }) {
  const { trucks, bookings, users } = useMarketplace()
  const mine = trucks.filter((truck) => truck.ownerId === 'u1' || truck.owner === 'Ramesh Transport')
  const active = mine.filter((truck) => truck.status === 'Available')
  const ownerBookings = bookings.filter((booking) => booking.truck.ownerId === 'u1' || booking.truck.owner === 'Ramesh Transport')
  const earnings = ownerBookings.filter((booking) => booking.status === 'Released').reduce((sum, booking) => sum + booking.feeSplit.ownerPayout, 0)
  const saved = mine.reduce((sum, truck) => sum + truck.savedKm, 0)
  return <>
    <PageTitle eyebrow="OWNER OVERVIEW" title={`Good morning, ${ownerProfile?.name?.split(' ')[0] || 'Ramesh'}`} description="Your return routes are an opportunity. Let's put them to work." action={<button className="button button-primary" onClick={onPost}><Plus size={17} /> Post capacity</button>} />
    <div className="metric-grid">
      <Metric icon={<Truck />} label="Active listings" value={active.length} change="Ready for a return load" />
      <Metric icon={<BadgeIndianRupee />} label="Earnings this month" value={`₹${earnings.toLocaleString('en-IN')}`} change="From completed return trips" />
      <Metric icon={<ArrowDownRight />} label="Empty km saved" value={`${saved} km`} change="Every matched leg counts" />
      <Metric icon={<Zap />} label="Incoming offers" value={ownerBookings.filter((item) => item.status === 'Requested' || item.status === 'Negotiating').length} change="Loads matched to your routes" />
    </div>
    <div className="section-heading"><div><h2>Your return routes</h2><p>Capacity you have made available to local businesses.</p></div><button className="text-button" onClick={onPost}>View all routes <ArrowUpRight size={15} /></button></div>
    <div className="route-grid">
      {active.slice(0, 3).map((truck) => <div className="route-card" key={truck.id}>
        <div className="route-card-top"><span className="vehicle-icon"><Truck size={20} /></span><Status>{truck.status}</Status></div>
        <div className="route-name">{truck.from} <span>→</span> {truck.to}</div>
        <div className="route-meta">{truck.type} · {truck.capacity} tonnes · {truck.date}</div>
        <div className="route-bottom"><span>₹{truck.price}/km</span><button className="link-button" onClick={() => onDeliveryDone(truck)}>Delivery done <ArrowUpRight size={14} /></button></div>
      </div>)}
      <button className="route-add" onClick={onPost}><span><Plus size={20} /></span><strong>List a return route</strong><small>Turn an empty leg into revenue</small></button>
    </div>
    <div className="story-callout"><span className="story-icon"><PackageCheck size={21} /></span><div><strong>Every return trip starts with one delivery done.</strong><p>Tell local shippers where your truck is heading next — they'll see a more affordable option, and you'll earn on the way home.</p></div><button className="button button-light" onClick={() => onDeliveryDone(mine[0])}>Delivery completed <ArrowUpRight size={15} /></button></div>
    <div className="section-heading"><div><h2>Next up</h2><p>Your latest matched opportunities.</p></div></div>
    {ownerBookings.length ? <div className="table-card">{ownerBookings.slice(0, 3).map((booking) => <div className="list-row" key={booking.id}><div className="avatar">{booking.shipment.business.slice(0, 2)}</div><div className="row-main"><strong>{booking.shipment.business}</strong><small>{booking.shipment.from} → {booking.shipment.to}</small></div><strong>₹{booking.total.toLocaleString('en-IN')}</strong><Status>{booking.status}</Status></div>)}</div> :
      <div className="table-card"><div className="list-row"><div className="avatar">{users.find((user) => user.id === 'u2')?.initials || 'UD'}</div><div className="row-main"><strong>{users.find((user) => user.id === 'u2')?.business || 'Utkal Distributors'}</strong><small>Cuttack → Bhubaneswar · 2 tonnes FMCG</small></div><Stars rating={users.find((user) => user.id === 'u2')?.rating || 4.8} reviews={users.find((user) => user.id === 'u2')?.reviews || 16} /><span className="match-pill">92% match</span></div></div>}
  </>
}

function Metric({ icon, label, value, change }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-caption">{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-change">{change}</span></div>
}

export function CapacityForm({ draft, setDraft, onSubmit, onCancel, ownerProfile }) {
  const [submitted, setSubmitted] = useState(false)
  const initial = draft || { type: '14ft', capacity: '3', from: 'Cuttack', to: 'Bhubaneswar', date: '2026-10-28', window: '08:00 – 12:00', price: '28', cargoText: 'FMCG, Packaged goods' }
  const [form, setForm] = useState(initial)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!form.from || !form.to || form.from === form.to || Number(form.capacity) <= 0 || Number(form.price) <= 0) return
    onSubmit({ ...form, capacity: Number(form.capacity), price: Number(form.price), cargo: form.cargoText.split(',').map((item) => item.trim()).filter(Boolean), ownerId: ownerProfile?.id || 'u1', owner: ownerProfile?.business || 'Ramesh Transport', driver: ownerProfile?.name || 'Ramesh Kumar', distance: 28, date: form.date, priceType: 'per km' })
    setDraft(null)
  }
  return <>
    <PageTitle eyebrow="OWNER · SUPPLY" title="Post return capacity" description="Share where your truck is heading. Get matched with a load for the return." />
    <form className="form-card" onSubmit={submit}>
      <div className="form-section-title"><span className="step-number">01</span><div><strong>Truck & route</strong><small>Tell shippers what you can carry and where you're going.</small></div></div>
      <div className="form-grid">
        <Field label="Truck type"><select value={form.type} onChange={(e) => set('type', e.target.value)}>{['Mini truck', 'LCV', '14ft', '20ft', 'Container'].map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label="Available capacity (tonnes)"><input type="number" step="0.1" min="0.1" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} required /></Field>
        <Field label="Current location / delivery city"><input value={form.from} onChange={(e) => set('from', e.target.value)} required /></Field>
        <Field label="Return destination"><input value={form.to} onChange={(e) => set('to', e.target.value)} required /></Field>
        <Field label="Available date"><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required /></Field>
        <Field label="Pickup window"><input value={form.window} onChange={(e) => set('window', e.target.value)} required /></Field>
        <Field label="Price expectation (₹ / km)"><input type="number" min="1" value={form.price} onChange={(e) => set('price', e.target.value)} required /></Field>
        <Field label="Accepted cargo types"><input value={form.cargoText} onChange={(e) => set('cargoText', e.target.value)} placeholder="FMCG, produce, textiles" /></Field>
      </div>
      {submitted && (!form.from || !form.to || form.from === form.to || Number(form.capacity) <= 0 || Number(form.price) <= 0) && <p className="form-error">Add different origin and destination cities, a positive capacity and a valid price.</p>}
      <div className="form-footer"><span><Verified /> Your verified profile appears with every listing.</span><div><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Publish return capacity</button></div></div>
    </form>
  </>
}

export function OffersPage({ onNavigate }) {
  const { bookings, updateBooking, notify } = useMarketplace()
  const offers = bookings.filter((booking) => booking.truck.ownerId === 'u1' && ['Requested', 'Negotiating'].includes(booking.status))
  const answer = (booking, status) => {
    updateBooking(booking.id, { status })
    notify(status === 'Negotiating' ? 'Counter-offer sent. The shipper has been notified.' : `Offer ${status.toLowerCase()}.`)
  }
  return <>
    <PageTitle eyebrow="OWNER · OPPORTUNITIES" title="Incoming offers" description="Review shipment requests matched to your return capacity." />
    {offers.length ? <div className="card-list">{offers.map((offer) => <div className="offer-card" key={offer.id}>
      <div className="offer-top"><div><span className="eyebrow">{offer.shipment.business}</span><h3>{offer.shipment.from} <span className="route-arrow">→</span> {offer.shipment.to}</h3></div><Status>{offer.status}</Status></div>
      <div className="offer-details"><span><PackageCheck size={15} /> {offer.shipment.weight} tonnes · {offer.shipment.cargo}</span><span><Clock3 size={15} /> {offer.shipment.date}</span><span><MapPin size={15} /> Your {offer.truck.type}</span><strong>₹{offer.total.toLocaleString('en-IN')}</strong></div>
      <div className="offer-bottom"><span className="match-pill">92% route match</span><div><button className="button button-quiet" onClick={() => answer(offer, 'Declined')}>Decline</button><button className="button button-outline" onClick={() => answer(offer, 'Negotiating')}>Counter-offer</button><button className="button button-primary" onClick={() => { answer(offer, 'Confirmed'); onNavigate('Trips') }}><Check size={16} /> Accept offer</button></div></div>
    </div>)}</div> : <EmptyState title="All caught up" text="New offers from shippers will appear here when their routes match your available capacity." action={<button className="button button-primary" onClick={() => onNavigate('Post Capacity')}>Add another route</button>} />}
  </>
}

export function OwnerTrips({ onNavigate }) {
  const { bookings, updateBooking, notify, users, update } = useMarketplace()
  const [reviewing, setReviewing] = useState(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const trips = bookings.filter((booking) => (booking.truck.ownerId === 'u1' || booking.truck.owner === 'Ramesh Transport') && !['Declined'].includes(booking.status))
  const submitReview = (booking) => {
    const updated = [...users]
    const person = updated.find((user) => user.id === booking.shipment.shipperId)
    if (person) {
      person.rating = Number(((person.rating * person.reviews + rating) / (person.reviews + 1)).toFixed(1))
      person.reviews += 1
    }
    update({ users: updated })
    updateBooking(booking.id, { ownerReview: { rating, review } })
    setReviewing(null)
    setReview('')
    notify('Thanks for rating your shipper.')
  }
  return <>
    <PageTitle eyebrow="OWNER · TRIPS" title="Your return trips" description="Manage confirmed loads, track progress and release escrow after delivery." />
    {trips.length ? <div className="card-list">{trips.map((booking) => <div className="trip-card" key={booking.id}>
      <div className="trip-top"><div><span className="eyebrow">RETURN LOAD · {booking.shipment.business}</span><h3>{booking.shipment.from} <span className="route-arrow">→</span> {booking.shipment.to}</h3></div><Status>{booking.status}</Status></div>
      <TripTimeline step={booking.trackingStep} />
      <div className="offer-details"><span><PackageCheck size={15} /> {booking.shipment.weight} tonnes · {booking.truck.type}</span><span>{booking.shipment.date}</span><strong>Owner payout ₹{booking.feeSplit.ownerPayout.toLocaleString('en-IN')}</strong></div>
      <div className="trip-actions">{booking.status === 'Confirmed' && <button className="button button-outline" onClick={() => { updateBooking(booking.id, { status: 'Escrow held' }); notify('Payment secured in demo escrow.') }}>View escrow</button>}{booking.status === 'Escrow held' && <button className="button button-primary" onClick={() => { updateBooking(booking.id, { status: 'In Transit', trackingStep: 2 }); notify('Trip marked in transit.') }}>Start trip</button>}{['In Transit', 'Picked up'].includes(booking.status) && <button className="button button-primary" onClick={() => { updateBooking(booking.id, { status: 'Delivered', trackingStep: 3, ownerDelivered: true }); notify('Delivery marked. Waiting for shipper receipt confirmation.') }}>Mark as delivered</button>}{booking.status === 'Released' && <span className="release-note"><Check size={15} /> ₹{booking.feeSplit.ownerPayout.toLocaleString('en-IN')} released to owner</span>}</div>
      {booking.status === 'Released' && !booking.ownerReview && <div className="owner-review"><div><strong>Rate {booking.shipment.business}</strong><small>How did the handoff go?</small></div>{reviewing !== booking.id ? <button className="button button-outline" onClick={() => setReviewing(booking.id)}><Star size={15} /> Leave a review</button> : <div className="review-controls"><div className="star-picker">{[1, 2, 3, 4, 5].map((value) => <button key={value} aria-label={`${value} stars`} onClick={() => setRating(value)}><Star size={19} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div><input value={review} onChange={(e) => setReview(e.target.value)} placeholder="Share a short review…" /><button className="button button-primary" onClick={() => submitReview(booking)}>Submit</button></div>}</div>}
    </div>)}</div> : <EmptyState title="No trips booked yet" text="When a shipper books one of your return routes, the trip will appear here." action={<button className="button button-primary" onClick={() => onNavigate('Offers')}>View offers</button>} />}
  </>
}

export function TripTimeline({ step = 0 }) {
  const stages = ['Booked', 'Pickup', 'In transit', 'Delivered']
  return <div className="timeline">{stages.map((stage, index) => <div className={`timeline-stage ${index <= step ? 'done' : ''}`} key={stage}><span className="timeline-dot">{index < step ? <Check size={12} /> : index + 1}</span><small>{stage}</small></div>)}</div>
}
