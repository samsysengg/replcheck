import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  avatar: z.string().optional(),
  status: z.enum(["online", "away", "busy", "offline"]).default("offline"),
  createdAt: z.coerce.date(),
});

export const insertUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  avatar: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const workspaceSchema = z.object({
  _id: z.string(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  avatar: z.string().optional(),
  createdAt: z.coerce.date(),
});

export const insertWorkspaceSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  ownerId: z.string(),
});

export type Workspace = z.infer<typeof workspaceSchema>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;

export const channelSchema = z.object({
  _id: z.string(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  workspaceId: z.string(),
  isPrivate: z.boolean().default(false),
  memberIds: z.array(z.string()),
  createdAt: z.coerce.date(),
});

export const insertChannelSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  workspaceId: z.string(),
  isPrivate: z.boolean().default(false),
});

export type Channel = z.infer<typeof channelSchema>;
export type InsertChannel = z.infer<typeof insertChannelSchema>;

export const messageSchema = z.object({
  _id: z.string(),
  content: z.string().min(1),
  authorId: z.string(),
  channelId: z.string().optional(),
  directMessageId: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export const insertMessageSchema = z.object({
  content: z.string().min(1),
  authorId: z.string(),
  channelId: z.string().optional(),
  directMessageId: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const directMessageSchema = z.object({
  _id: z.string(),
  participantIds: z.array(z.string()).length(2),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
});

export const insertDirectMessageSchema = z.object({
  participantIds: z.array(z.string()).length(2),
  workspaceId: z.string(),
});

export type DirectMessage = z.infer<typeof directMessageSchema>;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;

export const callSchema = z.object({
  _id: z.string(),
  channelId: z.string().optional(),
  directMessageId: z.string().optional(),
  participantIds: z.array(z.string()),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional(),
  active: z.boolean().default(true),
});

export const insertCallSchema = z.object({
  channelId: z.string().optional(),
  directMessageId: z.string().optional(),
  participantIds: z.array(z.string()),
  active: z.boolean().default(true),
});

export type Call = z.infer<typeof callSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;
