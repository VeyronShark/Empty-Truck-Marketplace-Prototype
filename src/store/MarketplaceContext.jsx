import { createContext, useContext, useMemo, useState } from 'react'
import { demoShipment, demoTruck, seedShipments, seedTrucks, seedUsers } from '../data/mockData.js'
import { calculateFeeSplit } from '../utils/matching.js'

const MarketplaceContext = createContext(null)
const initialState = () => ({
  users: seedUsers,
  trucks: seedTrucks,
  shipments: seedShipments,
  bookings: [],
  role: 'owner',
  page: 'Dashboard',
  toast: '',
  demoStep: -1,
  selectedShipment: seedShipments[0],
})

export function MarketplaceProvider({ children }) {
  const [state, setState] = useState(initialState)
  const update = (patch) => setState((current) => ({ ...current, ...patch }))
  const notify = (toast) => {
    update({ toast })
    window.setTimeout(() => setState((current) => current.toast === toast ? { ...current, toast: '' } : current), 2800)
  }
  const createTruck = (truck) => {
    setState((current) => ({ ...current, trucks: [{ ...truck, id: `t-${Date.now()}`, status: 'Available', verified: true, rating: 5, reviews: 0, savedKm: 0 }, ...current.trucks] }))
    notify('Return capacity is live on the marketplace.')
  }
  const createShipment = (shipment) => {
    const next = { ...shipment, id: `s-${Date.now()}`, status: 'Open' }
    setState((current) => ({ ...current, shipments: [next, ...current.shipments], selectedShipment: next, page: 'Find Trucks', role: 'shipper' }))
    notify('Shipment posted. Finding compatible return loads…')
  }
  const createBooking = (truck, shipment) => {
    const total = Math.round(truck.distance * truck.price)
    const booking = {
      id: `b-${Date.now()}`, truckId: truck.id, shipmentId: shipment.id, truck, shipment,
      status: 'Requested', total, feeSplit: calculateFeeSplit(total), trackingStep: 0,
      ownerDelivered: false, shipperConfirmed: false, ownerReview: null, shipperReview: null,
    }
    setState((current) => ({ ...current, bookings: [booking, ...current.bookings], page: 'Bookings' }))
    notify('Offer sent to the truck owner.')
  }
  const updateBooking = (id, patch) => setState((current) => ({
    ...current,
    bookings: current.bookings.map((booking) => booking.id === id ? { ...booking, ...patch } : booking),
  }))
  const toggleRole = (role) => update({ role, page: 'Dashboard' })
  const reset = () => setState(initialState())
  const value = useMemo(() => ({
    ...state, update, notify, createTruck, createShipment, createBooking, updateBooking, toggleRole, reset,
  }), [state])
  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return context
}
