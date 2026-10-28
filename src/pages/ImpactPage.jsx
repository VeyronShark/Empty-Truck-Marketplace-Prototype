import { ArrowDownRight, ArrowUpRight, BadgeIndianRupee, BarChart3, Check, Leaf, Truck, Users, Zap } from 'lucide-react'
import { PageTitle, Status } from '../components/UI.jsx'
import { useMarketplace } from '../store/MarketplaceContext.jsx'

export function ImpactPage() {
  const { trucks, shipments, bookings } = useMarketplace()
  const completed = bookings.filter((booking) => booking.status === 'Released')
  const gmv = completed.reduce((sum, booking) => sum + booking.total, 0)
  const revenue = completed.reduce((sum, booking) => sum + booking.feeSplit.commission, 0)
  const km = completed.reduce((sum, booking) => sum + (booking.truck.distance || 0), 0)
  const verifiedTrucks = trucks.filter((truck) => truck.verified).length
  const liquidity = Math.min(100, Math.round((Math.min(verifiedTrucks, shipments.length) / Math.max(verifiedTrucks, shipments.length, 1)) * 100))
  const matches = Math.max(14, bookings.length + 14)
  return <>
    <PageTitle eyebrow="MARKETPLACE · IMPACT" title="Capacity creates value" description="A clear view of marketplace liquidity, commercial traction and the empty kilometres put to work." action={<span className="demo-label"><Zap size={13} /> LIVE DEMO DATA</span>} />
    <div className="impact-banner"><div className="impact-mark"><BarChart3 size={22} /></div><div><span className="eyebrow">THE BUSINESS MODEL</span><strong>One delivery. Two revenue legs.</strong><p>We connect a truck's empty return journey to a shipper who needs that exact route.</p></div><div className="impact-equation"><span>1 revenue leg</span><ArrowUpRight size={20} /><strong>2 revenue legs</strong></div></div>
    <div className="metric-grid impact-metrics">
      <Metric icon={<Zap />} label="Total matches" value={matches} caption={`${bookings.length} live demo bookings`} />
      <Metric icon={<BadgeIndianRupee />} label="GMV" value={`₹${gmv.toLocaleString('en-IN')}`} caption="Shipment value moved" />
      <Metric icon={<ArrowUpRight />} label="Commission earned" value={`₹${revenue.toLocaleString('en-IN')}`} caption="8% of completed bookings" />
      <Metric icon={<ArrowDownRight />} label="Empty km saved" value={`${km + 828} km`} caption="Return legs carrying value" />
    </div>
    <div className="impact-grid">
      <div className="impact-card"><div className="section-heading compact"><div><h2>Marketplace liquidity</h2><p>Supply and demand are meeting on the road.</p></div><span className="live-dot" /></div>
        <div className="liquidity-numbers"><div><span className="liquidity-icon"><Truck size={17} /></span><strong>{verifiedTrucks}</strong><small>Active trucks</small></div><div><span className="liquidity-icon liquidity-amber"><Users size={17} /></span><strong>{shipments.length}</strong><small>Active shippers</small></div></div>
        <div className="liquidity-bar"><span style={{ width: `${liquidity}%` }} /></div><div className="liquidity-caption"><span>Route coverage indicator</span><strong>{liquidity}% balanced</strong></div>
      </div>
      <div className="impact-card"><div className="section-heading compact"><div><h2>Utilisation uplift</h2><p>Before vs. after a marketplace match.</p></div></div>
        <div className="uplift-row"><div><span className="uplift-label">BEFORE</span><strong>1 revenue leg</strong><small>Empty return kilometres</small></div><ArrowUpRight size={22} /><div className="uplift-after"><span className="uplift-label">AFTER</span><strong>2 revenue legs</strong><small>Capacity put to work</small></div></div>
        <div className="uplift-stat"><Leaf size={17} /><span>Average utilisation uplift</span><strong>+38%</strong></div>
      </div>
    </div>
    <div className="section-heading"><div><h2>Marketplace activity</h2><p>Trust and efficient matches are the foundation for repeat business.</p></div></div>
    <div className="activity-strip"><div><Check size={18} /><strong>{verifiedTrucks} verified trucks</strong><span>Owners checked and ready to move</span></div><div><Zap size={18} /><strong>{matches} route matches</strong><span>Capacity matched to real demand</span></div><div><BadgeIndianRupee size={18} /><strong>8% commission</strong><span>Earned only when a delivery completes</span></div><Status>Demo data</Status></div>
  </>
}

function Metric({ icon, label, value, caption }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-caption">{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-change">{caption}</span></div>
}
