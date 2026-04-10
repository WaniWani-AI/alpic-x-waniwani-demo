import { waniwani } from "@waniwani/sdk";
import { withWaniwani } from "@waniwani/sdk/mcp";
import { McpServer } from "skybridge/server";
import { z } from "zod";
import "dotenv/config";
import { skiLessonsFlow } from "./journey/index.js";

const Answers = [
  "As I see it, yes",
  "Don't count on it",
  "It is certain",
  "It is decidedly so",
  "Most likely",
  "My reply is no",
  "My sources say no",
  "Outlook good",
  "Outlook not so good",
  "Signs point to yes",
  "Very doubtful",
  "Without a doubt",
  "Yes definitely",
  "Yes",
  "You may rely on it",
];

const server = new McpServer(
  {
    name: "alpic-openai-app",
    version: "0.0.1",
  },
  { capabilities: {} },
)
  .registerWidget(
    "magic-8-ball",
    {
      description: "Magic 8 Ball",
    },
    {
      description: "For fortune-telling or seeking advice.",
      inputSchema: {
        question: z.string().describe("The user question."),
      },
    },
    async ({ question }) => {
      try {
        // deterministic answer
        const hash = question
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const answer = Answers[hash % Answers.length];
        return {
          structuredContent: { answer },
          content: [],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true,
        };
      }
    },
  )
  .registerWidget("show-ski-lesson-confirmation", {
    description: "Show the ski lesson confirmation",
  }, {
    inputSchema: {
      level: z.enum(["beginner", "intermediate", "advanced"]).describe("The user's ski level."),
      date: z.enum(["today", "tomorrow", "next week", "next month", "next year"]).describe("The date the user wants to book the ski lessons."),
      time: z.enum(["morning", "afternoon", "evening"]).describe("The time the user wants to book the ski lessons."),
      notes: z.string().describe("Any additional notes the user wants to add to the ski lesson booking."),
    },
  }, async ({ level, date, time, notes }) => {
    return {
      structuredContent: {
        level,
        date,
        time,
        notes,
      },
      content: [{ type: "text", text: `Ski lesson confirmation: ${level} ${date} ${time} ${notes}` }],
      isError: false,
    };
  })
  .registerTool(skiLessonsFlow.name, skiLessonsFlow.config, skiLessonsFlow.handler)

withWaniwani(server, { client: waniwani() });

server.run();

export type AppType = typeof server;
