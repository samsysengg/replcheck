# TeamTalk - Real-Time Collaboration Platform

## Overview
TeamTalk is a production-ready, Teams-like collaboration application designed for real-time messaging, video calls, and team workspace management. It aims to provide a scalable and modern communication platform.

## User Preferences
- User wants video calling with friends
- Live deployment to production (Replit)
- MongoDB for data persistence
- Real Teams-like experience

## System Architecture

### UI/UX Decisions
The application follows Microsoft Fluent Design principles, featuring a clean, professional color scheme, consistent spacing and typography (Inter font family), and a responsive three-column layout. It incorporates a subtle elevation system for interactions and supports dark mode. Recent updates focused on a mobile-first, responsive design resembling WhatsApp, with a full-width chat view, optimized header, and streamlined navigation.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query v5 for state management, Socket.io-client for real-time communication, SimplePeer for WebRTC video calls, Tailwind CSS with Shadcn UI for styling, and React Hook Form with Zod for forms.
- **Backend**: Node.js with Express, MongoDB with Mongoose ODM, JWT-based authentication with bcrypt, Socket.io for WebSocket server, and security measures like Helmet, CORS, and rate limiting.
- **Core Functionality**: Includes user authentication, workspace management (creation, member management, channels), real-time messaging (channel-based, DMs, message history), and WebRTC-based video calling with multiple participant support. User presence (online/away/busy/offline) is also tracked in real-time.
- **System Design**: Features a structured project layout with separate client, server, and shared directories. WebSocket events handle real-time interactions for messaging and WebRTC signaling.

### Feature Specifications
- **Authentication**: JWT tokens, bcrypt password hashing, protected routes.
- **Workspace Management**: Creation, team member management, workspace-specific channels and DMs.
- **Messaging**: Channel and direct messages with live updates and history.
- **Video Calling**: Peer-to-peer WebRTC calls with audio/video controls.
- **User Presence**: Real-time status updates and visual indicators.
- **Database Schema**: Collections for users, workspaces, channels, messages, direct messages, and calls.
- **API Endpoints**: Comprehensive set of RESTful APIs for authentication, workspaces, channels, and messages.
- **Security**: JWT tokens, bcrypt, rate limiting, CORS, Helmet, and input validation with Zod and express-validator.

## External Dependencies
- **Database**: MongoDB (with Mongoose ODM)
- **Real-time Communication**: Socket.io
- **WebRTC**: SimplePeer
- **Deployment**: Render (for production deployment)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI