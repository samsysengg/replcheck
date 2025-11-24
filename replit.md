# TeamTalk - Real-Time Collaboration Platform

## Overview
TeamTalk is a production-ready Teams-like collaboration application featuring real-time messaging, video calls, and team workspace management. Built with modern web technologies and designed for scalability.

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query v5 for server state
- **Real-time**: Socket.io-client for WebSocket connections
- **Video Calling**: SimplePeer for WebRTC peer connections
- **Styling**: Tailwind CSS with Shadcn UI components
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Real-time**: Socket.io for WebSocket server
- **Security**: Helmet, CORS, rate limiting, compression
- **Validation**: Express-validator for API input validation

## Features

### Core Functionality
1. **User Authentication**
   - Registration and login with JWT tokens
   - Secure password hashing with bcrypt
   - Protected routes and API endpoints

2. **Workspace Management**
   - Create and manage multiple workspaces
   - Team member management
   - Workspace-specific channels and DMs

3. **Real-time Messaging**
   - Channel-based communication
   - Direct messages between users
   - Live message updates via WebSocket
   - Message history persistence

4. **Video Calling**
   - WebRTC-based peer-to-peer video calls
   - Audio/video controls (mute, camera toggle)
   - Multiple participant support
   - Self-view with mirrored video

5. **User Presence**
   - Online/Away/Busy/Offline status
   - Real-time status updates
   - Visual indicators in UI

## Database Schema

### Collections
- **users**: User accounts with auth credentials and status
- **workspaces**: Team workspaces with ownership and members
- **channels**: Communication channels within workspaces
- **messages**: Chat messages in channels or DMs
- **directmessages**: Private conversation containers
- **calls**: Video/voice call metadata and participants

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace

### Channels
- `GET /api/channels/:workspaceId` - List channels in workspace
- `POST /api/channels` - Create new channel

### Messages
- `GET /api/messages/:channelId` - Get channel message history
- `POST /api/messages` - Send new message

### Direct Messages
- `GET /api/direct-messages/:workspaceId` - List DM conversations

## WebSocket Events

### Client → Server
- `join_channel` - Subscribe to channel updates
- `leave_channel` - Unsubscribe from channel
- `webrtc_offer` - Send WebRTC offer to peer
- `webrtc_answer` - Send WebRTC answer to peer
- `webrtc_ice_candidate` - Exchange ICE candidates

### Server → Client
- `new_message` - Receive new channel message
- `webrtc_offer` - Receive call offer from peer
- `webrtc_answer` - Receive call answer from peer
- `webrtc_ice_candidate` - Receive ICE candidate from peer

## Environment Variables

### Required
- `MONGO_URI` - MongoDB connection string (configured)
- `JWT_SECRET` - Secret key for JWT signing (configured)
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 5000)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Socket)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and config
│   │   ├── pages/          # Route pages
│   │   └── index.css       # Global styles
├── server/                 # Backend Express application
│   ├── middleware/         # Express middleware
│   ├── models.ts           # Mongoose models
│   ├── routes.ts           # API routes and Socket.io
│   ├── db.ts               # MongoDB connection
│   └── app.ts              # Express app setup
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Zod schemas and types
```

## Development Workflow

1. **Start Development Server**
   - The "Start application" workflow runs `npm run dev`
   - Frontend: Vite dev server on port 5000
   - Backend: Express server on port 5000
   - Hot reload enabled for both

2. **Database Connection**
   - Automatically connects to MongoDB on startup
   - Connection string from MONGO_URI env variable
   - Graceful error handling with process exit on failure

## Design System

Following Microsoft Fluent Design principles with:
- Clean, professional color scheme
- Consistent spacing and typography
- Inter font family throughout
- Responsive three-column layout
- Subtle elevation system for interactions
- Dark mode support

## Security Features

1. **Authentication**: JWT tokens with 7-day expiry
2. **Password Security**: Bcrypt hashing with salt rounds
3. **Rate Limiting**: Auth endpoints limited to 5 requests/15min
4. **CORS**: Configured for development/production
5. **Helmet**: Security headers and XSS protection
6. **Input Validation**: Zod schemas and express-validator

## Production Deployment

### Deployment to Replit
- Application is production-ready
- MongoDB Atlas database configured
- Environment variables set
- Security middleware enabled
- Ready to publish using Replit Deployments

### Performance Optimizations
- Gzip compression enabled
- Production build optimization
- Database query indexing
- WebSocket connection pooling
- Efficient React rendering with memoization

## Recent Changes

**November 24, 2025 (Latest)**
- Fixed SearchDialog query parameter passing - now properly uses URLSearchParams instead of stringifying objects in URL path
- The global search (Cmd+K / Ctrl+K) now correctly finds all users including alphaideaspace when searching for partial usernames
- Fixed `/api/users` endpoint to show user emails as fallback when username is missing (ensures all users display with meaningful names)
- Added `/api/users` endpoint to query all registered users in the database
- Implemented smart chat pinning: chats with message history auto-pin to sidebar
- Updated NewChatDialog with search functionality to find users by name/email
- Added message count tracking for automatic chat pinning when conversation starts
- Fixed workspace members query to fetch all users instead of just workspace members
- Enhanced user discovery: now can search and message any registered user
- Added defensive checks in NewChatDialog for missing user data (username, email)

**November 24, 2025**
- Added Render deployment configuration (render.yaml) with health check endpoint
- Implemented global search functionality (/api/search endpoint + SearchDialog component)
- Added logout button to header with backend endpoint to update user status
- Enhanced DirectMessage model to support group chats (isGroupChat, name fields)
- Implemented chat functionality:
  - POST /api/direct-messages - Create new DM or group chat
  - POST /api/direct-messages/:id/participants - Add people to existing chats
  - GET /api/direct-messages/:id/messages - Get DM message history
- Added AddParticipantsDialog component for adding users to chats
- Updated MessageView with audio/video call buttons for both channels and DMs
- Enhanced ChannelSidebar to display group chats with proper icons and naming
- Added comprehensive type safety with defensive checks for optional participants data

**November 23, 2025**
- Complete application built from scratch
- MongoDB integration with Mongoose models
- Real-time messaging with Socket.io
- WebRTC video calling implementation
- JWT authentication system
- Beautiful UI following design guidelines
- Production-ready deployment configuration

## User Preferences
- User wants video calling with friends
- Live deployment to production (Replit)
- MongoDB for data persistence
- Real Teams-like experience

## Next Steps (Post-MVP)
- File upload and sharing
- Screen sharing in video calls
- Message reactions and threads
- User search and invitations
- Notification system
- Admin dashboard
- Message search functionality
- Mobile responsive enhancements
