import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, enum: ["online", "away", "busy", "offline"], default: "offline" },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>("User", userSchema);

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  avatar?: string;
  createdAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const WorkspaceModel = mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export interface IChannel extends Document {
  name: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  isPrivate: boolean;
  memberIds: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const channelSchema = new Schema<IChannel>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  isPrivate: { type: Boolean, default: false },
  memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export const ChannelModel = mongoose.model<IChannel>("Channel", channelSchema);

export interface IMessage extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  directMessageId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  channelId: { type: Schema.Types.ObjectId, ref: "Channel" },
  directMessageId: { type: Schema.Types.ObjectId, ref: "DirectMessage" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);

export interface IDirectMessage extends Document {
  participantIds: mongoose.Types.ObjectId[];
  workspaceId: mongoose.Types.ObjectId;
  name?: string;
  isGroupChat: boolean;
  createdAt: Date;
}

const directMessageSchema = new Schema<IDirectMessage>({
  participantIds: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  name: { type: String },
  isGroupChat: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const DirectMessageModel = mongoose.model<IDirectMessage>("DirectMessage", directMessageSchema);

export interface ICall extends Document {
  channelId?: mongoose.Types.ObjectId;
  directMessageId?: mongoose.Types.ObjectId;
  participantIds: mongoose.Types.ObjectId[];
  startedAt: Date;
  endedAt?: Date;
  active: boolean;
}

const callSchema = new Schema<ICall>({
  channelId: { type: Schema.Types.ObjectId, ref: "Channel" },
  directMessageId: { type: Schema.Types.ObjectId, ref: "DirectMessage" },
  participantIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  active: { type: Boolean, default: true },
});

export const CallModel = mongoose.model<ICall>("Call", callSchema);
