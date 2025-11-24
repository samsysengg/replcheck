import { useState } from "react";
import { Hash, Lock, Plus, Search, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Channel, DirectMessage, User, Workspace } from "@shared/schema";

interface ExtendedDirectMessage extends DirectMessage {
  participants?: User[];
  name?: string;
  isGroupChat: boolean;
}

interface ChannelSidebarProps {
  workspace: Workspace | null;
  channels: Channel[];
  directMessages: ExtendedDirectMessage[];
  activeChannelId: string | null;
  activeDmId: string | null;
  onChannelSelect: (channelId: string) => void;
  onDmSelect: (dmId: string) => void;
  onCreateChannel: () => void;
  onNewChat: () => void;
  currentUser: User | null;
  dmMessageCounts?: Map<string, number>;
}

export function ChannelSidebar({
  workspace,
  channels,
  directMessages,
  activeChannelId,
  activeDmId,
  onChannelSelect,
  onDmSelect,
  onCreateChannel,
  onNewChat,
  currentUser,
  dmMessageCounts = new Map(),
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"channels" | "dms">("channels");

  if (!currentUser) {
    return null;
  }

  const userInitials = currentUser.username?.substring(0, 2).toUpperCase() || "U";

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDms = directMessages.filter((dm) => {
    if (dm.isGroupChat && dm.name) {
      return dm.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (!dm.participants || dm.participants.length === 0) {
      return false;
    }
    const otherParticipants = dm.participants.filter((p) => p._id !== currentUser._id);
    return otherParticipants.some((p) => {
      const displayName = p.username || (p.email ? p.email.split("@")[0] : "");
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  // Separate pinned chats (with message history) from unpinned ones
  const pinnedDms = filteredDms.filter((dm) => (dmMessageCounts.get(dm._id) || 0) > 0);
  const unpinnedDms = filteredDms.filter((dm) => (dmMessageCounts.get(dm._id) || 0) === 0);

  return (
    <div className="flex flex-col h-screen w-72 bg-sidebar border-r border-sidebar-border">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "channels" | "dms")} className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b border-sidebar-border p-0 bg-sidebar h-auto">
          <TabsTrigger value="channels" className="flex-1 rounded-none" data-testid="tab-channels">
            Channels
          </TabsTrigger>
          <TabsTrigger value="dms" className="flex-1 rounded-none" data-testid="tab-dms">
            Direct Messages
          </TabsTrigger>
        </TabsList>

        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={activeTab === "channels" ? "Search channels..." : "Search conversations..."}
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-channels"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <TabsContent value="channels" className="space-y-0.5 m-0">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase">Channels</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onCreateChannel}
                data-testid="button-create-channel"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {filteredChannels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onChannelSelect(channel._id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover-elevate ${
                  activeChannelId === channel._id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80"
                }`}
                data-testid={`button-channel-${channel._id}`}
              >
                {channel.isPrivate ? (
                  <Lock className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="truncate flex-1 text-left">{channel.name}</span>
              </button>
            ))}
            {filteredChannels.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-2">No channels found</p>
            )}
          </TabsContent>

          <TabsContent value="dms" className="space-y-3 m-0">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase">Conversations</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onNewChat}
                data-testid="button-new-chat"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {pinnedDms.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground px-2 py-1 font-semibold">Pinned</p>
                <div className="space-y-0.5">
                    {pinnedDms.map((dm) => {
                      const participants = dm.participants || [];
                      const otherParticipants = participants.filter((p) => p._id !== currentUser._id);
                      const displayName = dm.isGroupChat && dm.name
                        ? dm.name
                        : otherParticipants.length > 0
                        ? otherParticipants.map((p) => p.username || (p.email ? p.email.split("@")[0] : "User")).join(", ")
                        : "Direct Message";
                      
                      const avatarUser = otherParticipants.length > 0 ? otherParticipants[0] : null;

                      return (
                        <button
                          key={dm._id}
                          onClick={() => onDmSelect(dm._id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover-elevate ${
                            activeDmId === dm._id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80"
                          }`}
                          data-testid={`button-dm-${dm._id}`}
                        >
                          {dm.isGroupChat ? (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <Users className="w-3 h-3" />
                            </div>
                          ) : avatarUser ? (
                            <div className="relative">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={avatarUser.avatar} />
                                <AvatarFallback className="text-xs">
                                  {(avatarUser.username || (avatarUser.email ? avatarUser.email.split("@")[0] : "U")).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-sidebar ${
                                  avatarUser.status === "online"
                                    ? "bg-status-online"
                                    : avatarUser.status === "away"
                                    ? "bg-status-away"
                                    : avatarUser.status === "busy"
                                    ? "bg-status-busy"
                                    : "bg-status-offline"
                                }`}
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted" />
                          )}
                          <span className="truncate flex-1 text-left">{displayName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {unpinnedDms.length > 0 && (
                <div>
                  <div className="space-y-0.5">
                    {unpinnedDms.map((dm) => {
                      const participants = dm.participants || [];
                      const otherParticipants = participants.filter((p) => p._id !== currentUser._id);
                      const displayName = dm.isGroupChat && dm.name
                        ? dm.name
                        : otherParticipants.length > 0
                        ? otherParticipants.map((p) => p.username || (p.email ? p.email.split("@")[0] : "User")).join(", ")
                        : "Direct Message";
                      
                      const avatarUser = otherParticipants.length > 0 ? otherParticipants[0] : null;

                      return (
                        <button
                          key={dm._id}
                          onClick={() => onDmSelect(dm._id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover-elevate ${
                            activeDmId === dm._id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80"
                          }`}
                          data-testid={`button-dm-${dm._id}`}
                        >
                          {dm.isGroupChat ? (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <Users className="w-3 h-3" />
                            </div>
                          ) : avatarUser ? (
                            <div className="relative">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={avatarUser.avatar} />
                                <AvatarFallback className="text-xs">
                                  {(avatarUser.username || (avatarUser.email ? avatarUser.email.split("@")[0] : "U")).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-sidebar ${
                                  avatarUser.status === "online"
                                    ? "bg-status-online"
                                    : avatarUser.status === "away"
                                    ? "bg-status-away"
                                    : avatarUser.status === "busy"
                                    ? "bg-status-busy"
                                    : "bg-status-offline"
                                }`}
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted" />
                          )}
                          <span className="truncate flex-1 text-left">{displayName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {pinnedDms.length === 0 && unpinnedDms.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-2">Start a chat to see it here</p>
              )}
            </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="px-3 py-3 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover-elevate">
          <div className="relative">
            <Avatar className="w-9 h-9">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sidebar bg-status-${currentUser?.status || "offline"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser?.username || currentUser?.email?.split("@")[0] || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser?.status || "offline"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
