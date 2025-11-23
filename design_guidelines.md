# Design Guidelines: Teams-Like Collaboration Application

## Design Approach
**System Selected:** Fluent Design (Microsoft) with inspiration from Slack and Discord  
**Rationale:** Productivity-focused collaboration tools prioritize clarity, efficiency, and consistent patterns. Fluent Design provides robust component patterns for information-dense interfaces while maintaining modern aesthetics.

**Key Principles:**
- Information hierarchy over visual flair
- Instant recognizability of UI elements
- Efficient use of screen real estate
- Clear visual separation between functional zones

---

## Typography System

**Font Family:** Inter (primary), System UI (fallback)

**Hierarchy:**
- Page Titles: 24px, font-semibold
- Section Headers: 18px, font-semibold  
- Channel/Room Names: 16px, font-medium
- Body Text (Messages): 15px, font-normal
- Metadata (timestamps, user status): 13px, font-normal
- Small Labels: 12px, font-medium

**Line Height:** 1.5 for body text, 1.3 for headers

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Micro spacing (icons, buttons): 2, 3
- Component padding: 4, 6
- Section spacing: 8, 12
- Major layout gaps: 16

**Application Structure:**

Three-column layout (standard collaboration pattern):
- **Left Sidebar:** w-64, teams/workspaces list, navigation
- **Middle Sidebar:** w-72, channels/rooms/conversations list
- **Main Content:** flex-1, active conversation/call interface
- **Right Panel (contextual):** w-80, user info, thread details, files

All sidebars are fixed height (h-screen) with internal scrolling.

---

## Core Components

### Navigation & Sidebars

**Left Sidebar (Teams/Workspaces):**
- Workspace switcher at top (h-16)
- Stacked team icons (48px × 48px) with hover indicators
- "Add Workspace" button at bottom
- Internal scroll for 10+ teams

**Middle Sidebar (Channels):**
- Search bar at top (h-12, px-4)
- Collapsible sections: "Channels", "Direct Messages", "Threads"
- List items with icons, names, unread badges (h-9, px-3, rounded-md)
- "+" button to create new channels
- User status indicator at bottom (h-14)

### Message Interface

**Message Container:**
- Avatar (36px × 36px, rounded-full) on left
- Username (font-medium) + timestamp (text-sm, muted)
- Message content (px-3, py-2)
- Hover actions: reactions, reply, more options (right-aligned)
- Thread indicator for replies (text-sm with reply count)

**Message Input:**
- Fixed at bottom (h-auto, min-h-14)
- Rich text toolbar (formatting, emoji, attachments)
- @ mentions autocomplete dropdown
- File upload preview area
- "Send" button (right-aligned)

### Video Call Interface

**Active Call View:**
- Video grid layout (grid-cols-2 lg:grid-cols-3 for multiple participants)
- Self-view in corner (w-48, h-32, fixed positioning)
- Participant name overlays on video tiles
- Controls bar at bottom (fixed, h-20):
  - Microphone toggle
  - Camera toggle
  - Screen share button
  - Leave call (destructive action styling)
  - Participants list
  - Settings

**Pre-call/Waiting:**
- Centered preview (max-w-2xl)
- Device selection dropdowns
- Video/audio test indicators
- "Join Call" primary action button

### User Presence & Status

**Status Indicators:**
- 8px dot positioned absolute on avatar bottom-right
- Online, Away, Do Not Disturb, Offline states
- Typing indicators (3 animated dots)

### Modals & Overlays

**Channel Creation:**
- Centered modal (max-w-md)
- Form fields with clear labels
- Privacy toggle (Public/Private)
- Member invite section
- Action buttons (Cancel, Create)

**User Profile Panel:**
- Slides from right (w-96)
- Profile header with large avatar (96px)
- Tabbed sections: About, Files, Links
- Contact actions stacked vertically

---

## Component Patterns

### Cards & Containers
- Shared files: grid-cols-3, aspect-square thumbnails
- Meeting cards: rounded-lg, p-4, hover:shadow-md
- Notification cards: p-3, border-l-4 for priority indicator

### Lists
- Uniform item height (h-10 or h-12)
- Left-aligned content with right-aligned metadata
- Subtle hover states for interactivity
- Selected state with background treatment

### Buttons
- Primary actions: px-6, py-2.5, rounded-md, font-medium
- Secondary actions: border variant with same padding
- Icon-only buttons: p-2, rounded-md, 40px × 40px
- Destructive actions: distinct treatment for "Leave", "Delete"

### Input Fields
- Consistent height (h-10)
- Clear focus states with ring
- Inline validation messages
- Search inputs with icon prefix

---

## Responsive Behavior

**Desktop (lg and above):** Full three-column layout  
**Tablet (md):** Collapsible left sidebar, two-column view  
**Mobile (base):** Single-column, hamburger menu navigation, full-screen chat

---

## Animations

Use sparingly for functional feedback only:
- Sidebar expand/collapse: 200ms ease
- Message send: subtle scale feedback
- Typing indicators: pulsing animation
- Notification badges: gentle pop-in

No decorative animations. All transitions serve functional purposes.

---

## Images

**Profile Avatars:** User-uploaded photos, circular crop, 36px-96px sizes  
**Empty States:** Illustrative graphics for "No messages", "No channels" (max-w-xs, centered)  
**File Previews:** Thumbnails for images/documents in message threads

No hero images or marketing imagery - this is a functional application interface.