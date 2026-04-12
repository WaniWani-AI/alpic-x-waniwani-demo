import { withWaniwani } from "@waniwani/sdk/mcp";
import "dotenv/config";
import { McpServer } from "skybridge/server";
import { z } from "zod";
import { skiLessonsFlow } from "./journey/index.js";

const lessonPlanSchema = z.object({
  id: z.enum(["private", "small_group", "family"]),
  name: z.string(),
  tagline: z.string(),
  durationMinutes: z.number(),
  priceEur: z.number(),
  perks: z.array(z.string()),
});

const server = new McpServer(
  {
    name: "alpic-openai-app",
    version: "0.0.1",
  },
  { capabilities: {} },
)
  .registerWidget(
    "select-lesson-plan",
    {
      description:
        "Show three curated ski lesson plans for the skier to pick from.",
    },
    {
      inputSchema: {
        level: z.string().describe("The skier's level."),
        groupSize: z.number().describe("How many people are skiing."),
        date: z.string().describe("The lesson date."),
        time: z.string().describe("Morning or afternoon."),
        goals: z.string().describe("What the skier wants to work on."),
        plans: z
          .array(lessonPlanSchema)
          .describe("Three curated lesson plans."),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ level, groupSize, date, time, goals, plans }) => {
      return {
        structuredContent: { level, groupSize, date, time, goals, plans },
        content: [
          {
            type: "text",
            text: `Showing ${plans.length} lesson plan options.`,
          },
        ],
        isError: false,
      };
    },
  )
  .registerWidget(
    "ski-pass-confirmation",
    {
      description: "Show the finalized ski pass confirmation card.",
    },
    {
      inputSchema: {
        bookingRef: z.string().describe("Booking reference code."),
        level: z.string().describe("The skier's level."),
        groupSize: z.number().describe("How many people are skiing."),
        date: z.string().describe("Lesson date."),
        time: z.string().describe("Morning or afternoon."),
        goals: z.string().describe("What the skier wants to work on."),
        lessonPlan: z.string().describe("The selected lesson plan name."),
        lessonTagline: z.string().describe("The plan's tagline."),
        durationMinutes: z.number().describe("Lesson duration in minutes."),
        priceEur: z.number().describe("Price in euros."),
        instructor: z.string().describe("Assigned instructor name."),
        instructorStyle: z
          .string()
          .describe("Short blurb about the instructor."),
        meetingPoint: z.string().describe("Where to meet the instructor."),
        weather: z.string().describe("Weather forecast line."),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async (input) => {
      return {
        structuredContent: input,
        content: [
          {
            type: "text",
            text: `Booking ${input.bookingRef} confirmed — ${input.lessonPlan} with ${input.instructor} on ${input.date}.`,
          },
        ],
        isError: false,
      };
    },
  )
  .registerTool(
    skiLessonsFlow.name,
    skiLessonsFlow.config,
    skiLessonsFlow.handler,
  )
  .registerTool(
    "debug_extra",
    { description: "Debug the extra object" },
    async (input: any, extra: any) => {
      console.log("[debug] extra:", extra);
      console.log("[debug] input:", input);

      if (typeof extra === "object" && extra !== null) {
        console.log("[debug] extra keys:", Object.keys(extra));
        console.log("[debug] extra.sessionId:", typeof extra.sessionId, extra.sessionId);
        console.log("[debug] extra._meta:", JSON.stringify(extra._meta));
        console.log("[debug] extra.requestInfo:", JSON.stringify(extra.requestInfo, null, 2));
        console.log("[debug] extra.requestInfo.headers:", JSON.stringify(extra.requestInfo.headers, null, 2));
        console.log("[debug] input:", JSON.stringify(input, null, 2));
      }
      return { content: [{ type: "text", text: JSON.stringify(Object.keys(extra)) }] };
    },
  );

withWaniwani(server);

server.run();

export type AppType = typeof server;
