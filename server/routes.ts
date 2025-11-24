import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import { authenticate, AuthRequest } from "./middleware/auth";
import {
  UserModel,
  WorkspaceModel,
  ChannelModel,
  MessageModel,
  DirectMessageModel,
  CallModel,
} from "./models";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later",
  skip: () => process.env.NODE_ENV !== "production",
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }
    
    if (process.env.NODE_ENV === "production") {
      if (origin.endsWith(".replit.app") || origin.endsWith(".replit.dev")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    } else {
      if (origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("replit.dev")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  };

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post(
    "/api/auth/register",
    authLimiter,
    body("username").isLength({ min: 3, max: 30 }).trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { username, email, password } = req.body;

        const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
          username,
          email,
          password: hashedPassword,
          status: "online",
        });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        const userResponse = {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.createdAt,
        };

        res.json({ token, user: userResponse });
      } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error during registration" });
      }
    }
  );

  app.post(
    "/api/auth/login",
    authLimiter,
    body("email").isEmail().normalizeEmail(),
    body("password").exists(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user || !user.password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        await UserModel.findByIdAndUpdate(user._id, { status: "online" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        const userResponse = {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          status: "online",
          createdAt: user.createdAt,
        };

        res.json({ token, user: userResponse });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
      }
    }
  );

  app.post("/api/auth/logout", authenticate, async (req: AuthRequest, res) => {
    try {
      await UserModel.findByIdAndUpdate(req.userId, { status: "offline" });
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Server error during logout" });
    }
  });

  app.get("/api/search", authenticate, async (req: AuthRequest, res) => {
    try {
      const { q, type = "all" } = req.query;
      const query = q as string;

      if (!query || query.length < 2) {
        return res.json({ users: [], channels: [], messages: [] });
      }

      const searchRegex = new RegExp(query, "i");
      const results: any = {};

      if (type === "all" || type === "users") {
        const users = await UserModel.find({
          $and: [
            { _id: { $ne: req.userId } },
            {
              $or: [
                { username: searchRegex },
                { email: searchRegex },
              ],
            },
          ],
        }).limit(10);

        results.users = users.map((u) => ({
          _id: u._id.toString(),
          username: u.username,
          email: u.email,
          avatar: u.avatar,
          status: u.status,
        }));
      }

      if (type === "all" || type === "channels") {
        const channels = await ChannelModel.find({
          name: searchRegex,
        }).limit(10);

        results.channels = channels.map((c) => ({
          _id: c._id.toString(),
          name: c.name,
          description: c.description,
          workspaceId: c.workspaceId.toString(),
        }));
      }

      if (type === "all" || type === "messages") {
        const messages = await MessageModel.find({
          content: searchRegex,
        })
          .sort({ createdAt: -1 })
          .limit(20);

        results.messages = messages.map((m) => ({
          _id: m._id.toString(),
          content: m.content,
          authorId: m.authorId.toString(),
          channelId: m.channelId?.toString(),
          createdAt: m.createdAt,
        }));
      }

      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/workspaces", authenticate, async (req: AuthRequest, res) => {
    try {
      const workspaces = await WorkspaceModel.find({
        $or: [{ ownerId: req.userId }, { memberIds: req.userId }],
      });

      const workspacesResponse = workspaces.map((w) => ({
        _id: w._id.toString(),
        name: w.name,
        description: w.description,
        ownerId: w.ownerId.toString(),
        memberIds: w.memberIds.map((id) => id.toString()),
        avatar: w.avatar,
        createdAt: w.createdAt,
      }));

      res.json(workspacesResponse);
    } catch (error) {
      console.error("Get workspaces error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users", authenticate, async (req: AuthRequest, res) => {
    try {
      const users = await UserModel.find({
        _id: { $ne: req.userId },
      }).select("_id username email avatar status");

      const usersResponse = users.map((u) => ({
        _id: u._id.toString(),
        username: u.username || u.email?.split("@")[0] || "User",
        email: u.email,
        avatar: u.avatar,
        status: u.status,
      }));

      res.json(usersResponse);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/workspace-members/:workspaceId", authenticate, async (req: AuthRequest, res) => {
    try {
      const { workspaceId } = req.params;

      const workspace = await WorkspaceModel.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      const users = await UserModel.find({
        _id: { $in: workspace.memberIds, $ne: req.userId },
      }).select("_id username email avatar status");

      const usersResponse = users.map((u) => ({
        _id: u._id.toString(),
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        status: u.status,
      }));

      res.json(usersResponse);
    } catch (error) {
      console.error("Get workspace members error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/workspaces", authenticate, async (req: AuthRequest, res) => {
    try {
      const { name, description } = req.body;

      const workspace = await WorkspaceModel.create({
        name,
        description,
        ownerId: req.userId,
        memberIds: [req.userId],
      });

      const general = await ChannelModel.create({
        name: "general",
        description: "General discussion",
        workspaceId: workspace._id,
        isPrivate: false,
        memberIds: [req.userId],
      });

      res.json({
        _id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description,
        ownerId: workspace.ownerId.toString(),
        memberIds: workspace.memberIds.map((id) => id.toString()),
        avatar: workspace.avatar,
        createdAt: workspace.createdAt,
      });
    } catch (error) {
      console.error("Create workspace error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/channels/:workspaceId", authenticate, async (req: AuthRequest, res) => {
    try {
      const { workspaceId } = req.params;

      const channels = await ChannelModel.find({
        workspaceId,
        $or: [{ isPrivate: false }, { memberIds: req.userId }],
      });

      const channelsResponse = channels.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        description: c.description,
        workspaceId: c.workspaceId.toString(),
        isPrivate: c.isPrivate,
        memberIds: c.memberIds.map((id) => id.toString()),
        createdAt: c.createdAt,
      }));

      res.json(channelsResponse);
    } catch (error) {
      console.error("Get channels error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/channels", authenticate, async (req: AuthRequest, res) => {
    try {
      const { name, description, isPrivate, workspaceId } = req.body;

      const channel = await ChannelModel.create({
        name,
        description,
        workspaceId,
        isPrivate,
        memberIds: [req.userId],
      });

      res.json({
        _id: channel._id.toString(),
        name: channel.name,
        description: channel.description,
        workspaceId: channel.workspaceId.toString(),
        isPrivate: channel.isPrivate,
        memberIds: channel.memberIds.map((id) => id.toString()),
        createdAt: channel.createdAt,
      });
    } catch (error) {
      console.error("Create channel error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages/:channelId", authenticate, async (req: AuthRequest, res) => {
    try {
      const { channelId } = req.params;

      const messages = await MessageModel.find({ channelId }).sort({ createdAt: 1 }).limit(100);

      const messagesResponse = messages.map((m) => ({
        _id: m._id.toString(),
        content: m.content,
        authorId: m.authorId.toString(),
        channelId: m.channelId?.toString(),
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }));

      res.json(messagesResponse);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/messages", authenticate, async (req: AuthRequest, res) => {
    try {
      const { content, channelId, directMessageId } = req.body;

      const message = await MessageModel.create({
        content,
        authorId: req.userId,
        channelId,
        directMessageId,
      });

      const messageResponse = {
        _id: message._id.toString(),
        content: message.content,
        authorId: message.authorId.toString(),
        channelId: message.channelId?.toString(),
        directMessageId: message.directMessageId?.toString(),
        createdAt: message.createdAt,
      };

      if (channelId) {
        io.to(`channel:${channelId}`).emit("new_message", messageResponse);
      }

      res.json(messageResponse);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/direct-messages/:workspaceId", authenticate, async (req: AuthRequest, res) => {
    try {
      const { workspaceId } = req.params;

      const dms = await DirectMessageModel.find({
        workspaceId,
        participantIds: req.userId,
      });

      const dmsWithUsers = await Promise.all(
        dms.map(async (dm) => {
          const participants = await UserModel.find({
            _id: { $in: dm.participantIds },
          });

          const participantsData = participants.map((p) => ({
            _id: p._id.toString(),
            username: p.username,
            email: p.email,
            avatar: p.avatar,
            status: p.status,
          }));

          return {
            _id: dm._id.toString(),
            participantIds: dm.participantIds.map((id) => id.toString()),
            participants: participantsData,
            workspaceId: dm.workspaceId.toString(),
            name: dm.name,
            isGroupChat: dm.isGroupChat,
            createdAt: dm.createdAt,
          };
        })
      );

      res.json(dmsWithUsers);
    } catch (error) {
      console.error("Get DMs error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/direct-messages", authenticate, async (req: AuthRequest, res) => {
    try {
      const { workspaceId, userIds, name } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "At least one user is required" });
      }

      const allParticipantIds = Array.from(new Set([req.userId, ...userIds]));
      const isGroupChat = allParticipantIds.length > 2;

      const existingDM = await DirectMessageModel.findOne({
        workspaceId,
        participantIds: { $all: allParticipantIds, $size: allParticipantIds.length },
      });

      if (existingDM && !isGroupChat) {
        const participants = await UserModel.find({
          _id: { $in: existingDM.participantIds },
        });

        return res.json({
          _id: existingDM._id.toString(),
          participantIds: existingDM.participantIds.map((id) => id.toString()),
          participants: participants.map((p) => ({
            _id: p._id.toString(),
            username: p.username,
            email: p.email,
            avatar: p.avatar,
            status: p.status,
          })),
          workspaceId: existingDM.workspaceId.toString(),
          name: existingDM.name,
          isGroupChat: existingDM.isGroupChat,
          createdAt: existingDM.createdAt,
        });
      }

      const dm = await DirectMessageModel.create({
        workspaceId,
        participantIds: allParticipantIds,
        name: isGroupChat ? name : undefined,
        isGroupChat,
      });

      const participants = await UserModel.find({
        _id: { $in: dm.participantIds },
      });

      res.json({
        _id: dm._id.toString(),
        participantIds: dm.participantIds.map((id) => id.toString()),
        participants: participants.map((p) => ({
          _id: p._id.toString(),
          username: p.username,
          email: p.email,
          avatar: p.avatar,
          status: p.status,
        })),
        workspaceId: dm.workspaceId.toString(),
        name: dm.name,
        isGroupChat: dm.isGroupChat,
        createdAt: dm.createdAt,
      });
    } catch (error) {
      console.error("Create DM error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/direct-messages/:id/participants", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { userIds, name } = req.body;

      const dm = await DirectMessageModel.findById(id);
      if (!dm) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (!dm.participantIds.some((pid) => pid.toString() === req.userId)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const newParticipantIds = Array.from(new Set([...dm.participantIds.map((id) => id.toString()), ...userIds]));
      const isGroupChat = newParticipantIds.length > 2;

      dm.participantIds = newParticipantIds.map((id) => new mongoose.Types.ObjectId(id));
      dm.isGroupChat = isGroupChat;
      if (name && isGroupChat) {
        dm.name = name;
      }

      await dm.save();

      const participants = await UserModel.find({
        _id: { $in: dm.participantIds },
      });

      res.json({
        _id: dm._id.toString(),
        participantIds: dm.participantIds.map((id) => id.toString()),
        participants: participants.map((p) => ({
          _id: p._id.toString(),
          username: p.username,
          email: p.email,
          avatar: p.avatar,
          status: p.status,
        })),
        workspaceId: dm.workspaceId.toString(),
        name: dm.name,
        isGroupChat: dm.isGroupChat,
        createdAt: dm.createdAt,
      });
    } catch (error) {
      console.error("Add participants error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/direct-messages/:id/messages", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const dm = await DirectMessageModel.findById(id);
      if (!dm) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (!dm.participantIds.some((pid) => pid.toString() === req.userId)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const messages = await MessageModel.find({ directMessageId: id })
        .sort({ createdAt: 1 })
        .limit(100);

      const messagesResponse = messages.map((m) => ({
        _id: m._id.toString(),
        content: m.content,
        authorId: m.authorId.toString(),
        directMessageId: m.directMessageId?.toString(),
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }));

      res.json(messagesResponse);
    } catch (error) {
      console.error("Get DM messages error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_channel", (channelId: string) => {
      socket.join(`channel:${channelId}`);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });

    socket.on("leave_channel", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
      console.log(`Socket ${socket.id} left channel ${channelId}`);
    });

    socket.on("webrtc_offer", ({ to, offer }) => {
      io.to(to).emit("webrtc_offer", { from: socket.id, offer });
    });

    socket.on("webrtc_answer", ({ to, answer }) => {
      io.to(to).emit("webrtc_answer", { from: socket.id, answer });
    });

    socket.on("webrtc_ice_candidate", ({ to, candidate }) => {
      io.to(to).emit("webrtc_ice_candidate", { from: socket.id, candidate });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return httpServer;
}
