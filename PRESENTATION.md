# WaniWani: Enabling MCP as a Distribution Channel

> **Format**: 10-minute talk for Alpic developers, beginners to MCP / ChatGPT Apps
> **Setup**: Have ChatGPT open + website embed tab + Alpic dashboard + editor with `server/src/journey/index.ts`

---

## SLIDE 1 — Title (0:00 - 0:15)

**WaniWani: Enabling MCP as a Distribution Channel** — with Alpic

---

## SLIDE 2 — What does it mean? (0:15 - 1:30)

> Play the Tuio video.

**Say:**

> "This is Tuio — an insurance company. They're selling policies through the ChatGPT App Store. Not a website, not a mobile app — inside ChatGPT. This is happening right now."

---

## SLIDE 3 — Live Demo (1:30 - 3:00)

> Switch to ChatGPT. Type the prompt.

**Say:**

> "Let me show you what this looks like in practice."

Type:

> *"My family is in Chamonix next weekend and the kids are intermediate skiers"*

Show the conversation, the lesson plan widget, pick a plan, show the ski pass.

> "One sentence — no forms, no comparison websites. Now let me show you the same thing on a website."

Switch to the website embed tab. Show the same flow.

> "Same experience. Same widgets. Same code. No extra work."

---

## SLIDE 4 — Build once, run everywhere (3:00 - 3:30)

**Key message:** ChatGPT, your website, Alpic — same codebase.

**Say:**

> "You write the flow once. It works on ChatGPT through their App Store, it works embedded on your own website, and Alpic deploys it with one command. Same conversation, same widgets, everywhere your customers are."

---

## SLIDE 5 — What WaniWani does (3:30 - 4:30)

**Say:**

> "WaniWani solves three problems:
>
> **Discovery** — We help your brand and your MCP get found on ChatGPT and other LLMs. You build it, we make sure people find it.
>
> **Compliance** — When you sell products or services via MCP, there are legal rules. We make sure you're not breaking any of them.
>
> **Funnel tracking** — How many people started the conversation? How many picked a product? How many booked? We track the whole funnel end-to-end, inside the LLM.
>
> The SDK is open source — it's how you actually build the conversational experience. Let me show you the code."

---

## SLIDE 6 — How does it work? (4:30 - 8:00)

> Switch to your editor. Open `server/src/journey/index.ts`.

### Walk through the file top to bottom:

**1. State (lines 81-118)** — Scroll to `createFlow`. Point at the Zod schema.

> "You define your state — the fields you need to close a booking. The `.describe()` strings are the magic — they become extraction hints for the LLM. You're saying: 'when someone says *I ski blacks*, that means *advanced*.' The SDK handles the extraction."

**2. Welcome node (lines 121-139)** — Scroll to `addNode("welcome", ...)`.

> "`interrupt` pauses the flow and tells the LLM what to ask. You give it a question and a tone. The LLM asks naturally — and the SDK extracts whatever the user shares into your typed state."

**3. Gather details (lines 143-195)** — Scroll down briefly.

> "This node only asks for what's still missing. If the user said everything in one sentence, it's skipped entirely. Conversational, not a form."

**4. Show widget (lines 198-217)** — Scroll to `showWidget`.

> "`showWidget` renders those lesson plan cards you saw. User taps a card, the choice flows back into state automatically."

**5. Edges (lines 255-260)** — Scroll to the bottom.

> "You wire the nodes together. Welcome, gather details, show plans, confirm. It reads like a flow diagram — because it is one. `.compile()` turns it into a single MCP tool."

**6. Integration (open `server/src/index.ts`, lines 103-111)**

> "You register the flow, call `withWaniwani` — that's what gives you the discovery, compliance, and funnel tracking — and `server.run()`. That's it."

---

## SLIDE 7 — Dev & Deploy (8:00 - 9:00)

> Back to slides.

**Say:**

> "For local dev: `npm install`, `npm run dev`, `ngrok http 3000`. You get hot reload on widgets and Skybridge DevTools to test without even opening ChatGPT.
>
> When you're ready to ship: `alpic deploy`. One command. Live everywhere."

---

## SLIDE 8 — Get started (9:00 - 10:00)

**Say:**

> "The whole flow you just saw is 260 lines. The SDK is open source with a generous free tier. This demo repo is public — clone it, run it, break it apart.
>
> Questions?"

**Links on screen:**
- waniwani.ai
- alpic.ai
- This demo repo

---

## Prep Checklist

- [ ] Confirm the deployed app works end-to-end in ChatGPT before going on stage
- [ ] Confirm the website embed works (have the tab ready to switch to)
- [ ] Have the Alpic dashboard open in a tab
- [ ] Have `server/src/journey/index.ts` and `server/src/index.ts` open in your editor
- [ ] Record a 30-second screen capture of the demo as a backup (in case WiFi or ChatGPT is slow)
- [ ] Make sure your ChatGPT connector name is clean (not "test-123")
- [ ] Have the WaniWani signup page ready to show if someone asks about the API key
