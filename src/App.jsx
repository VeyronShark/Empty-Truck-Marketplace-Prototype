import { useRef, useState } from 'react'
import { Activity, ArrowRight, BadgeCheck, ChevronDown, CircleHelp, LayoutDashboard, Menu, PackageCheck, Plus, RotateCcw, ShieldCheck, Sparkles, Truck, UserRound, X } from 'lucide-react'
import { demoShipment, demoTruck } from './data/mockData.js'
import { calculateFeeSplit } from './utils/matching.js'
import { useMarketplace } from './store/MarketplaceContext.jsx'
import { Status } from './components/UI.jsx'
import { OwnerDashboard, CapacityForm, OffersPage, OwnerTrips } from './pages/OwnerPages.jsx'
import { BookingsPage, FindTrucksPage, ShipmentForm, ShipperDashboard } from './pages/ShipperPages.jsx'
import { ImpactPage } from './pages/ImpactPage.jsx'
import { VerificationPage } from './pages/VerificationPage.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { SignupPage } from './pages/SignupPage.jsx'

const ownerNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Post Capacity', icon: Plus },
  { label: 'Offers', icon: PackageCheck },
  { label: 'Trips', icon: Truck },
]
const shipperNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Post Shipment', icon: Plus },
  { label: 'Find Trucks', icon: Truck },
  { label: 'Bookings', icon: PackageCheck },
]
const demoSteps = [
  { title: 'The delivery is done.', description: 'Ramesh has just delivered in Cuttack. His 14ft truck is empty and ready for the return to Bhubaneswar.' },
  { title: 'Return capacity is listed.', description: 'A verified 14ft truck with 3 tonnes free capacity is now visible to shippers on this route.' },
  { title: 'A local business needs the same route.', description: 'Utkal Distributors posts 2 tonnes of FMCG goods from Cuttack to Bhubaneswar.' },
  { title: 'The marketplace finds a match.', description: 'Route, capacity and overlapping pickup windows rank Ramesh’s return truck at 92%.' },
  { title: 'Booked. Paid into escrow.', description: 'The shipper accepts the match, the owner confirms, and payment is held safely until delivery.' },
  { title: 'Delivered. Receipt confirmed.', description: 'The empty return leg carries a paying load. Escrow releases the owner’s payout, less an 8% marketplace fee.' },
  { title: 'Two revenue legs. One trusted marketplace.', description: 'Both sides rate the trip. The completed match and commission appear in the impact dashboard.' },
]

