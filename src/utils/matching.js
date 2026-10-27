const cityDistances = {
  Bhubaneswar: { Cuttack: 28, Jatani: 20, Puri: 60, Rourkela: 340, Sambalpur: 300, Kolkata: 440, Visakhapatnam: 440, Ranchi: 450, Raipur: 550 },
  Cuttack: { Jatani: 45, Puri: 85, Rourkela: 360, Sambalpur: 320, Kolkata: 460, Visakhapatnam: 460, Ranchi: 470, Raipur: 570 },
  Jatani: { Puri: 75, Rourkela: 350, Sambalpur: 310, Kolkata: 460, Visakhapatnam: 450, Ranchi: 460, Raipur: 560 },
  Puri: { Rourkela: 390, Sambalpur: 350, Kolkata: 500, Visakhapatnam: 500, Ranchi: 500, Raipur: 600 },
  Rourkela: { Sambalpur: 160, Kolkata: 500, Visakhapatnam: 650, Ranchi: 240, Raipur: 420 },
  Sambalpur: { Kolkata: 520, Visakhapatnam: 600, Ranchi: 400, Raipur: 280 },
  Kolkata: { Visakhapatnam: 880, Ranchi: 400, Raipur: 850 },
  Visakhapatnam: { Ranchi: 900, Raipur: 700 },
  Ranchi: { Raipur: 650 },
}

export const COMMISSION_RATE = 0.08

function cityDistance(a, b) {
  if (a === b) return 0
  return cityDistances[a]?.[b] ?? cityDistances[b]?.[a] ?? Infinity
}

function proximityScore(a, b) {
  if (a === b) return 1
  const distance = cityDistance(a, b)
  return distance <= 35 ? 0.9 : distance <= 80 ? 0.75 : distance <= 150 ? 0.5 : 0
}

function timeWindowOverlap(truckWindow, shipmentWindow) {
  const truckTimes = [...truckWindow.matchAll(/(\d{1,2}):(\d{2})/g)]
    .map(([, hour, minute]) => Number(hour) * 60 + Number(minute))
  const shipmentTimes = [...shipmentWindow.matchAll(/(\d{1,2}):(\d{2})/g)]
    .map(([, hour, minute]) => Number(hour) * 60 + Number(minute))
  if (truckTimes.length !== 2 || shipmentTimes.length !== 2) return 0
  const overlap = Math.max(0, Math.min(truckTimes[1], shipmentTimes[1]) - Math.max(truckTimes[0], shipmentTimes[0]))
  const duration = Math.min(truckTimes[1] - truckTimes[0], shipmentTimes[1] - shipmentTimes[0])
  return duration > 0 ? Math.round((overlap / duration) * 100) : 0
}

// Scores route proximity, load fit, pickup dates, and overlapping pickup windows into a 0–100 match.
export function scoreMatch(truck, shipment) {
  const origin = proximityScore(truck.from, shipment.from)
  const destination = proximityScore(truck.to, shipment.to)
  const route = Math.round(((origin + destination) / 2) * 100)
  const capacity = truck.capacity >= shipment.weight
    ? 100
    : Math.max(0, Math.round((truck.capacity / shipment.weight) * 100))
  const dateDelta = Math.abs(new Date(`${truck.date}T00:00:00`) - new Date(`${shipment.date}T00:00:00`)) / 86400000
  const dateFit = dateDelta === 0 ? 100 : dateDelta === 1 ? 40 : dateDelta === 2 ? 20 : 0
  const timing = shipment.pickupWindow
    ? Math.round(dateFit * 0.7 + timeWindowOverlap(truck.window, shipment.pickupWindow) * 0.3)
    : dateFit
  const score = Math.round(route * 0.5 + capacity * 0.3 + timing * 0.2)
  return { score, route, capacity, timing }
}

export function findMatches(trucks, shipment) {
  return trucks
    .filter((truck) => truck.status === 'Available')
    .map((truck) => ({ truck, ...scoreMatch(truck, shipment) }))
    .filter((match) => match.score >= 25)
    .sort((a, b) => b.score - a.score)
}

// Splits a demo booking total between the owner and marketplace commission.
export function calculateFeeSplit(total, commissionRate = COMMISSION_RATE) {
  const commission = Math.round(total * commissionRate)
  return { total, commission, ownerPayout: total - commission, commissionRate }
}
