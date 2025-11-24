# TeamTalk - Real-Time Collaboration Platform

## Overview
TeamTalk is a production-ready, Teams-like collaboration application designed for real-time messaging, video calls, and team workspace management. It aims to provide a scalable and modern communication platform.

## User Preferences
- User wants video calling with friends
- Live deployment to production (Render)
- MongoDB for data persistence
- Real Teams-like experience
- WhatsApp-like mobile UI with responsive design
- Smart sidebar with channels/DMs toggle and pinning

## System Architecture

### UI/UX Design
- **Layout**: Two-column responsive design with sidebar + chat view
- **Sidebar Features**:
  - Toggle between "Channels" and "Direct Messages" tabs
  - Search functionality for channels and conversations
  - Smart pinning: Conversations with message history appear at top
  - User profile section at bottom with avatar, username, and status
  - Create channel/chat buttons for quick access
- **Header**: Shows active channel/DM name, search button, user profile (desktop), logout
- **Chat View**: Full-width message area with independent scrolling, fixed input at bottom
- **Responsive**: Mobile-first design with proper scaling on all devices

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

## Recent Changes

**November 24, 2025 (Latest - Sidebar Restored with Smart Pinning)**
- **Restored sidebar**: Two-column layout with channels/DMs toggle
- **Channels tab**: View and create channels, search functionality
- **Direct Messages tab**: 
  - **Pinned section**: Conversations with message history appear first
  - **Conversations section**: Empty or unpinned chats below
  - **Create button**: Quick access to start new conversations
- **Search**: Filter channels or conversations within sidebar
- **User profile**: Bottom of sidebar shows user avatar, username, and status
- **Header optimization**: Shows active conversation, search button, user info (desktop)
- **Full responsive**: Layout works on all screen sizes with proper overflow handling

**Previous - Real-time Sync & Mobile UI**
- Implemented fully responsive mobile-first design
- Fixed viewport height management with h-screen/w-screen
- Implemented proper scrolling architecture (chat scrolls, input fixed)
- Added responsive typography and spacing
- Real-time DM synchronization with Socket.io
- WhatsApp-like UI design

## Deployment

### Production Deployment to Render

TeamTalk is fully configured for production deployment on Render.com:

**Deployment Files:**
- `render.yaml` - Render deployment configuration
- `RENDER_DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment guide
- `MONGODB_ATLAS_SETUP.md` - MongoDB Atlas configuration instructions
- `DEPLOYMENT_QUICK_START.md` - Fast 10-minute deployment reference

**Quick Start:**
1. Create MongoDB Atlas free cluster
2. Get MongoDB connection string
3. Push code to GitHub
4. Connect GitHub to Render
5. Add MONGO_URI environment variable
6. Deploy with auto-deploy enabled

**Features:**
✅ Automatic builds on GitHub push
✅ Environment variables auto-generated
✅ Health check endpoint enabled
✅ CORS configured for Render domains (.render.app, .onrender.com)
✅ Production-ready build process
✅ Socket.io support on Render

## Performance Optimizations
- Database connection pooling
- WebSocket connection efficiency
- React component memoization for expensive renders
- Message pagination for large chat histories
- Database query indexing
- Efficient state management with TanStack Query

## Next Steps (Post-MVP)
- File upload and sharing
- Screen sharing in video calls
- Message reactions and threads
- User search and invitations (partial implementation done)
- Notification system
- Admin dashboard
- Message search functionality
- Dark mode toggle persistence
