import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const allowedOrigins = process.env.NODE_ENV === "production" 
    ? [process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://*.replit.app"]
    : ["http://localhost:5000"];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
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

        const user = await UserModel.findOne({ email });
        if (!user) {
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
          const otherUserId = dm.participantIds.find((id) => id.toString() !== req.userId);
          const otherUser = await UserModel.findById(otherUserId);

          return {
            dm: {
              _id: dm._id.toString(),
              participantIds: dm.participantIds.map((id) => id.toString()),
              workspaceId: dm.workspaceId.toString(),
              createdAt: dm.createdAt,
            },
            otherUser: otherUser
              ? {
                  _id: otherUser._id.toString(),
                  username: otherUser.username,
                  email: otherUser.email,
                  avatar: otherUser.avatar,
                  status: otherUser.status,
                  createdAt: otherUser.createdAt,
                }
              : null,
          };
        })
      );

      res.json(dmsWithUsers.filter((dm) => dm.otherUser !== null));
    } catch (error) {
      console.error("Get DMs error:", error);
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
