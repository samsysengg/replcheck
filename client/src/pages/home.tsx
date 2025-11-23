import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { ChannelSidebar } from "@/components/channel-sidebar";
import { MessageView } from "@/components/message-view";
import { VideoCall } from "@/components/video-call";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { CreateChannelDialog } from "@/components/create-channel-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Workspace, Channel, Message, DirectMessage, User } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { startCall, endCall, localStream, remoteStreams } = useWebRTC();
  const { toast } = useToast();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeDmId, setActiveDmId] = useState<string | null>(null);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
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

  const { data: directMessages = [] } = useQuery<{ dm: DirectMessage; otherUser: User }[]>({
    queryKey: ["/api/direct-messages", activeWorkspaceId],
    enabled: !!activeWorkspaceId,
  });

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
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", activeChannelId] });
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

  const usersMap = new Map<string, User>();
  if (user) {
    usersMap.set(user._id, user);
  }

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
    <div className="flex h-screen overflow-hidden">
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceSelect={setActiveWorkspaceId}
        onCreateWorkspace={() => setCreateWorkspaceOpen(true)}
      />
      {user && (
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
          currentUser={user}
        />
      )}
      {user && (
        <MessageView
          channel={activeChannel}
          messages={messages}
          users={usersMap}
          currentUser={user}
          onSendMessage={(content) => sendMessageMutation.mutate(content)}
          onStartVideoCall={handleStartVideoCall}
          onStartVoiceCall={handleStartVideoCall}
        />
      )}
      {user && (
        <>
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
        </>
      )}
    </div>
  );
}
