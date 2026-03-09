# Grocery Deals App — Cursor Agent Context & Task Brief

## Project Overview

You are building a Progressive Web App (PWA) called **Grocery Deals** for Toronto residents. It helps everyday people save money on groceries by combining personalized deal alerts from local stores with AI recipe suggestions. The app tells users what to stock up on, where to buy it, and what to cook with it.

**Target user:** Regular people in Toronto who don't have the time to hunt for deals, price match, or meal plan — but want to eat well and save money.

**Developer context:** I am a solo builder with no prior coding experience. I work in data/product analytics. Write clean, well-commented code and explain any non-obvious decisions. Build things incrementally and make sure each piece works before moving on.

---

## Tech Stack

- **Frontend:** Next.js (App Router) + React + Tailwind CSS
- **Backend:** Supabase (Postgres database + Auth)
- **Hosting:** Vercel (planned)
- **Version Control:** GitHub — github.com/samh1995/grocery-app

Supabase is already configured. Environment variables are in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Supabase client is set up in `lib/supabase.js`.

---

## What Has Been Built (Current State)

### Existing pages and features:
- **Onboarding flow** (`app/page.tsx`) — 4-step form collecting: name, household size, dietary style, allergies, spice preference, dislikes, cuisines, cook time, comfort level, want to grow skills
- **Auth pages** (`app/auth/`) — email sign up and login with Supabase Auth
- **Admin panel** (`app/admin/`) — password-protected page for manually entering weekly grocery deals
- **Deal feed** (`app/feed/`) — displays deals from No Frills, Metro, and FreshCo grouped by category with store filtering

### Supabase tables that exist:
- `user_profiles` — stores onboarding preferences (id, name, household_size, dietary_style, allergies, spice, dislikes, cuisines, cook_time, comfort_level, want_to_grow)
- `deals` — stores weekly grocery deals entered via admin panel
- Auth is handled by Supabase Auth (users table is automatic)

### Current limitations:
- Onboarding does NOT yet collect postal code, travel preferences, shopping style, or favourite stores
- Deal feed shows ALL deals — no personalization filtering applied yet
- UI is functional but basic — needs a design refresh to feel polished and trustworthy
- Deals currently cover: No Frills, Metro, FreshCo (planned: Loblaws, Real Canadian Superstore)

---

## YOUR TASK: Rebuild the Onboarding Flow + Polish the UI

### Goal
Rebuild the onboarding from scratch with an expanded set of questions, a polished modern UI, and proper data persistence to Supabase. This is a prototype we will share with real test users in Toronto, so it needs to look and feel like a real product — clean, modern, and trustworthy.

### Design Direction
- **Modern, clean, mobile-first** — this will primarily be used on phones
- Friendly and approachable tone (think: a helpful friend, not a corporate app)
- Smooth transitions between steps (subtle animations)
- Progress indicator showing which step the user is on
- Big, tappable buttons and inputs (mobile-friendly touch targets)
- Use a warm, appetizing color palette (think fresh greens, warm oranges, clean whites)
- Cards and rounded corners, subtle shadows
- The UI should feel like a polished consumer app, NOT a developer prototype

### Onboarding Flow — 4 Screens

**Screen 1 — About You**
- What's your name? (text input)
- What's your postal code? (text input — validate Canadian postal code format: A1A 1A1)
- How many people are you shopping for? (selector: 1, 2, 3, 4, 5+)

**Screen 2 — Your Shopping Style**
- How do you usually get to the grocery store? (single select: 🚶 Walk, 🚗 Drive, 🚌 Transit, 🔄 Mix of all)
- How far are you willing to travel for a good deal? (single select: Nearby only ~1km, Up to 5km, Up to 10km, Anywhere with a good deal)
- Do you prefer to stock up or shop fresh? (single select: 🛒 Big weekly haul — I like to stock up, 🥬 Small frequent trips — I like things fresh, 🔄 Mix of both)
- Any favourite stores? Pick all that apply (multi-select with checkboxes: No Frills, Loblaws, Real Canadian Superstore, FreshCo, Metro, No preference)

**Screen 3 — Your Food Preferences**
- How would you describe your diet? (single select: Omnivore — I eat everything, Vegetarian, Vegan, Pescatarian, Halal, Kosher, Other)
- Any allergies or ingredients to avoid? (multi-select chips: Nuts, Dairy, Gluten, Shellfish, Eggs, Soy, None)
- What cuisines do you love? Pick all that apply (multi-select chips: Canadian/American, Italian, Chinese, Indian, Mexican, Japanese, Korean, Middle Eastern, Caribbean, Thai, Greek, French, Other)
- How do you feel about spice? (single select: 🌶️ Mild, 🌶️🌶️ Medium, 🌶️🌶️🌶️ Spicy, 🔥 Bring the heat)

**Screen 4 — In the Kitchen**
- How comfortable are you in the kitchen? (single select: 🔰 Beginner — keep it simple, 👨‍🍳 Comfortable — I can follow most recipes, 🧑‍🍳 Advanced — I love to experiment)
- How much time do you usually have to cook? (single select: ⚡ Under 15 min, 🕐 15–30 min, 🕑 30–60 min, 🍲 I enjoy long cooks)
- Would you like to grow your cooking skills? (single select: Yes — challenge me!, Sometimes — mix easy and new, No — keep it simple)
- Big friendly "Let's find your deals! 🎉" submit button

### After Submit
- Save all data to the `user_profiles` table in Supabase
- Link the profile to the authenticated user (use Supabase Auth user ID)
- Redirect to the deal feed page (`/feed`)
- Show a brief celebratory moment / welcome animation before redirect (optional but nice)

### Supabase Schema Updates Needed

The `user_profiles` table needs these NEW columns added (keep all existing columns):
- `postal_code` (text)
- `transport_mode` (text) — walk, drive, transit, mix
- `travel_distance` (text) — 1km, 5km, 10km, anywhere
- `shopping_style` (text) — stock_up, fresh, mix
- `favourite_stores` (text[] or jsonb) — array of store names

### Important Notes
- Make sure the onboarding checks if the user is authenticated first — if not, redirect to `/auth`
- If a user already has a profile, pre-fill the form with their existing data (so they can edit)
- All form state should be managed in React (useState or useReducer)
- Make the component modular — each screen should be its own component for maintainability
- Use Tailwind CSS for all styling — no separate CSS files
- Ensure the design is responsive and works great on mobile (375px wide) AND desktop
- Add smooth transitions between steps (CSS transitions or framer-motion if already installed)
- The progress bar should animate between steps

---

## File Structure Guidance

Follow the existing project structure:
```
app/
  page.tsx          ← Rebuild this with the new onboarding
  auth/             ← Existing auth pages (don't modify)
  admin/            ← Existing admin panel (don't modify)
  feed/             ← Existing deal feed (don't modify for now)
lib/
  supabase.js       ← Existing Supabase client (don't modify)
```

You can create new component files if helpful:
```
components/
  onboarding/
    StepAboutYou.tsx
    StepShoppingStyle.tsx
    StepFoodPreferences.tsx
    StepKitchen.tsx
    ProgressBar.tsx
```

---

## Summary

Build a beautiful, modern, mobile-first 4-step onboarding flow that collects the user's grocery shopping preferences and saves them to Supabase. The onboarding should feel like a polished consumer app. Every screen should look intentional and designed — not like a default HTML form. This is the first thing test users will see, so make it count.
