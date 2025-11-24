import { useState } from "react";
import { Hash, Lock, Plus, Search, ChevronDown, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

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
    return otherParticipants.some((p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-screen w-72 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-lg text-sidebar-foreground truncate">
          {workspace?.name || "Select a workspace"}
        </h2>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search channels..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-channels"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          <Collapsible open={channelsOpen} onOpenChange={setChannelsOpen}>
            <div className="flex items-center justify-between px-2 py-1 hover-elevate rounded-md">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <ChevronDown className={`w-4 h-4 transition-transform ${channelsOpen ? "" : "-rotate-90"}`} />
                  <span>Channels</span>
                </button>
              </CollapsibleTrigger>
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
            <CollapsibleContent className="space-y-0.5 mt-1">
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
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={dmsOpen} onOpenChange={setDmsOpen}>
            <div className="flex items-center justify-between px-2 py-1 hover-elevate rounded-md mt-4">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <ChevronDown className={`w-4 h-4 transition-transform ${dmsOpen ? "" : "-rotate-90"}`} />
                  <span>Direct Messages</span>
                </button>
              </CollapsibleTrigger>
              <Button
                size="icon"
                variant="ghost"
                onClick={onNewChat}
                className="h-6 w-6"
                data-testid="button-new-chat"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <CollapsibleContent className="space-y-0.5 mt-1">
              {filteredDms.map((dm) => {
                const participants = dm.participants || [];
                const otherParticipants = participants.filter((p) => p._id !== currentUser._id);
                const displayName = dm.isGroupChat && dm.name
                  ? dm.name
                  : otherParticipants.length > 0
                  ? otherParticipants.map((p) => p.username).join(", ")
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
                            {avatarUser.username.substring(0, 2).toUpperCase()}
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
              {filteredDms.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-2">No direct messages</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover-elevate">
          <div className="relative">
            <Avatar className="w-9 h-9">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sidebar bg-status-${currentUser?.status || "offline"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser?.username || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser?.status || "offline"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
