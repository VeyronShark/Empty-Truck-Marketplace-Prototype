import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BadgeIndianRupee, CalendarDays, Check, ChevronDown, Clock3, MapPin, PackageCheck, Search, ShieldCheck, SlidersHorizontal, Star, Truck, Zap } from 'lucide-react'
import { useMarketplace } from '../store/MarketplaceContext.jsx'
import { calculateFeeSplit, findMatches } from '../utils/matching.js'
import { EmptyState, Field, PageTitle, Stars, Status, Verified } from '../components/UI.jsx'
import { TripTimeline } from './OwnerPages.jsx'

export function ShipperDashboard({ onNavigate }) {
  const { shipments, bookings } = useMarketplace()
  const myShipments = shipments.filter((shipment) => shipment.shipperId === 'u2')
  const myBookings = bookings.filter((booking) => booking.shipment.shipperId === 'u2')
  const spent = myBookings.filter((booking) => booking.status === 'Released').reduce((total, booking) => total + booking.total, 0)
  return <>
    <PageTitle eyebrow="SHIPPER OVERVIEW" title="Move more, spend less" description="Find trusted trucks already heading where your goods need to go." action={<button className="button button-primary" onClick={() => onNavigate('Post Shipment')}>+ Post a shipment</button>} />
    <div className="metric-grid">
      <Metric icon={<PackageCheck />} label="Open shipments" value={myShipments.filter((shipment) => shipment.status === 'Open').length} change="Waiting for a return load" />
      <Metric icon={<Truck />} label="Bookings" value={myBookings.length} change="Matched capacity, ready to go" />
      <Metric icon={<BadgeIndianRupee />} label="Total freight paid" value={`₹${spent.toLocaleString('en-IN')}`} change="Through the marketplace" />
      <Metric icon={<ArrowDownRight />} label="Potential savings" value="Up to 32%" change="Compared with a dedicated trip" />
    </div>
    <div className="shipper-hero">
      <div><span className="eyebrow">A SMARTER WAY TO SHIP</span><h2>Those trucks are already going your way.</h2><p>Book unused return capacity for a better price — with verified owners and payment protection built in.</p><button className="button button-primary" onClick={() => onNavigate('Find Trucks')}><Search size={16} /> Find a return truck <ArrowUpRight size={15} /></button></div>
      <div className="shipper-route-visual"><span className="map-pin pin-a"><MapPin size={16} /></span><span className="route-dash" /><span className="map-pin pin-b"><MapPin size={16} /></span><div className="route-label label-a">Cuttack</div><div className="route-label label-b">Bhubaneswar</div><span className="mini-truck"><Truck size={20} /></span></div>
    </div>
    <div className="section-heading"><div><h2>Your shipments</h2><p>Posted loads and the latest status.</p></div><button className="text-button" onClick={() => onNavigate('Find Trucks')}>Browse matching trucks <ArrowUpRight size={15} /></button></div>
    {myShipments.length ? <div className="table-card">{myShipments.slice(0, 3).map((shipment) => <div className="list-row" key={shipment.id}><span className="shipment-icon"><PackageCheck size={18} /></span><div className="row-main"><strong>{shipment.from} → {shipment.to}</strong><small>{shipment.weight} tonnes · {shipment.cargo} · {shipment.date}</small></div><Status>{shipment.status}</Status><button className="text-button" onClick={() => onNavigate('Find Trucks')}>Find trucks <ArrowUpRight size={14} /></button></div>)}</div> : <EmptyState title="No shipments posted yet" text="Post your first load and discover trucks making that return journey." action={<button className="button button-primary" onClick={() => onNavigate('Post Shipment')}>Post shipment</button>} />}
  </>
}

function Metric({ icon, label, value, change }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-caption">{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-change">{change}</span></div>
}

