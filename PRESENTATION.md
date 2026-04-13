# Sell on LLMs: WaniWani SDK + Alpic

> **Format**: 10-minute talk for Alpic developers, beginners to MCP / ChatGPT Apps
> **Setup**: Have ChatGPT open with your deployed connector + your website embed + the Alpic dashboard ready

---

## SLIDE 1 — Live Demo: ChatGPT (0:00 - 1:00)

> No slides. Start with the demo. Open ChatGPT.

**Say:**

> "Let me show you something before I explain anything."

Type into ChatGPT:

> *"My family is in Chamonix next weekend and the kids are intermediate skiers"*

While the app responds conversationally and shows the lesson plan widget:

> "One sentence. No forms, no tabs, no comparison websites. The AI understood who's skiing, their level, and when — and it's showing me lesson plans I can just tap."

Pick a plan. Let the ski pass confirmation appear.

> "That's a booking confirmation — with an instructor, a meeting point, weather, a QR code."

---

## SLIDE 2 — Same Code, Three Surfaces (1:00 - 2:30)

**Key message:** You build it once — it works on ChatGPT, on your own website, and deployed on Alpic. Same codebase, multiple distribution channels.

> Switch to the website embed tab.

**Say:**

> "Now — same experience, but this time on the ski school's own website."

Show the same flow running embedded on a website.

> "Same conversation, same widgets, same booking. No extra code."

> Switch to the Alpic dashboard briefly.

> "And this is the Alpic dashboard — where it's deployed and running in production. One `alpic deploy` and it's live on all these surfaces.
>
> This is the point: you write the flow once, and it works wherever your customers are — on ChatGPT, on your own site, wherever. LLMs are a new distribution channel, just like the web and mobile before them. If your business isn't there, someone else is.
>
> But building for LLMs is different. You're not designing pages — you're designing conversations. And conversations need structure: what to ask, when to show a product, how to close a sale. This whole experience? About 260 lines of code. Let me show you how."

---

## SLIDE 3 — What WaniWani Does (3:00 - 4:30)

**Key message:** WaniWani is a platform, not just an SDK. Three pillars.

**Say:**

> "WaniWani solves three problems for you:
>
> **1. Discovery** — We help your brand and your MCP get discovered on ChatGPT and other LLMs. You build it, we make sure people find it.
>
> **2. Compliance** — When you deploy an MCP that sells products or services, there are legal rules. We make sure you're not breaking any of them.
>
> **3. Funnel tracking** — You need to know: how many people started the conversation? How many picked a product? How many actually booked? We track the whole funnel end-to-end, inside the LLM.
>
> The SDK is the open-source piece — it's how you actually build the conversational experience. Let me show you the code."

---

## SLIDE 4 — The Flow in 4 Pieces (4:30 - 8:00)

> Show code. Walk through `server/src/journey/index.ts`.

### Piece 1: State as a Zod schema (30 sec)

Show lines 81-118:

```ts
export const skiLessonsFlow = createFlow({
  id: "ski_lessons",
  title: "Book a Ski Lesson",
  description: "Book a personalized ski lesson from an alpine concierge...",
  state: {
    level: z.enum(["beginner", "intermediate", "advanced", "expert"])
      .describe("The skier's self-reported level. Infer from context..."),
    groupSize: z.number().int().min(1).max(12)
      .describe("Number of people in the lesson. Infer from mentions of family..."),
    date: z.string()
      .describe("The date of the lesson, in human-readable form..."),
    time: z.enum(["morning", "afternoon"])
      .describe("Preferred time of day for the lesson."),
    goals: z.string()
      .describe("What the skier wants to work on..."),
    lessonPlan: z.enum(["private", "small_group", "family"])
      .describe("The lesson plan the user picked from the selector widget..."),
  },
})
```

**Say:**

> "You define your state with Zod — the fields you need to collect to complete a booking. The `.describe()` strings are the magic — those become extraction hints for the LLM. You're telling ChatGPT: 'when someone says *I ski blacks*, that means *advanced*.' The SDK handles the rest."

### Piece 2: `interrupt` — ask the user, naturally (1 min)

Show lines 121-139 (the welcome node):

