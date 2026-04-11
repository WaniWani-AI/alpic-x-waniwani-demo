# Alpine School Concierge

A demo ChatGPT/MCP app that turns a single natural message ("My family is in Chamonix next weekend and the kids are intermediate skiers") into a fully-booked ski lesson with a shareworthy alpine ski pass.

Powered by Skybridge + WaniWani SDK (conversational flow engine) + Alpic.

## Value Proposition

**Problem**: booking ski lessons today means hopping between resort websites, comparing instructor bios, filling out booking forms, and copy-pasting dates. It's slow and rarely feels premium.

**Target**: skiers planning a trip — families, couples, solo travellers.

**Core actions**:
1. Describe your group and trip in plain words
2. Pick a lesson plan that fits
3. Receive a beautiful ski pass confirmation

## Why LLM?

**Conversational win**: "We're three intermediates looking to work on carving next Saturday morning" is one sentence — on a website it's 6 form fields.

**LLM adds**: natural intent extraction (level, group size, date, time, goals), tone-matching follow-ups for whatever's missing, and the smarts to pick sensible defaults.

**LLM lacks**: actual instructor availability, pricing, meeting points. The server fills these in (mocked for the demo).

## UX Flows

**Book a ski lesson**
1. Open-ended question gathers level, group size, date, time, goals in one message
2. Conversational follow-up for anything missing (one or two at a time)
3. Show lesson plans widget — user picks Private / Small Group / Family
4. Show ski pass confirmation widget with booking reference, instructor, meeting point, and weather

## Tools and Widgets

**Widget: `select-lesson-plan`**
- Input: `{ level, groupSize, date, time, goals }`
- Output: `{ plans: [{ id, name, tagline, durationMinutes, priceEur, perks[], instructor }] }`
- Views: three plan cards, each clickable
- Behavior: clicking a card calls `useSendFollowUpMessage` with "I'd like the {plan name}" so the LLM continues the flow

**Widget: `ski-pass-confirmation`**
- Input: `{ level, groupSize, date, time, lessonPlan, instructor, meetingPoint, bookingRef, weather, goals }`
- Output: echoes the input plus a cheerful summary line
- Views: single full-bleed ski pass card (inline). Pure CSS + inline SVG.

## Journey (server-side flow)

State: `level`, `groupSize`, `date`, `time`, `goals`, `lessonPlan`

Nodes:
1. `welcome` — interrupt, open-ended, extracts everything possible
2. `gather_details` — interrupt, fills in whatever the welcome step missed (conditional asks)
3. `show_lesson_plans` — `showWidget("select-lesson-plan", ...)` — waits for user to pick
4. `confirm_booking` — `showWidget("ski-pass-confirmation", ...)` — generates booking ref, instructor, meeting point, weather server-side

## Product Context

- **Existing products**: none — demo only
- **APIs**: none — all data mocked server-side
- **Auth**: none
- **Constraints**: inline display mode only. No external deps beyond what the template ships.
