# Nifty Pulse v2.0 — Implementation Plan

> **Goal:** Transform Nifty Pulse from a static valuation dashboard into a **Tactical Investment Command Center** with real-time data, actionable signals, and personalization features.

---

## Gap Analysis: Current State vs v2 Requirements

| Feature | Current State | v2 Requirement | Status |
|---------|--------------|----------------|--------|
| Multi-index support | 6 indices (Nifty 50, Next 50, Midcap 150, Smallcap 250, LargeMidcap 250, 500) | All 6 indices with dedicated dashboards | Exists |
| P/E, P/B, DY data | 10-year historical via MongoDB | Same | Exists |
| Percentile calculation | Basic percentile rank | Same + Yield Gap + 200-DMA distance | Extend |
| Signal system | 5-zone weighted percentile (Deeply Undervalued → Deeply Overvalued) | New Signal Matrix (Strong Buy → Overvalued) with SIP/Lumpsum advice | Rewrite |
| Real-time data | REST with 1-hour cache | Next.js revalidation + GitHub Actions cron (free, no WebSockets) | Adjusted |
| Persistence | MongoDB Atlas | MongoDB for pulse snapshots too (no Supabase needed) | Adjusted |
| Charts | Recharts Area charts with time range filter | Annotated Charts with 52-week High/Low pins | Extend |
| Gauge | Flat percentile bar in OverallSignal | 180° Radial Tactical Gauge (speedometer) | Rewrite |
| Index selection | Button grid (IndexSelector) | Search bar with toggle | Rewrite |
| Date-Wise Lookup | None | Calendar UI for historical signal lookup | New |
| Dark mode | Partial (dark bg classes) | True OLED Dark Mode (#000000) | Extend |
| Daily Thirukkural | None | Rotating verse card from Porulpaal | New |
| Voice commands | None | Web Speech API ("Hey Pulse, check Midcap") | New |
| PWA | None | Installable PWA with manifest | New |

---

## Phase 1: Data & Multi-Index Foundation

**Goal:** Solidify the data layer, add new data sources, and set up snapshot persistence.

### 1.1 — Verify All 6 Index Configurations
- **File:** `src/lib/constants.ts`
- Ensure all 6 indices (Nifty 50, Next 50, Midcap 150, Smallcap 250, LargeMidcap 250, Nifty 500) are enabled and have dedicated dashboards
- Validate data pipelines and snapshot storage cover all 6 indices

### 1.2 — Add 10-Year G-Sec Yield Data Source
- **New file:** `src/data/gsec.ts`
- Fetch 10-Year Government Securities yield from RBI/public API
- Store in MongoDB collection `gsec_yields` with `{ date, yield }` schema
- Update `scripts/update_data.py` to fetch and store daily G-Sec yield alongside index data

### 1.3 — Add 200-Day Moving Average Calculation
- **File:** `src/data/index.ts`
- New function `compute200DMA(history)` — calculates 200-day simple moving average of closing P/E
- New function `computeDistanceFromDMA(current, dma200)` — returns standard deviation distance

### 1.4 — Pulse Snapshots in MongoDB (Free, No Supabase)
- **New collection:** `pulse_snapshots` in existing MongoDB Atlas (free tier)
- **New file:** `src/data/snapshots.ts` — CRUD functions for pulse snapshots
- Schema per document:
  ```
  { indexId, date, pePercentile, pbPercentile, dyPercentile,
    yieldGap, dmaDistance, signal: { signal, label, recommendedAction, ... } }
  ```
- **New collection:** `gsec_yields` — daily G-Sec yield storage
- **New file:** `src/data/gsec.ts` — fetch latest G-Sec yield from MongoDB
- Python pipeline writes snapshots daily after computing signals

### 1.5 — Update Python Data Pipeline
- **File:** `scripts/update_data.py`
- Add G-Sec yield fetching (RBI DBIE or alternative public source)
- Add daily snapshot writing to Supabase after all index data is updated
- Add 52-week high/low tracking per index (store in MongoDB)

**Deliverables:** G-Sec data flowing, 200-DMA computed, snapshots stored daily, 52-week H/L tracked.

---

## Phase 2: The Tactical Engine

**Goal:** Rewrite the signal/recommendation engine to produce actionable SIP vs Lumpsum advice.

### 2.1 — New Signal Matrix Implementation
- **New file:** `src/lib/signals.ts`
- Implement the v2 signal matrix:

| Condition | Signal | Action |
|-----------|--------|--------|
| P/E < 20th percentile | Strong Buy | Lumpsum + SIP |
| Price < 10% below 200-DMA | Tactical Dip | Lumpsum Top-up |
| 20th < P/E < 50th percentile | Buy | Continue SIP |
| 50th < P/E < 80th percentile | Hold | Neutral / No Lumpsum |
| P/E > 80th percentile | Overvalued | Reduce Exposure / Halt SIP |

- Function signature: `getInvestmentStrategy(indexData: IndexValuation, gsecYield: number, dma200: number) => TacticalSignal`

### 2.2 — Yield Gap Calculation
- **File:** `src/lib/signals.ts`
- `computeYieldGap(pe, gsecYield)`:
  - Earnings Yield = `1 / P/E × 100`
  - Yield Gap = Earnings Yield − G-Sec Yield
  - Positive gap = equities are attractive vs bonds

### 2.3 — SIP vs Lumpsum Logic
- **File:** `src/lib/signals.ts`
- Based on signal + yield gap, output:
  - `recommendedMode`: "Lumpsum + SIP" | "SIP Only" | "Neutral" | "Reduce"
  - `allocationPercentage`: Suggested equity allocation (0-100%)
  - `confidence`: "High" | "Medium" | "Low" based on how many indicators agree

### 2.4 — Update TypeScript Types
- **File:** `src/types/index.ts`
- Add new types:
  ```typescript
  type Signal = "strong-buy" | "tactical-dip" | "buy" | "hold" | "overvalued"

  interface TacticalSignal {
    signal: Signal
    recommendedAction: string
    recommendedMode: "Lumpsum + SIP" | "SIP Only" | "Neutral" | "Reduce"
    allocationPercentage: number
    confidence: "High" | "Medium" | "Low"
    yieldGap: number
    dmaDistance: number
    pePercentile: number
  }

  interface PulseSnapshot {
    indexId: IndexId
    date: string
    signal: TacticalSignal
  }
  ```

**Deliverables:** `getInvestmentStrategy()` returns actionable advice for any index on any date.

---

## Phase 3: High-Rich UI Development

**Goal:** Rebuild the UI to be "Action-First" with premium visuals.

### 3.1 — Radial Tactical Gauge Component
- **New file:** `src/components/dashboard/RadialGauge.tsx`
- Replace the flat bar in `OverallSignal.tsx` with a 180° speedometer
- SVG-based arc with gradient coloring (green → yellow → red)
- Animated needle pointing to current signal score
- Center text showing signal label ("Strong Buy", "Hold", etc.)
- Recommended action text below the gauge
- Responsive: scales for mobile and 4K

### 3.2 — Index Search Bar
- **Rewrite:** `src/components/ui/IndexSelector.tsx`
- Replace button grid with a search/dropdown component
- Typeahead filtering: "Nifty Mid..." → "Nifty Midcap 150"
- Show the 4 primary indices as quick-select chips below the search bar
- Mobile: full-width dropdown; Desktop: compact inline selector

### 3.3 — Annotated Charts with 52-Week High/Low
- **File:** `src/components/charts/ValuationChart.tsx`
- Add `ReferenceLine` markers for 52-week High and 52-week Low
- Pin labels showing the date and value at each extremity
- Add horizontal reference band for the "Fair Value" zone
- Tooltip enhancement: show signal status at each data point

### 3.4 — Date-Wise Lookup ("Time Travel")
- **New file:** `src/components/dashboard/DateLookup.tsx`
- Calendar date picker UI component
- On date selection, fetch the `PulseSnapshot` for that date from Supabase
- Display: the gauge, signal, and recommended action as they were on that date
- Constraint: only dates with stored snapshots are selectable (greyed-out otherwise)

### 3.5 — True OLED Dark Mode (#000000)
- **File:** `src/app/globals.css`
- Add CSS custom properties for OLED theme:
  - `--bg-primary: #000000`
  - `--bg-card: #0A0A0A`
  - `--border: #1A1A1A`
- Add theme toggle button in the header (sun/moon icon)
- Store preference in `localStorage`
- Ensure all components respect theme variables
- High-contrast text: pure white (#FFFFFF) on black

### 3.6 — Responsive Layout Overhaul
- **File:** `src/app/page.tsx`
- Restructure layout for the new components:
  - **Top:** Index Search + Date Lookup
  - **Center:** Radial Gauge (hero element)
  - **Below gauge:** SIP/Lumpsum recommendation card
  - **Middle:** 3 Metric Cards (P/E, P/B, DY) + Yield Gap card
  - **Bottom:** Annotated Charts + Stats Table
- Mobile: single-column stack, gauge takes full width
- 4K: multi-column grid, gauge centered with metrics flanking

**Deliverables:** Premium, action-first UI with gauge, annotated charts, date lookup, and OLED dark mode.

---

## Phase 4: Real-Time & Personalization

**Goal:** Add live data streaming, voice commands, and cultural personalization.

### 4.1 — Data Freshness via Next.js Revalidation (Free, No WebSockets)
- **Why:** Vercel serverless doesn't support persistent WebSocket connections, and Socket.io adds cost/complexity
- **Approach:** Use Next.js `unstable_cache` with `revalidate: 3600` (already in place) + on-demand revalidation via `revalidateTag("valuation")` triggered by the Python pipeline after each daily update
- **Pipeline:** GitHub Actions cron (daily at 4:15 PM IST) → Python script → MongoDB writes → Vercel revalidation POST → Fresh data served
- **No new dependencies required**

### 4.2 — Daily Thirukkural Card
- **New file:** `src/data/thirukkural.ts` — curated list of Porulpaal (Book of Wealth) verses
  - Each entry: `{ number, tamil, transliteration, english, topic }`
  - ~50 curated wealth-related verses
- **New file:** `src/components/dashboard/ThirukkuralCard.tsx`
  - "Market Wisdom" section card
  - Rotates daily based on day-of-year modulo verse count
  - Shows Tamil text, transliteration, and English meaning
  - Subtle animation on load

### 4.3 — Voice Interactivity (Web Speech API)
- **New file:** `src/lib/voice.ts` — Web Speech API wrapper
- **New file:** `src/components/ui/VoiceTrigger.tsx` — Microphone button UI
- Supported commands:
  - "Hey Pulse, check Midcap" → switches to Midcap 150 index
  - "What is today's wisdom?" → reads the Thirukkural aloud (SpeechSynthesis)
  - "Show Nifty 50" → switches index
  - "What's the signal?" → reads current signal aloud
- Visual feedback: pulsing mic icon when listening
- Graceful degradation: hide mic button if browser doesn't support Web Speech API

### 4.4 — PWA Manifest & Installability
- **New file:** `public/manifest.json`
  ```json
  {
    "name": "Nifty Pulse",
    "short_name": "NiftyPulse",
    "description": "Tactical Investment Command Center",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#10B981",
    "icons": [...]
  }
  ```
- **New file:** `public/sw.js` — Basic service worker for offline shell caching
- Update `src/app/layout.tsx` to include manifest link and theme-color meta
- Generate PWA icons (192x192, 512x512) from existing icon

**Deliverables:** Live data streaming, installable PWA, voice commands, daily Thirukkural.

---

## Phase 5: Integration, Testing & Polish

**Goal:** Wire everything together, test thoroughly, and prepare for deployment.

### 5.1 — End-to-End Integration
- Connect the new tactical engine to the new UI components
- Ensure Radial Gauge renders from `getInvestmentStrategy()` output
- Verify Date-Wise Lookup pulls correct snapshots from MongoDB
- Test GitHub Actions → MongoDB → Vercel revalidation pipeline end-to-end

### 5.2 — Performance Optimization
- Lazy-load heavy components (charts, date picker, voice module)
- Image/icon optimization for PWA
- Ensure initial page load shows actionable signal within 3 seconds (success criteria)
- Bundle analysis — keep JS payload under 200KB gzipped

### 5.3 — Cross-Device Testing
- Mobile (360px–428px): Verify single-column layout, touch interactions
- Tablet (768px–1024px): Verify two-column layout
- Desktop 4K (2560px+): Verify multi-column grid, gauge scaling
- PWA install flow on Android Chrome and iOS Safari

### 5.4 — Data Integrity Validation
- Verify 10-year P/E percentiles match NSE published data
- Validate G-Sec yield source accuracy
- Test Date-Wise Lookup against known historical signals
- Confirm 52-week High/Low annotations are correct

---

## New Files Summary

| File | Purpose |
|------|---------|
| `src/data/gsec.ts` | G-Sec yield fetching from MongoDB |
| `src/data/snapshots.ts` | Pulse snapshot CRUD (MongoDB) |
| `src/lib/signals.ts` | Tactical signal engine (v2 logic) |
| `src/lib/voice.ts` | Web Speech API wrapper |
| `src/components/dashboard/RadialGauge.tsx` | 180° speedometer gauge |
| `src/components/dashboard/DateLookup.tsx` | Calendar time-travel UI |
| `src/components/dashboard/ThirukkuralCard.tsx` | Daily wisdom card |
| `src/components/ui/VoiceTrigger.tsx` | Mic button for voice commands |
| `src/data/thirukkural.ts` | Curated Porulpaal verse data |
| `public/manifest.json` | PWA manifest |

## Modified Files Summary

| File | Changes |
|------|---------|
| `src/lib/constants.ts` | Primary/secondary index designation, new signal types |
| `src/types/index.ts` | New types: TacticalSignal, PulseSnapshot, Signal |
| `src/data/index.ts` | Add 200-DMA, yield gap computations |
| `src/app/page.tsx` | New layout with gauge, search, date lookup |
| `src/app/globals.css` | OLED dark mode CSS variables |
| `src/app/layout.tsx` | PWA manifest link, theme-color meta |
| `src/components/charts/ValuationChart.tsx` | 52-week H/L annotations |
| `src/components/ui/IndexSelector.tsx` | Rewrite as search bar |
| `src/components/dashboard/OverallSignal.tsx` | Replace with RadialGauge |
| `scripts/update_data.py` | G-Sec fetch, snapshot writing, 52-week tracking |
| `.github/workflows/daily-update.yml` | Updated cron with revalidation env vars |

## Cost & Architecture Notes

- **No new paid dependencies.** Everything runs on free tiers:
  - Vercel (free hosting), MongoDB Atlas (free 512MB), GitHub Actions (free 2000 min/month)
- **No Socket.io / WebSockets.** Vercel serverless doesn't support persistent connections. Data freshness handled by Next.js revalidation + GitHub Actions cron.
- **No Supabase.** All data (history, snapshots, G-Sec yields, 52W stats) stored in existing MongoDB Atlas.
- **No IP blocking risk.** NSE data fetched from GitHub Actions runners (GitHub's IP pool), not your machine.

---

## Success Criteria (from v2 doc)

1. **Actionable Advice** — Users know whether to Lumpsum or SIP within 3 seconds of looking
2. **Multi-Index Coverage** — All 6 indices (Nifty 50, Next 50, Midcap 150, Smallcap 250, LargeMidcap 250, Nifty 500) have dedicated dashboards
3. **Historical Integrity** — Date-Wise Lookup returns accurate data for any stored date
4. **Aesthetic Excellence** — Premium look on both 4K screens and mobile devices