```ts
.addNode("welcome", ({ interrupt }) => {
  return interrupt({
    goals: {
      question: "Tell me about your ski trip — who's skiing and what are you hoping to work on?",
      context: `This is the first message of a premium ski-school concierge experience.
        Greet the user warmly and ask ONE open-ended question...
        From the user's response, extract into stateUpdates whatever they naturally share...`
    },
  });
})
```

**Say:**

> "`interrupt` pauses the flow and tells the LLM what to ask. You give it a question and a context for tone. The LLM asks naturally — no forms, no bullet points — and the SDK extracts whatever the user shares into your typed state. If they gave you everything in one sentence, great — you move on. If not, the next node picks up what's missing."

Show lines 143-195 (gather_details) briefly:

```ts
.addNode("gather_details", ({ state, interrupt }) => {
  return interrupt({
    ...(!state.level ? { level: { question: "What level would you say you're at?" } } : {}),
    ...(!state.groupSize ? { groupSize: { question: "How many people will be skiing?" } } : {}),
    // ... only asks what's missing
  });
})
```

> "This node only asks for what's still missing. If the user already said everything in the first message, this step is skipped entirely. Conversational, not repetitive."

### Piece 3: `showWidget` — flow state to UI (30 sec)

Show lines 198-217:

```ts
.addNode("show_lesson_plans", ({ state, showWidget }) => {
  const plans = buildPlans(state.groupSize ?? 1, state.level ?? "intermediate");

  return showWidget("select-lesson-plan", {
    field: "lessonPlan",
    description: "The lesson plan selector is now on screen...",
    data: { level: state.level, groupSize: state.groupSize, date: state.date,
            time: state.time, goals: state.goals, plans },
  });
})
```

**Say:**

> "`showWidget` takes your flow state and renders it as a rich widget — the three lesson plan cards you saw in the demo. When the user taps a card, the SDK captures their choice back into state. No glue code, no callbacks — it just works."

### Piece 4: Edges — the journey as a graph (30 sec)

Show lines 255-260:

```ts
.addEdge(START, "welcome")
.addEdge("welcome", "gather_details")
.addEdge("gather_details", "show_lesson_plans")
.addEdge("show_lesson_plans", "confirm_booking")
.addEdge("confirm_booking", END)
.compile();
```

**Say:**

> "Finally, you wire the nodes together with edges. Welcome leads to gather details, which leads to the lesson picker, which leads to the confirmation. It reads like a flow diagram — because it is one. And `.compile()` turns it into a single MCP tool that ChatGPT can call."

---

## SLIDE 5 — Plug It In: 2 Lines (8:00 - 8:30)

Show `server/src/index.ts` lines 103-111:

```ts
server.registerTool(
  skiLessonsFlow.name,
  skiLessonsFlow.config,
  skiLessonsFlow.handler,
);

withWaniwani(server, { client: waniwani() });

server.run();
```

**Say:**

> "You register the flow as a tool on your MCP server, call `withWaniwani` to connect to the platform — that's what gives you the discovery, the compliance, the funnel tracking — and `server.run()`. That's it."

---

## SLIDE 6 — Dev Experience: Alpic + Skybridge (8:30 - 9:15)

**Say:**

> "You saw it running in production earlier — let me quickly show you the dev side.
>
> Locally, it's three commands:
>
> ```
> npm install
> npm run dev
> ngrok http 3000
> ```
>
> You get hot reload on the widgets, Skybridge DevTools to test without even opening ChatGPT, and when you're ready to ship:
>
> ```
> alpic deploy
> ```
>
> One command. Your MCP is live on ChatGPT, embeddable on your website — everywhere."

---

## SLIDE 7 — Get Started (9:15 - 10:00)

**Say:**

> "To recap:
>
> 1. LLMs are a new channel to sell your products and services
> 2. You write the flow once — it works on ChatGPT, on your website, wherever your customers are
> 3. WaniWani gets you discovered, keeps you compliant, and tracks your funnel end-to-end
> 4. The SDK is open source with a generous free tier — define your state, your nodes, your widgets, and ship
> 5. Alpic deploys it in one command
>
> This demo repo is public — clone it, run it, break it apart. The whole flow is 260 lines.
>
> **Links to show:**
> - This repo (the demo)
> - `waniwani.ai` (SDK docs, API key signup)
> - `alpic.ai` (deploy)
>
> Questions?"

---

## Prep Checklist

- [ ] Confirm the deployed app works end-to-end in ChatGPT before going on stage
- [ ] Confirm the website embed works (have the tab ready to switch to)
- [ ] Have the Alpic dashboard open in a tab
- [ ] Have the repo open in your editor, ready to show `server/src/journey/index.ts` and `server/src/index.ts`
- [ ] Record a 30-second screen capture of the demo as a backup (in case WiFi or ChatGPT is slow)
- [ ] Make sure your ChatGPT connector name is clean (not "test-123")
- [ ] Have the WaniWani signup page ready to show if someone asks about the API key