export function ShipmentForm({ onSubmit, onCancel }) {
  const { users } = useMarketplace()
  const shipperProfile = users.find((user) => user.id === 'u2')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ from: 'Cuttack', to: 'Bhubaneswar', cargo: 'FMCG', weight: '2', date: '2026-10-29', pickupWindow: '08:00 – 12:00', budget: '1200', notes: '' })
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (!form.from || !form.to || form.from === form.to || Number(form.weight) <= 0 || Number(form.budget) <= 0) return
    onSubmit({ ...form, pickupWindow: form.pickupWindow === 'Any time' ? undefined : form.pickupWindow, weight: Number(form.weight), budget: Number(form.budget), shipperId: shipperProfile?.id || 'u2', business: shipperProfile?.business || 'Utkal Distributors', verified: shipperProfile?.verified === true })
  }
  return <>
    <PageTitle eyebrow="SHIPPER · DEMAND" title="Post a shipment" description="Tell us what needs moving. We'll find return trucks already heading your way." />
    <form className="form-card" onSubmit={submit}>
      <div className="form-section-title"><span className="step-number">01</span><div><strong>Shipment details</strong><small>Accurate details help us find your best-fit truck.</small></div></div>
      <div className="form-grid">
        <Field label="Pickup city"><input value={form.from} onChange={(e) => set('from', e.target.value)} required /></Field>
        <Field label="Drop city"><input value={form.to} onChange={(e) => set('to', e.target.value)} required /></Field>
        <Field label="Cargo type"><select value={form.cargo} onChange={(e) => set('cargo', e.target.value)}>{['FMCG', 'Produce', 'Textiles', 'Steel', 'Industrial', 'Packaged goods', 'Documents'].map((cargo) => <option key={cargo}>{cargo}</option>)}</select></Field>
        <Field label="Weight (tonnes)"><input type="number" step="0.1" min="0.1" value={form.weight} onChange={(e) => set('weight', e.target.value)} required /></Field>
        <Field label="Pickup date"><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required /></Field>
        <Field label="Preferred pickup window"><select value={form.pickupWindow} onChange={(e) => set('pickupWindow', e.target.value)}>{['Any time', '06:00 – 10:00', '08:00 – 12:00', '12:00 – 16:00', '16:00 – 20:00'].map((window) => <option key={window}>{window}</option>)}</select></Field>
        <Field label="Budget (₹)"><input type="number" min="1" value={form.budget} onChange={(e) => set('budget', e.target.value)} required /></Field>
        <Field label="Special notes" className="field-wide"><textarea rows="3" placeholder="Handling needs, loading instructions…" value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
      </div>
      {submitted && (!form.from || !form.to || form.from === form.to || Number(form.weight) <= 0 || Number(form.budget) <= 0) && <p className="form-error">Add different pickup and drop cities, a positive weight and a valid budget.</p>}
      <div className="form-footer"><span><ShieldCheck size={17} /> No payment until you confirm a match.</span><div><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit"><Search size={16} /> Find return trucks</button></div></div>
    </form>
  </>
}

export function FindTrucksPage() {
  const { trucks, shipments, selectedShipment, update, createBooking, notify } = useMarketplace()
  const currentShipment = selectedShipment || shipments.find((shipment) => shipment.shipperId === 'u2') || shipments[0]
  const [sort, setSort] = useState('match')
  const [truckType, setTruckType] = useState('All truck types')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [ran, setRan] = useState(false)
  let matches = useMemo(() => findMatches(trucks, currentShipment), [trucks, currentShipment])
  if (truckType !== 'All truck types') matches = matches.filter((item) => item.truck.type === truckType)
  if (sort === 'price') matches.sort((a, b) => a.truck.price - b.truck.price)
  if (sort === 'rating') matches.sort((a, b) => b.truck.rating - a.truck.rating)
  if (sort === 'date') matches.sort((a, b) => a.truck.date.localeCompare(b.truck.date))
  if (sort === 'capacity') matches.sort((a, b) => b.truck.capacity - a.truck.capacity)
  const runMatching = () => {
    setLoading(true)
    window.setTimeout(() => { setLoading(false); setRan(true); notify(`${matches.length} compatible return trucks found.`) }, 1000)
  }
  return <>
    <PageTitle eyebrow="SHIPPER · MATCHING" title="Find your return truck" description="Ranked by route fit, available capacity and pickup timing." action={<button className="button button-primary" onClick={runMatching} disabled={loading}><Search size={16} /> {loading ? 'Finding matches…' : 'Run matching'}</button>} />
    <div className="shipment-summary"><span className="shipment-icon"><PackageCheck size={18} /></span><div className="row-main"><strong>{currentShipment.from} <span className="route-arrow">→</span> {currentShipment.to}</strong><small>{currentShipment.weight} tonnes · {currentShipment.cargo} · Pickup {currentShipment.date}</small></div><button className="text-button" onClick={() => update({ page: 'Post Shipment' })}>Edit shipment</button></div>
    {loading && <div className="matching-progress"><span className="spinner" /><div><strong>Checking return routes…</strong><small>Comparing route, truck capacity and pickup window</small></div></div>}
    <div className="results-toolbar"><div><strong>{matches.length} trucks</strong><span className="muted"> · available for your route</span>{ran && <span className="match-pill match-pill-green">Just matched</span>}</div><div className="filters"><SlidersHorizontal size={15} /><Field label=""><select value={truckType} onChange={(e) => setTruckType(e.target.value)}>{['All truck types', 'Mini truck', 'LCV', '14ft', '20ft', 'Container'].map((type) => <option key={type}>{type}</option>)}</select></Field><Field label=""><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="match">Best match</option><option value="price">Lowest price</option><option value="rating">Top rated</option><option value="date">Pickup date</option><option value="capacity">Capacity</option></select></Field></div></div>
    {!matches.length ? <EmptyState title="No close matches just yet" text="Try a nearby pickup/drop city, or post a route alert so we can notify you." /> : <div className="results-layout"><div className="results-list">{matches.map((match, index) => <TruckResult key={match.truck.id} match={match} index={index} selected={selected?.truck.id === match.truck.id} onSelect={() => setSelected(match)} />)}</div>{selected && <TruckDetail match={selected} shipment={currentShipment} onClose={() => setSelected(null)} onBook={() => createBooking(selected.truck, currentShipment)} />}</div>}
    <div className="route-alert"><span className="alert-icon"><Zap size={17} /></span><div><strong>Want the next Cuttack → Bhubaneswar match?</strong><small>Get a demo alert when a verified truck lists your route.</small></div><button className="button button-outline" onClick={() => notify('Route alert saved for your next matching load.')}>Alert me on this route</button></div>
  </>
}