export default function App() {
  const { role, page, update, toggleRole, toast, demoStep, users, reset, notify, trucks, shipments, bookings } = useMarketplace()
  const [capacityDraft, setCapacityDraft] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [guidedBusy, setGuidedBusy] = useState(false)
  const [accountMenu, setAccountMenu] = useState(false)
  const [welcome, setWelcome] = useState(true)
  const [routeAlerts, setRouteAlerts] = useState(true)
  const guidedTimer = useRef(null)
  const navItems = role === 'owner' ? ownerNavigation : shipperNavigation
  const currentUser = users.find((user) => user.id === (role === 'owner' ? 'u1' : 'u2'))
  const ownerProfile = users.find((user) => user.id === 'u1')
  const startDemo = () => {
    window.clearTimeout(guidedTimer.current)
    setGuidedBusy(false)
    update({ demoStep: 0, role: 'owner', page: 'Dashboard', toast: 'Guided demo started — follow the story across both sides of the marketplace.' })
    setCapacityDraft(null)
  }
  const advanceDemo = () => {
    if (guidedBusy) return
    if (demoStep === 0) {
      setCapacityDraft({ type: '14ft', capacity: '3', from: 'Cuttack', to: 'Bhubaneswar', date: '2026-10-28', window: '08:00 – 12:00', price: '28', cargoText: 'FMCG, Packaged goods' })
      update({ demoStep: 1, role: 'owner', page: 'Post Capacity' })
    } else if (demoStep === 1) {
      const nextTrucks = trucks.some((truck) => truck.id === demoTruck.id) ? trucks : [demoTruck, ...trucks]
      update({ trucks: nextTrucks, demoStep: 2, role: 'shipper', page: 'Post Shipment', toast: 'Ramesh’s return capacity is listed.' })
    } else if (demoStep === 2) {
      const nextShipments = shipments.some((shipment) => shipment.id === demoShipment.id) ? shipments : [demoShipment, ...shipments]
      update({ shipments: nextShipments, selectedShipment: demoShipment, demoStep: 3, role: 'shipper', page: 'Find Trucks', toast: 'Utkal Distributors posted 2 tonnes of FMCG cargo.' })
    } else if (demoStep === 3) {
      setGuidedBusy(true)
      guidedTimer.current = window.setTimeout(() => {
        update({ demoStep: 4, role: 'shipper', page: 'Find Trucks', toast: '92% match found — route, capacity and timing align.' })
        setGuidedBusy(false)
      }, 1200)
    } else if (demoStep === 4) {
      const truck = trucks.find((item) => item.id === demoTruck.id) || demoTruck
      const shipment = shipments.find((item) => item.id === demoShipment.id) || demoShipment
      const booking = {
        id: 'b-guided-demo', truckId: truck.id, shipmentId: shipment.id, truck, shipment,
        status: 'Escrow held', total: Math.round(truck.distance * truck.price),
        feeSplit: calculateFeeSplit(Math.round(truck.distance * truck.price)),
        trackingStep: 1, paid: true, ownerDelivered: false, shipperConfirmed: false,
        ownerReview: null, shipperReview: null,
      }
      const nextBookings = bookings.some((item) => item.id === booking.id) ? bookings : [booking, ...bookings]
      update({ bookings: nextBookings, demoStep: 5, role: 'owner', page: 'Trips', toast: 'Booking confirmed and shipper payment secured in demo escrow.' })
    } else if (demoStep === 5) {
      const nextBookings = bookings.map((booking) => booking.id === 'b-guided-demo' ? { ...booking, status: 'Released', trackingStep: 3, paid: true, ownerDelivered: true, shipperConfirmed: true } : booking)
      update({ bookings: nextBookings, demoStep: 6, role: 'shipper', page: 'Bookings', toast: 'Delivery confirmed. Escrow released with the fee split.' })
    } else if (demoStep === 6) {
      const nextUsers = users.map((user) => user.id === 'u1' ? { ...user, rating: 5, reviews: user.reviews + 1 } : user.id === 'u2' ? { ...user, rating: 4.9, reviews: user.reviews + 1 } : user)
      update({ users: nextUsers, demoStep: 7, role: 'admin', page: 'Impact', toast: 'Both sides rated the trip. Marketplace impact updated.' })
    }
  }
  const stopDemo = () => {
    window.clearTimeout(guidedTimer.current)
    setGuidedBusy(false)
    update({ demoStep: -1 })
  }
  const resetDemo = () => {
    window.clearTimeout(guidedTimer.current)
    setGuidedBusy(false)
    reset()
    setCapacityDraft(null)
    notify('Demo data has been reset to the original sample marketplace.')
  }
  const navigate = (nextPage) => {
    setWelcome(false)
    update({ page: nextPage })
    setMobileNav(false)
  }
  const deliveryDone = (truck) => {
    setCapacityDraft({
      type: truck?.type || '14ft', capacity: String(truck?.capacity || 3),
      from: truck?.from || 'Cuttack', to: truck?.to || 'Bhubaneswar',
      date: truck?.date || '2026-10-28', window: truck?.window || '08:00 – 12:00',
      price: String(truck?.price || 28), cargoText: (truck?.cargo || ['FMCG']).join(', '),
    })
    navigate('Post Capacity')
    notify('Delivery complete — your truck is empty. Add its return destination.')
  }
  const renderPage = () => {
    if (welcome && demoStep < 0) return <LandingPage onContinue={(nextRole) => { setWelcome(false); toggleRole(nextRole) }} onCreateAccount={() => navigate('Create Account')} />
    if (page === 'Create Account') return <SignupPage onBack={() => { setWelcome(true); update({ page: 'Dashboard' }) }} onContinue={() => { setWelcome(false); navigate('Verification') }} />
    if (page === 'Verification') return <VerificationPage onBack={() => navigate('Dashboard')} />
    if (role === 'admin' || page === 'Impact') return <ImpactPage />
    if (role === 'owner') {
      if (page === 'Post Capacity') return <CapacityForm draft={capacityDraft} setDraft={setCapacityDraft} ownerProfile={ownerProfile} onSubmit={(truck) => { update({ trucks: [ { ...truck, id: `t-${Date.now()}`, status: 'Available', verified: ownerProfile?.verified ?? true, rating: 5, reviews: 0, savedKm: 0 }, ...trucks ], page: 'Dashboard' }); notify('Return capacity is live on the marketplace.') }} onCancel={() => navigate('Dashboard')} />
      if (page === 'Offers') return <OffersPage onNavigate={navigate} />
      if (page === 'Trips' || page === 'Bookings') return <OwnerTrips onNavigate={navigate} />
      return <OwnerDashboard ownerProfile={ownerProfile} onPost={() => navigate('Post Capacity')} onDeliveryDone={deliveryDone} />
    }
    if (page === 'Post Shipment') return <ShipmentForm onSubmit={(shipment) => { const next = { ...shipment, id: `s-${Date.now()}`, status: 'Open' }; update({ shipments: [next, ...shipments], selectedShipment: next, page: 'Find Trucks' }); notify('Shipment posted. Finding compatible return loads…') }} onCancel={() => navigate('Dashboard')} />
    if (page === 'Find Trucks') return <FindTrucksPage />
    if (page === 'Bookings' || page === 'Trips') return <BookingsPage />
    return <ShipperDashboard onNavigate={navigate} />
  }
  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X size={21} /> : <Menu size={21} />}</button>
      <button className="brand" onClick={() => { toggleRole('owner'); navigate('Dashboard') }}><span className="brand-mark"><Truck size={20} /></span><span>empty<span className="brand-accent">truck</span><small>MARKETPLACE</small></span></button>
      <div className="header-divider" />
      <div className="demo-context"><span className="demo-indicator" /> UNIVERSITY DEMO <span className="context-divider">/</span> Eastern India</div>
      <div className="topbar-actions"><button className="button button-demo" onClick={startDemo}><Sparkles size={16} /> <span>Run guided demo</span></button><button className="button button-reset" onClick={resetDemo}><RotateCcw size={15} /><span>Reset</span></button>
        <div className="account-wrap"><button className="account-button" onClick={() => setAccountMenu(!accountMenu)}><span className="avatar">{currentUser?.initials || 'AD'}</span><span className="account-details"><strong>{currentUser?.business || 'Admin view'}</strong><small>{role === 'admin' ? 'Marketplace admin' : role === 'owner' ? 'Truck owner' : 'Shipper'} · demo</small></span><ChevronDown size={15} /></button>
          {accountMenu && <div className="account-menu"><button onClick={() => { setWelcome(false); toggleRole('owner'); setAccountMenu(false) }}><Truck size={15} /> Ramesh Transport <small>Truck owner</small></button><button onClick={() => { setWelcome(false); toggleRole('shipper'); setAccountMenu(false) }}><PackageCheck size={15} /> Utkal Distributors <small>Shipper</small></button><button onClick={() => { setWelcome(false); toggleRole('admin'); navigate('Impact'); setAccountMenu(false) }}><Activity size={15} /> Marketplace admin <small>Impact panel</small></button><button onClick={() => { navigate('Create Account'); setAccountMenu(false) }}><UserRound size={15} /> Create demo account <small>Sign up without authentication</small></button><button onClick={() => { navigate('Verification'); setAccountMenu(false) }}><ShieldCheck size={15} /> Verify profile <small>Simulated documents</small></button></div>}
        </div>
      </div>
    </header>
    <div className={`workspace ${mobileNav ? 'nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-role-label">YOUR WORKSPACE</div>
        <div className="role-switcher"><button className={role === 'owner' ? 'active' : ''} onClick={() => { setWelcome(false); toggleRole('owner') }}><Truck size={15} /> Owner</button><button className={role === 'shipper' ? 'active' : ''} onClick={() => { setWelcome(false); toggleRole('shipper') }}><PackageCheck size={15} /> Shipper</button></div>
        {role === 'admin' ? <>
          <div className="sidebar-role-label nav-label">PLATFORM</div><button className={`nav-item ${page === 'Impact' ? 'active' : ''}`} onClick={() => navigate('Impact')}><Activity size={17} /> Impact dashboard</button>
        </> : <>
          <div className="sidebar-role-label nav-label">{role === 'owner' ? 'TRUCK OWNER' : 'SHIPPER'}</div>
          <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => navigate(label)}><Icon size={17} />{label}{label === 'Offers' && bookings.some((booking) => booking.status === 'Requested') && <span className="nav-count">1</span>}</button>)}</nav>
          <div className="sidebar-saved"><div>{routeAlerts && <span className="live-dot" />} ROUTE ALERTS</div><strong>{role === 'owner' ? 'Cuttack → Bhubaneswar' : 'Cuttack → Bhubaneswar'}</strong><small>Matching alerts are {routeAlerts ? 'on' : 'off'}</small><button onClick={() => { setRouteAlerts(!routeAlerts); notify(`Route alerts turned ${routeAlerts ? 'off' : 'on'}.`) }}>{routeAlerts ? 'Turn alerts off' : 'Turn alerts on'} <ArrowRight size={13} /></button></div>
        </>}
        <div className="sidebar-bottom"><button className="nav-item" onClick={() => navigate('Verification')}><ShieldCheck size={17} /> Verification <BadgeCheck className="sidebar-check" size={14} /></button><div className="sidebar-profile"><span className="avatar">{currentUser?.initials || 'AD'}</span><div><strong>{currentUser?.name || 'Marketplace Admin'}</strong><small>{currentUser?.verified ? '✓ Verified account' : 'Demo workspace'}</small></div><button aria-label="Open account menu" onClick={() => setAccountMenu(!accountMenu)}><ChevronDown size={15} /></button></div></div>
      </aside>
      <main className="main-area">
        {demoStep >= 0 && <div className="guided-banner"><div className="guided-icon"><Sparkles size={17} /></div><div className="guided-copy"><div><span className="guided-kicker">GUIDED DEMO · STEP {Math.min(demoStep + 1, 7)} OF 7</span><button className="guided-close" aria-label="Close guided demo" onClick={stopDemo}>×</button></div><strong>{demoStep < 7 ? demoSteps[demoStep]?.title : 'Demo complete!'}</strong><p>{demoStep < 7 ? demoSteps[demoStep]?.description : 'You’ve seen the complete owner-to-shipper journey. Reset the demo to tell the story again.'}</p><div className="guided-progress">{demoSteps.map((step, index) => <span key={step.title} className={index <= demoStep ? 'complete' : ''} />)}</div></div><button className="button button-guided" disabled={guidedBusy || demoStep === 7} onClick={advanceDemo}>{guidedBusy ? <><span className="spinner spinner-white" /> Matching</> : demoStep === 6 ? 'View the impact' : demoStep === 7 ? 'Complete' : 'Next step'} {!guidedBusy && <ArrowRight size={15} />}</button></div>}
        <div className="page-content">{renderPage()}</div>
        <footer className="app-footer"><span>We don’t sell trucks. <strong>We sell access to underutilised truck capacity.</strong></span><span><CircleHelp size={13} /> Prototype only · No real payments, documents or bookings</span></footer>
      </main>
    </div>
    {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
  </div>
}
