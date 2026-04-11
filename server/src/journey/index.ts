import { createFlow, END, START } from "@waniwani/sdk/mcp";
import { z } from "zod";

export const skiLessonsFlow = createFlow({
    id: "ski_lessons",
    title: "Ski Lessons",
    description:
        "Book ski lessons for a user. Use when a user wants to book ski lessons.",
    state: {
        level: z.enum(["beginner", "intermediate", "advanced"]).describe("The user's ski level."),
        date: z.enum(["today", "tomorrow", "next week", "next month", "next year"]).describe("The date the user wants to book the ski lessons."),
        time: z.enum(["morning", "afternoon", "evening"]).describe("The time the user wants to book the ski lessons."),
        notes: z.string().describe("Any additional notes the user wants to add to the ski lesson booking."),
    }
})
    .addNode("welcome", async ({ interrupt }) => {
        return interrupt({
            level: {
                question: "What is your ski level?",
                context: "The user might not know their ski level, so you need to ask them. If they don't know, you can ask them to describe their skiing experience.",
                suggestions: ["beginner", "intermediate", "advanced"],
            }
        })
    })
    .addNode("date_and_time", async ({ interrupt }) => {
        return interrupt({
            date: {
                question: "What date do you want to book the ski lessons?",
                suggestions: ["today", "tomorrow", "next week", "next month", "next year"],
            },
            time: {
                question: "What time do you want to book the ski lessons?",
            },
        }, {
            context: "The user might have a specific date in mind, so you need to ask them. If they don't have a specific date in mind, you can ask them to describe the date they want to book the ski lessons.",
        })
    })
    .addNode("notes", async ({ interrupt }) => {
        return interrupt({
            notes: {
                question: "Do you have any additional notes for the ski lesson booking?",
            },
        }, {
            context: "The user might have a specific duration in mind, so you need to ask them. If they don't have a specific duration in mind, you can ask them to describe the duration they want to book the ski lessons.",
        })
    })
    .addNode("confirmation", async ({ state, showWidget }) => {
        return showWidget(
            "show-ski-lesson-confirmation",
            {
                data: {
                    level: state.level,
                    date: state.date,
                    time: state.time,
                    notes: state.notes,
                },
                description: "The user has confirmed the ski lesson booking.",
            })
    })
    .addEdge(START, "welcome")
    .addEdge("welcome", "date_and_time")
    .addEdge("date_and_time", "notes")
    .addEdge("notes", "confirmation")
    .addEdge("confirmation", END)
    .compile();