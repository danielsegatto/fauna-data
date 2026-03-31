# Mobile-First Constraints

This app is built for smartphone field usage first. Desktop support is welcome, but mobile behavior takes priority when trade-offs appear.

## Non-Negotiable Rules

1. Every primary user flow must work at 360px width without horizontal scroll.
2. Interactive controls must keep touch targets at or above 44x44 px.
3. Core actions must be reachable one-handed without requiring precision taps.
4. Forms and lists must remain usable with on-screen keyboard open.
5. Pages must respect dynamic viewport/safe-area behavior (`100dvh`, bottom insets where needed).
6. Critical actions cannot rely only on hover states.
7. Navigation and action labels must stay clear on small screens (no icon-only controls without accessible labels).
8. New screens must be tested in narrow viewport mode before merge.

## Delivery Checklist (Per Feature)

- [ ] Verified at 360x800 and 390x844 viewport sizes.
- [ ] No clipped text in buttons, headings, chips, or cards.
- [ ] No overlapping fixed/sticky bars with form fields or floating actions.
- [ ] Keyboard interaction checked for focused inputs near bottom of page.
- [ ] Delete/destructive actions remain discoverable but not dominant.
- [ ] Empty/loading/error states are readable and actionable on mobile.
- [ ] Tap path for the main task is <= 3 interactions from entry page.

## PR Guidance

When opening a PR, include a short "Mobile Check" note with:

- tested viewport(s)
- any mobile-specific compromises
- screenshots when layout changed significantly