function TruckResult({ match, index, selected, onSelect }) {
  const { truck, score, route, capacity, timing } = match
  const dedicated = Math.round(truck.distance * truck.price * 1.48)
  const savings = Math.max(0, Math.round((1 - truck.distance * truck.price / dedicated) * 100))
  return <button className={`truck-result ${selected ? 'selected' : ''}`} onClick={onSelect}>
    <div className="result-top"><span className="vehicle-icon"><Truck size={20} /></span><span className="match-pill">{index === 0 && score === 92 ? '92%' : `${score}%`} match</span></div>
    <div className="result-owner"><strong>{truck.owner}</strong>{truck.verified && <Verified />}</div>
    <div className="result-route"><strong>{truck.from}</strong><span className="route-line" /> <strong>{truck.to}</strong></div>
    <div className="result-meta"><span>{truck.type} · up to {truck.capacity} tonnes</span><span><CalendarDays size={14} /> {truck.date}</span></div>
    <div className="result-meta"><span><Clock3 size={14} /> {truck.window}</span><Stars rating={truck.rating} reviews={truck.reviews} /></div>
    <div className="score-breakdown" title={`Route ${route}% · Capacity ${capacity}% · Timing ${timing}%`}>Route {route}% <span>·</span> Capacity {capacity}% <span>·</span> Timing {timing}%</div>
    <div className="result-bottom"><strong>₹{(truck.distance * truck.price).toLocaleString('en-IN')} <small>est. total</small></strong><span className="savings"><ArrowDownRight size={14} /> Save ~{savings}% vs dedicated</span></div>
  </button>
}

function TruckDetail({ match, shipment, onClose, onBook }) {
  const { truck, score, route, capacity, timing } = match
  const price = Math.round(truck.distance * truck.price)
  const feeSplit = calculateFeeSplit(price)
  return <aside className="detail-panel">
    <div className="detail-header"><span className="eyebrow">TRUCK DETAILS</span><button className="icon-button" onClick={onClose}>×</button></div>
    <div className="detail-truck"><span className="vehicle-icon vehicle-large"><Truck size={24} /></span><div><h3>{truck.type} return truck</h3><span>{truck.owner} <Verified /></span></div></div>
    <div className="detail-rating"><Stars rating={truck.rating} reviews={truck.reviews} /><span>Owner rating</span></div>
    <div className="detail-route"><div className="route-stop"><span className="stop-dot" /><div><small>PICKUP</small><strong>{truck.from}</strong></div></div><span className="detail-route-line" /><div className="route-stop"><span className="stop-dot stop-dot-amber" /><div><small>DROP-OFF</small><strong>{truck.to}</strong></div></div></div>
    <div className="detail-facts"><span>Pickup window<strong>{truck.date} · {truck.window}</strong></span><span>Capacity<strong>{truck.capacity} tonnes</strong></span><span>Accepted cargo<strong>{truck.cargo.join(', ')}</strong></span></div>
    <div className="detail-match"><div><span className="big-match">{score}%</span><div><strong>Match score</strong><small>Route {route}% · Capacity {capacity}% · Timing {timing}%</small></div></div><Check size={18} /></div>
    <div className="detail-price"><span>Estimated trip total</span><strong>₹{price.toLocaleString('en-IN')}</strong><small>Owner ₹{feeSplit.ownerPayout.toLocaleString('en-IN')} · marketplace fee ₹{feeSplit.commission}</small></div>
    <button className="button button-primary button-full" onClick={onBook}>Request this truck <ArrowUpRight size={16} /></button>
    <p className="detail-footnote">For your {shipment.weight}t {shipment.cargo} shipment. Payment is held in demo escrow.</p>
  </aside>
}

