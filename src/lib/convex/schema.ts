import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    chat: defineTable({
        generating: v.boolean(),
        userId: v.string(),
        title: v.string(),
    }).index('by_user', ['userId']),
});