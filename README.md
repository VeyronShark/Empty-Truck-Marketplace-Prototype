# Empty Truck Marketplace

A front-end-only React + Vite prototype for a two-sided marketplace matching empty truck return journeys with compatible shipment requests. All data, accounts, bookings, payments and verification are simulated in browser memory.

[Live Link - Vercel](https://empty-truck-marketplace-prototype.vercel.app/)

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Create a production bundle with `npm run build`, or preview it using `npm run preview`.

## Guided presentation walkthrough

1. Select **Run guided demo** in the header.
2. Follow the seven-step banner. The story starts with Ramesh Transport finishing a delivery in Cuttack and listing a 14ft, 3-tonne return truck to Bhubaneswar.
3. Switches automatically to Utkal Distributors, which posts 2 tonnes of FMCG cargo on the same route.
4. The matching screen presents the guided truck at a **92% match**, with route, capacity and timing components shown on its card.
5. Continue to simulate the booking and payment into demo escrow.
6. Continue to simulate trip tracking, delivery confirmation, and release of the 8% commission split.
7. View the impact dashboard, where the additional match, freight value and commission appear.

Use **Reset** to restore the initial sample marketplace data. Outside guided mode, the owner and shipper workspaces are independently clickable: post capacity, post a shipment, filter and sort trucks, inspect a truck, request a booking, accept/counter, pay, track, confirm delivery and rate each other.

## Demo accounts

- **Truck owner:** Ramesh Kumar, Ramesh Transport (Bhubaneswar)
- **Shipper:** Ananya Das, Utkal Distributors (Cuttack)
- **Admin:** Marketplace impact panel

The header account menu and owner/shipper switcher change roles without authentication. **Create a demo account** accepts a name, business name, phone and role; the verification page simulates document review. Uploaded files are not transmitted.

## Architecture

- `src/data/mockData.js` — seeded Indian users, trucks, shipments and guided-story records.
- `src/store/MarketplaceContext.jsx` — shared in-memory React state, marketplace actions and reset.
- `src/utils/matching.js` — hardcoded city proximity, match-score breakdown and commission split.
- `src/components/` — shared status, rating, field and empty-state UI.
- `src/pages/` — landing, owner, shipper, verification and marketplace impact screens.
- `src/App.jsx` — role-aware navigation and guided-demo orchestration.
- `src/styles.css` — responsive visual system and mobile layouts.

The matching score combines route proximity (50%), load-capacity fit (30%) and pickup timing (20%), including the overlap between a shipment's preferred window and the truck's availability when provided. `scoreMatch` returns the overall 0–100 score plus the three component scores. `calculateFeeSplit` applies the configurable `COMMISSION_RATE` (default 8%) to a booking total; the remaining amount is the owner's payout. Both functions are intentionally small and documented for presentation.

## Prototype limitations

There is no backend, real account authentication, payment processing, escrow, document verification, map service, or live GPS. Booking and payment actions only update in-memory UI state and should be treated as demonstration data.
