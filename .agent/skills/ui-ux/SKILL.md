---
name: Nifty Pulse UI/UX Standard
description: Guidelines and source of truth for the "Silky" design system and aesthetic.
---

# Nifty Pulse "Silky" Design System

This skill defines the visual language and architectural standards for the Nifty Pulse dashboard. All UI/UX changes **must** adhere to the Single Source of Truth (SSOT).

## 🎴 The Master Token System (SSOT)

All styling must be derived from the `DS` constant located at:
`src/lib/design-system.ts`

**Always import the DS object:**
```tsx
import { DS } from "@/lib/design-system";
```

### Core Categories:
1.  **`DS.LAYOUT`**: Page containers, headers, and grids.
2.  **`DS.CARD`**: Surface definitions (`BASE`), padding (`P4`, `P5`, `P6`), and the interactive "Silky Lift" hover state (`INTERACTIVE`).
3.  **`DS.TEXT`**: Hierarchy for headings (`H1`), values (`VALUE`), labels (`LABEL`), and muted metadata (`MUTED_CAPS`).
4.  **`DS.ICON`**: Standardized sizes from `XXS` to `XXL`.
5.  **`DS.DOT`**: Small indicators and status lights.
6.  **`DS.ANIM`**: Standard transitions, pulses, and spins.

---

## 🎨 Aesthetic Principles: "Silky & Premium"

### 1. The "Silky Lift" Interactive State
Every card on the dashboard must feel "alive."
- **Effect**: `hover:scale-[1.01] hover:shadow-2xl hover:border-blue-500/30`.
- **Implementation**: Always include `DS.CARD.INTERACTIVE` and `DS.ANIM.TRANSITION` on card containers.

### 2. High-Fidelity Typography
- **Weights**: Use `font-black` for primary headings and values to create a bold, "Executive" look.
- **Tracking**: Use `tracking-widest` or `tracking-tighter` strategically (as defined in `DS.TEXT`) to avoid a default browser look.
- **Hierarchy**: Labels should be uppercase, small (`text-[10px]`), and muted with high tracking.

### 3. "Silky Midnight" (Dark Mode)
The app uses a **Midnight Blue** palette for dark mode, not pure black. 
- Use the `dark:` prefix with tokens that leverage current theme colors.
- Ensure icons use `DS.ICON` tokens to maintain consistent stroke weights and sizes.

---

## 🛠️ Usage Examples

### Standard Dashboard Card
```tsx
<div className={`${DS.CARD.BASE} ${DS.CARD.P6} ${DS.CARD.INTERACTIVE}`}>
  <h3 className={DS.TEXT.MUTED_CAPS}>Metric Title</h3>
  <p className={DS.TEXT.VALUE}>1,234.56</p>
</div>
```

### Icon with Standard Size
```tsx
<Activity className={DS.ICON.MD} />
```

### Status Indicator (Dot)
```tsx
<div className={`${DS.DOT.SM} rounded-full bg-emerald-500 ${DS.ANIM.PULSE}`} />
```

---

## 📜 Historical Context (v3.0 Overhaul)
The "Silky" Design System was finalized in March 2026 to solve fragmentation. 
- **Centralized Engine**: `design-system.ts` categorizes all Tailwind patterns.
- **Refactored Files**: `page.tsx`, `MetricCard.tsx`, `StatsTable.tsx`, `OverallSignal.tsx`, and all Modals have been standardized.
- **Visual Polish**: Standardized the "Silky Accent" hover effect across every dashboard surface.

---

> [!IMPORTANT]
> **Governance Rule**: Do NOT use hardcoded Tailwind `w-X`, `h-X`, `text-X`, or `rounded-X` classes for core UI elements. Always check if a token exists in `DS` first. If a new pattern is needed, add it to `src/lib/design-system.ts` before applying it.