export function BookingsPage() {
  const { bookings, role, updateBooking, notify, update, users } = useMarketplace()
  const relevant = bookings.filter((booking) => role === 'owner' ? booking.truck.ownerId === 'u1' || booking.truck.owner === 'Ramesh Transport' : booking.shipment.shipperId === 'u2')
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [reviewing, setReviewing] = useState(null)
  const pay = (booking) => {
    updateBooking(booking.id, { status: 'Escrow held', paid: true })
    notify('Payment placed in demo escrow. The owner is ready to go.')
  }
  const confirmReceipt = (booking) => {
    updateBooking(booking.id, { status: 'Released', shipperConfirmed: true })
    notify('Receipt confirmed. Escrow released to the truck owner.')
  }
  const submitReview = (booking) => {
    const updated = [...users]
    const targetId = role === 'owner' ? booking.shipment.shipperId : booking.truck.ownerId
    const person = updated.find((user) => user.id === targetId)
    if (person) {
      person.rating = Number(((person.rating * person.reviews + rating) / (person.reviews + 1)).toFixed(1))
      person.reviews += 1
    }
    update({ users: updated })
    updateBooking(booking.id, role === 'owner' ? { ownerReview: { rating, review } } : { shipperReview: { rating, review } })
    setReviewing(null)
    setReview('')
    notify('Thanks for building trust in the marketplace.')
  }
  return <>
    <PageTitle eyebrow={`${role === 'owner' ? 'OWNER' : 'SHIPPER'} · BOOKINGS`} title="Bookings & tracking" description="Follow your load from booking to delivery. Payments stay protected in demo escrow." />
    {!relevant.length ? <EmptyState title="No bookings yet" text="Once a shipper requests a truck, the booking and live trip timeline will appear here." action={<button className="button button-primary" onClick={() => update({ page: role === 'owner' ? 'Offers' : 'Find Trucks' })}>{role === 'owner' ? 'View offers' : 'Find trucks'}</button>} /> :
      <div className="card-list">{relevant.map((booking) => {
        const ownerSide = role === 'owner'
        const reviewSubmitted = ownerSide ? booking.ownerReview : booking.shipperReview
        return <div className="booking-card" key={booking.id}>
          <div className="trip-top"><div><span className="eyebrow">BOOKING · {booking.shipment.business}</span><h3>{booking.shipment.from} <span className="route-arrow">→</span> {booking.shipment.to}</h3></div><Status>{booking.status}</Status></div>
          <TripTimeline step={booking.trackingStep} />
          <div className="booking-info"><div><small>{ownerSide ? 'SHIPPER' : 'TRUCK OWNER'}</small><strong>{ownerSide ? booking.shipment.business : booking.truck.owner} {(ownerSide ? booking.shipment.verified !== false : booking.truck.verified) && <Verified />}</strong></div><div><small>LOAD</small><strong>{booking.shipment.weight}t {booking.shipment.cargo}</strong></div><div><small>TRIP TOTAL</small><strong>₹{booking.total.toLocaleString('en-IN')}</strong></div></div>
          {booking.status === 'Requested' && ownerSide && <div className="notice-bar"><span>{booking.shipment.business} has requested your {booking.truck.type} truck.</span><button className="button button-primary" onClick={() => { updateBooking(booking.id, { status: 'Confirmed' }); notify('Booking confirmed. The shipper can now pay into escrow.') }}>Accept & confirm</button><button className="button button-quiet" onClick={() => { updateBooking(booking.id, { status: 'Negotiating' }); notify('Counter-offer sent to shipper.') }}>Counter-offer</button></div>}
          {booking.status === 'Negotiating' && <div className="notice-bar"><span>Counter-offer in progress. Agree to confirm this booking.</span><button className="button button-primary" onClick={() => { updateBooking(booking.id, { status: 'Confirmed' }); notify('Booking confirmed.') }}>Accept offer</button></div>}
          {booking.status === 'Confirmed' && !ownerSide && <div className="payment-box"><div><strong>Secure your booking</strong><small>Payment is held in escrow until you confirm delivery.</small></div><button className="button button-primary" onClick={() => pay(booking)}>Pay ₹{booking.total.toLocaleString('en-IN')} <ShieldCheck size={16} /></button></div>}
          {booking.status === 'Confirmed' && ownerSide && <div className="notice-bar"><span>Booking confirmed. Waiting for the shipper to fund escrow.</span><span className="muted">Demo payment protection</span></div>}
          {booking.status === 'Escrow held' && <div className="payment-box"><div><strong><ShieldCheck size={17} /> Funds are secure in escrow</strong><small>Shipper pays ₹{booking.total.toLocaleString('en-IN')} · released after delivery confirmation</small></div>{ownerSide ? <button className="button button-primary" onClick={() => { updateBooking(booking.id, { status: 'In Transit', trackingStep: 2 }); notify('Your trip is now in transit.') }}>Start trip</button> : <Status>Escrow protected</Status>}</div>}
          {['In Transit', 'Picked up'].includes(booking.status) && ownerSide && <div className="notice-bar"><span>Truck is on its way. Mark delivered when the goods arrive.</span><button className="button button-primary" onClick={() => { updateBooking(booking.id, { status: 'Delivered', trackingStep: 3, ownerDelivered: true }); notify('Delivery marked. The shipper can confirm receipt.') }}>Mark as delivered</button></div>}
          {booking.status === 'In Transit' && !ownerSide && <div className="tracking-panel"><div className="tracking-route"><span>{booking.shipment.from}</span><span className="tracking-dash"><i /></span><span>{booking.shipment.to}</span></div><small><span className="live-dot" /> Demo live tracking · Ramesh's truck is on the return route</small></div>}
          {booking.status === 'Delivered' && !ownerSide && <div className="payment-box"><div><strong>Has your shipment arrived?</strong><small>Confirm receipt to release the payment from escrow.</small></div><button className="button button-primary" onClick={() => confirmReceipt(booking)}>Confirm receipt <Check size={16} /></button></div>}
          {booking.status === 'Delivered' && ownerSide && <div className="notice-bar"><span>Delivery marked. The shipper will confirm receipt to release your payout.</span><Status>Awaiting receipt</Status></div>}
          {booking.status === 'Released' && <div className="fee-split"><div className="split-heading"><span><Check size={16} /> Delivery confirmed · Escrow released</span><span className="demo-label">DEMO PAYMENT</span></div><div className="split-visual"><div className="split-total"><small>SHIPPER PAID</small><strong>₹{booking.total.toLocaleString('en-IN')}</strong></div><div className="split-arrow">→</div><div><small>TRUCK OWNER GETS</small><strong>₹{booking.feeSplit.ownerPayout.toLocaleString('en-IN')}</strong></div><div className="split-commission"><small>MARKETPLACE (8%)</small><strong>₹{booking.feeSplit.commission.toLocaleString('en-IN')}</strong></div></div></div>}
          {booking.status === 'Released' && !reviewSubmitted && <div className="review-form"><div><strong>How was your experience?</strong><small>Rate the {ownerSide ? 'shipper' : 'truck owner'} to build trust.</small></div>{reviewing !== booking.id ? <button className="button button-outline" onClick={() => setReviewing(booking.id)}><Star size={15} /> Leave a review</button> : <div className="review-controls"><div className="star-picker">{[1, 2, 3, 4, 5].map((value) => <button key={value} aria-label={`${value} stars`} onClick={() => setRating(value)}><Star size={19} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div><input value={review} onChange={(e) => setReview(e.target.value)} placeholder="Share a short review…" /><button className="button button-primary" onClick={() => submitReview(booking)}>Submit</button></div>}</div>}
          {reviewSubmitted && <div className="review-submitted"><Stars rating={reviewSubmitted.rating} reviews={1} /> “{reviewSubmitted.review || 'Great experience — smooth and reliable.'}”</div>}
        </div>
      })}</div>}
  </>
}
