import { pgTable, serial, varchar, json, timestamp } from "drizzle-orm/pg-core";

export const ChatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  chatHistory: json("chatHistory").notNull(),
  timestamp: timestamp("timestamp").notNull().default("now()"),
});

export const ChatHistoryTranscribe = pgTable('chat_transcribe_history', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull(),
  chatHistory: json('chatHistory').notNull(),
  fileId: varchar('fileId').notNull().unique(),
  timestamp: timestamp('timestamp').notNull().default('now()'),
});