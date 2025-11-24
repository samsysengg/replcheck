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
- **Fixed critical chat navigation bug**: Added `!activeDmId` check to auto-select logic so channels don't override active DMs
- **Redesigned sidebar navigation**: Replaced collapsible sections with clean toggled tabs for "Channels" and "Direct Messages"
- **Removed workspace label**: Simplified header by removing workspace name selector for cleaner UI
- **Enhanced profile display**: Current logged-in username now prominently displayed in profile section at bottom of sidebar
- **Fixed message routing issue**: Messages now correctly post to 1-on-1 chats instead of being routed to general channel
- **Improved chat creation flow**: New chats now properly navigate to chat window with correct message display
- Fixed DM creation and navigation: Cache now updates immediately with new DM so it appears in sidebar
- Fixed "Start Chat" dialog not opening chat window: Added optimistic cache update for new DMs
- Fixed 401 (Unauthorized) errors when fetching DM message counts: Now uses proper getAuthToken() auth helper instead of direct localStorage access
- Chat creation flow now works end-to-end: Create room → Add 2 users → Navigate to chat window
- Fixed MessageView crash when displaying user avatars: Added fallback for undefined usernames in avatar display
- Users with missing username fields now use email local part as fallback in message author names and avatars
- Fixed ChannelSidebar crash when filtering DMs: Added defensive check for undefined usernames before .toLowerCase() call
- Users with missing username fields now use email local part as fallback display name during search
- Fixed login endpoint error (500 - "Illegal arguments: string, undefined"): Added defensive check to verify password exists in database before bcrypt comparison
- Users with missing password fields in database now get proper "Invalid credentials" message instead of server error
- Fixed chat navigation mutation: Corrected TanStack Query v5 mutation pattern - data flows from mutationFn directly to mutateAsync(), not from onSuccess callback
- Now properly navigates to chat screen when clicking "Start Chat" and selecting a user
- Fixed 502 Bad Gateway transient errors with proper mutation state handling
- Fixed UI layout to fill entire browser window: removed h-screen from nested MessageView, now uses flex-1 for proper responsiveness
- Added flex-shrink-0 to MessageView header and input footer to prevent height collapse
- Made MessageView fully responsive with proper overflow handling (h-full, w-full, overflow-hidden)
- Fixed ScrollArea width to fill container (w-full) instead of adding px padding which could cause overflow
- UI now properly fits within window height and width, fully responsive to device size
- Fixed SearchDialog query parameter passing - now properly uses URLSearchParams instead of stringifying objects in URL path
- The global search (Cmd+K / Ctrl+K) now correctly finds all users including partial usernames
- Fixed `/api/users` endpoint to show user emails as fallback when username is missing
- Implemented smart chat pinning: chats with message history auto-pin to sidebar
- Updated NewChatDialog with search functionality to find users by name/email
- Added message count tracking for automatic chat pinning when conversation starts
- Enhanced user discovery: can now search and message any registered user
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
