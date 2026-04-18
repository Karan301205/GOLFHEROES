# GolfHeroes Platform

## Project Overview
GolfHeroes is a subscription-driven web application that combines golf performance tracking, charity fundraising, and a monthly prize draw engine. The platform allows golfers to track Stableford scores while contributing a portion of their subscription to a selected charity.

## Deployment Links
- Frontend: https://golf-heroes-client.vercel.app
- Backend API: https://golf-heroes-server.vercel.app

## Core Features

### 1. Subscription System
- Integration with Stripe for payment processing.
- Monthly and Yearly subscription plans.
- Automatic profile status updates via Stripe Webhooks.

### 2. Score Management
- Rolling 5-score logic: Retains only the latest five scores.
- Automatic replacement of the oldest score upon new entry.
- Validation for Stableford scores within the 1-45 range.
- Restriction of one score entry per date.

### 3. Draw and Reward Engine
- Monthly draws with Random and Algorithmic logic options.
- Prize pool calculation based on active subscriber counts.
- Tiered prize distribution: 5-number match (40%), 4-number match (35%), and 3-number match (25%).

### 4. Charity Integration
- Minimum 10% contribution from subscription fees.
- User-selectable charity recipients during signup or via the dashboard.

### 5. Admin Control
- User and subscription management.
- Draw simulation and result publishing.
- Charity listing management and winner verification.

## Testing Credentials

### Standard User
- Email: test@test.com
- Password: password123

### Admin User
- Email: mrokoz63368@gmail.com
- Password: qwe

## Technical Stack
- Frontend: React.js, Tailwind CSS, Vite.
- Backend: Node.js, Express.js.
- Database: Supabase (PostgreSQL).
- Payments: Stripe API.
- Authentication: JWT and Supabase Auth.
