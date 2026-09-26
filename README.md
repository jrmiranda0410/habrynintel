# HABRYN Intel

HABRYN Intel is the web prototype of HABRYN, an AI/ML-powered housing intelligence platform designed to help people find, understand and evaluate properties based on their personal requirements.

## Overview

HABRYN helps people move beyond simple listing browsing and toward a more personal, informed decision process. It combines housing profile, family needs, financial context, location and lifestyle signals with property data to generate a transparent recommendation engine and decision-support experience.

This repository contains a client-side prototype built for demo deployment and GitHub hosting. It is designed to feel realistic and functional while clearly labelling AI, payment, and data assumptions as simulated or demo-only.

## Core features

- AI/ML matching concept
- Property search and filtering
- Property requirements intake
- Property intelligence and analysis
- HABRYN Analysis with a ₹5 decision-intelligence concept
- Property Shield / risk signal review
- Document Intelligence
- Location Intelligence
- Appointments and visit scheduling
- My Home and home passport flows
- Student Mode
- Services Marketplace
- Admin dashboard
- Owner dashboard
- Developer dashboard
- Demo data and local persistence

## AI/ML matching concept

The prototype simulates a matching engine using:

- Selected requirements
- Existing housing profile
- Family needs and lifestyle inputs
- Budget and commute signals
- Property database and listing attributes

The matching engine enforces hard constraints and applies soft scoring for signals such as budget fit, location, commute, amenities, property status, and lifestyle fit. Recommendations include transparent explanations and prototype confidence labels.

This is clearly labelled as a simulated system and is intended to be replaceable with a real ML or API-driven backend later.

## Property search

The app includes:

- Quick filter flow
- More filters with advanced requirement inputs
- Multiple locality selection
- Budget and BHK filtering
- Property type and furnishing filters
- Amenities selection, including an ALL AMENITIES option
- Dynamic property results and ranking

## Property requirements

Users can configure structured requirements including:

- City and locality preferences
- Budget and monthly affordability
- Desired property type and BHK
- Area and furnishing
- Amenities and status
- Household preferences
- Commute and destination priorities

## Property intelligence

Each property can be explored with:

- Home overview
- Essentials and amenities
- Locality and commute context
- Property fit and trade-offs
- Risk signals / Property Shield
- Comparison flows
- Document summaries
- Demo analysis export

## HABRYN Analysis

Detailed property analysis is intentionally gated behind a mock ₹5 payment flow:

- Personal fit
- Budget fit and true-cost estimate
- Commute and lifestyle alignment
- Risk, trade-offs, and missing information
- Verification checklist
- Recommended questions to ask before transacting

This is a prototype payment simulation only. No real payment is processed.

## Property Shield

The prototype includes risk-signal views for:

- Duplicate or suspicious listing signals
- Missing information
- Inconsistent details
- Incomplete documentation
- Suspicious transaction signals

The UI clearly states that these are prototype indicators and not legal verification.

## Document Intelligence

The app includes a document-analysis prototype that displays:

- Summary of uploaded or demo documents
- Extracted information
- Missing information
- Inconsistencies
- Questions and checks to verify

## Location Intelligence

Location-based context includes:

- Workplace, university, school, hospital, grocery, restaurants, parks, transit
- Simulated commute information by route type
- Demo-only mapping context

## Appointments

Users can:

- Select a home
- Choose date and time
- Book or reschedule a visit
- Cancel a visit
- Track upcoming appointments

## My Home

The app includes a home lifecycle view covering:

- Current home
- Documents and bills
- Maintenance and warranty
- Inventory and service history
- Reminders and issues
- Home passport and home health flow

## Student Mode

Student-focused screens cover:

- PG and shared accommodation
- Student housing filters
- University proximity
- Budget and transport signals
- Furnished / internet / meals preferences

## Services Marketplace

A demo marketplace includes service categories such as:

- Cleaning
- Moving
- AC service
- Plumbing
- Electrical
- Furniture
- Internet
- Storage
- Pest control
- Groceries / milk
- Maintenance

## Admin dashboard

The admin experience covers:

- User list and management
- Property management
- Appointments overview
- Transactions
- AI monitoring
- Reports
- Settings

## Owner dashboard

The owner flow includes:

- Dashboard overview
- Properties
- Leads
- Appointments
- Messages
- Offers and transactions

## Developer dashboard

The developer flow includes:

- Projects
- Units and inventory
- Leads
- Appointments
- Bookings
- Documents
- Analytics

## Demo data

The prototype uses seeded demo data representing:

- 100+ properties
- 30+ users
- 15+ owners
- 10+ developers
- 30+ appointments
- 20+ transactions
- 20+ services
- 10+ roommate profiles
- 10+ conversations

Cities represented include:

- Mangaluru
- Bengaluru
- Mysuru
- Hyderabad
- Chennai
- Pune
- Mumbai
- Delhi NCR

## Technology stack

- React 19
- TypeScript
- Vite
- React Router
- Lucide React
- CSS custom styling

## Local development

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local development server in the browser.

## Production build

```bash
npm install
npm run build
```

The production build generates a static bundle in the `dist/` directory.

## GitHub deployment / static hosting

This project is a Vite client-side application configured for static hosting. The build output is optimized for GitHub Pages or other static hosts that support SPA routing.

For static hosting, use the generated `dist/` output.

Important:

- SPA routes are supported with a fallback strategy on the hosting platform.
- The app uses browser-local demo state and does not depend on a backend for the prototype flow.
- Demo payment and AI functionality are simulated and intentionally not production-grade.

## Deployment instructions

1. Push this repository to GitHub as `habrynintel`.
2. Configure a static hosting service (for example, GitHub Pages or a static host compatible with Vite).
3. Upload the `dist/` production output or configure the deployment action to run `npm run build`.
4. Ensure all routes resolve correctly through the hosting platform’s SPA fallback.

## Notes

This is a prototype for demo and design review. It uses simulated AI, mock payment flows, demo user accounts, and local browser storage. It is not a real brokerage, legal verification layer, or production payment system.
