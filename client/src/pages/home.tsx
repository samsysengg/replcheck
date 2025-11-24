import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { ChannelSidebar } from "@/components/channel-sidebar";
import { MessageView } from "@/components/message-view";
import { VideoCall } from "@/components/video-call";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { CreateChannelDialog } from "@/components/create-channel-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { AddParticipantsDialog } from "@/components/add-participants-dialog";
import { NewChatDialog } from "@/components/new-chat-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth";
import { Workspace, Channel, Message, DirectMessage, User } from "@shared/schema";
import { Search, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { startCall, endCall, localStream, remoteStreams } = useWebRTC();
  const { toast } = useToast();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeDmId, setActiveDmId] = useState<string | null>(null);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addParticipantsOpen, setAddParticipantsOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [inCall, setInCall] = useState(false);

  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["/api/channels", activeWorkspaceId],
    enabled: !!activeWorkspaceId,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeChannelId],
    enabled: !!activeChannelId && !activeDmId,
  });

  interface ExtendedDirectMessage extends DirectMessage {
    participants?: User[];
    name?: string;
    isGroupChat: boolean;
  }

  const { data: directMessages = [] } = useQuery<ExtendedDirectMessage[]>({
    queryKey: ["/api/direct-messages", activeWorkspaceId],
    enabled: !!activeWorkspaceId,
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: dmMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/direct-messages", activeDmId, "messages"],
    enabled: !!activeDmId,
  });

  const [dmMessageCounts, setDmMessageCounts] = useState<Map<string, number>>(new Map());

  // Fetch and track message counts for each DM
  useEffect(() => {
    const fetchMessageCounts = async () => {
      const counts = new Map<string, number>();
      const token = getAuthToken();
      
      for (const dm of directMessages) {
        try {
          const response = await fetch(
            `/api/direct-messages/${dm._id}/messages`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );
          
          if (response.ok) {
            const messages = await response.json();
            counts.set(dm._id, Array.isArray(messages) ? messages.length : 0);
          }
        } catch (error) {
          counts.set(dm._id, 0);
        }
      }
      
      setDmMessageCounts(counts);
    };

    if (directMessages.length > 0) {
      fetchMessageCounts();
    }
  }, [directMessages]);

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiRequest("POST", "/api/workspaces", { ...data, ownerId: user?._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      setCreateWorkspaceOpen(false);
      toast({ title: "Success", description: "Workspace created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create workspace", variant: "destructive" });
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; isPrivate: boolean }) =>
      apiRequest("POST", "/api/channels", { ...data, workspaceId: activeWorkspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels", activeWorkspaceId] });
      setCreateChannelOpen(false);
      toast({ title: "Success", description: "Channel created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create channel", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/messages", {
        content,
        authorId: user?._id,
        channelId: activeChannelId,
        directMessageId: activeDmId,
      }),
    onSuccess: () => {
      if (activeChannelId) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", activeChannelId] });
      }
      if (activeDmId) {
        queryClient.invalidateQueries({ queryKey: ["/api/direct-messages", activeDmId, "messages"] });
      }
    },
  });

  const createDmMutation = useMutation({
    mutationFn: (data: { workspaceId: string; userIds: string[]; name?: string }) =>
      apiRequest("POST", "/api/direct-messages", data),
    onSuccess: (newDm: ExtendedDirectMessage) => {
      // Update the cache immediately with the new DM
      queryClient.setQueryData<ExtendedDirectMessage[]>(
        ["/api/direct-messages", activeWorkspaceId],
        (old) => {
          if (!old) return [newDm];
          const exists = old.some((dm) => dm._id === newDm._id);
          return exists ? old : [...old, newDm];
        }
      );
      toast({ title: "Success", description: "Chat created successfully" });
      // Also refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages", activeWorkspaceId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create chat", variant: "destructive" });
    },
  });

  const addParticipantsMutation = useMutation({
    mutationFn: (data: { dmId: string; userIds: string[]; name?: string }) =>
      apiRequest("POST", `/api/direct-messages/${data.dmId}/participants`, {
        userIds: data.userIds,
        name: data.name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages", activeWorkspaceId] });
      setAddParticipantsOpen(false);
      toast({ title: "Success", description: "People added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add people", variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      logout();
    },
  });

  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, activeWorkspaceId]);

  useEffect(() => {
    if (channels.length > 0 && !activeChannelId && activeWorkspaceId) {
      setActiveChannelId(channels[0]._id);
    }
  }, [channels, activeChannelId, activeWorkspaceId]);

  useEffect(() => {
    if (!socket || !activeChannelId) return;

    socket.emit("join_channel", activeChannelId);

    socket.on("new_message", (message: Message) => {
      queryClient.setQueryData<Message[]>(["/api/messages", activeChannelId], (old) => {
        if (!old) return [message];
        const exists = old.some((m) => m._id === message._id);
        return exists ? old : [...old, message];
      });
    });

    return () => {
      socket.emit("leave_channel", activeChannelId);
      socket.off("new_message");
    };
  }, [socket, activeChannelId]);

  const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId) || null;
  const activeChannel = channels.find((c) => c._id === activeChannelId) || null;
  const activeDm = directMessages.find((dm) => dm._id === activeDmId) || null;

  const usersMap = new Map<string, User>();
  if (user) {
    usersMap.set(user._id, user);
  }
  directMessages.forEach((dm) => {
    if (dm.participants && Array.isArray(dm.participants)) {
      dm.participants.forEach((participant) => {
        usersMap.set(participant._id, participant);
      });
    }
  });

  const handleSelectUser = async (userId: string) => {
    if (!activeWorkspaceId) return;
    
    const result = await createDmMutation.mutateAsync({
      workspaceId: activeWorkspaceId,
      userIds: [userId],
    });
    
    if (result) {
      setActiveDmId(result._id);
      setActiveChannelId(null);
    }
  };

  const handleAddParticipants = (userIds: string[], groupName?: string) => {
    if (!activeDmId) return;
    
    addParticipantsMutation.mutate({
      dmId: activeDmId,
      userIds,
      name: groupName,
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleStartVideoCall = async () => {
    try {
      await startCall([]);
      setInCall(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access camera and microphone",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCall = () => {
    endCall();
    setInCall(false);
  };

  if (!user) {
    return null;
  }

  if (inCall) {
    return (
      <VideoCall
        participants={[user]}
        currentUser={user}
        onLeaveCall={handleLeaveCall}
        localStream={localStream}
        remoteStreams={remoteStreams}
      />
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card flex-shrink-0">
        <h1 className="text-lg font-semibold">TeamTalk</h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSearchOpen(true)}
            data-testid="button-search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={setActiveWorkspaceId}
          onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
        />
        <ChannelSidebar
          workspace={activeWorkspace}
          channels={channels}
          directMessages={directMessages}
          activeChannelId={activeChannelId}
          activeDmId={activeDmId}
          onChannelSelect={(id) => {
            setActiveChannelId(id);
            setActiveDmId(null);
          }}
          onDmSelect={(id) => {
            setActiveDmId(id);
            setActiveChannelId(null);
          }}
          onCreateChannel={() => setCreateChannelOpen(true)}
          onNewChat={() => setNewChatOpen(true)}
          currentUser={user}
          dmMessageCounts={dmMessageCounts}
        />
        <MessageView
          channel={activeChannel}
          directMessage={activeDm}
          messages={activeDm ? dmMessages : messages}
          users={usersMap}
          currentUser={user}
          onSendMessage={(content) => sendMessageMutation.mutate(content)}
          onStartVideoCall={handleStartVideoCall}
          onStartVoiceCall={handleStartVideoCall}
          onAddParticipants={activeDm ? () => setAddParticipantsOpen(true) : undefined}
        />
        <CreateWorkspaceDialog
          open={createWorkspaceOpen}
          onOpenChange={setCreateWorkspaceOpen}
          onSubmit={(data) => createWorkspaceMutation.mutate(data)}
          isLoading={createWorkspaceMutation.isPending}
        />
        <CreateChannelDialog
          open={createChannelOpen}
          onOpenChange={setCreateChannelOpen}
          onSubmit={(data) => createChannelMutation.mutate(data)}
          isLoading={createChannelMutation.isPending}
        />
        <SearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSelectUser={handleSelectUser}
          onSelectChannel={(channelId) => {
            setActiveChannelId(channelId);
            setActiveDmId(null);
          }}
        />
        <AddParticipantsDialog
          open={addParticipantsOpen}
          onOpenChange={setAddParticipantsOpen}
          onSubmit={handleAddParticipants}
          isLoading={addParticipantsMutation.isPending}
          currentParticipantIds={activeDm?.participantIds || []}
          isGroupChat={activeDm?.isGroupChat || false}
        />
        <NewChatDialog
          open={newChatOpen}
          onOpenChange={setNewChatOpen}
          users={allUsers}
          currentUserId={user._id}
          onSelectUser={handleSelectUser}
          isLoading={createDmMutation.isPending}
        />
      </div>
    </div>
  );
}
