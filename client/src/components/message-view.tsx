import { useState, useRef, useEffect } from "react";
import { Hash, Lock, Video, Phone, Users, MoreVertical, Smile, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Channel, Message, User } from "@shared/schema";
import { format } from "date-fns";

interface MessageViewProps {
  channel: Channel | null;
  messages: Message[];
  users: Map<string, User>;
  currentUser: User | null;
  onSendMessage: (content: string) => void;
  onStartVideoCall: () => void;
  onStartVoiceCall: () => void;
}

export function MessageView({
  channel,
  messages,
  users,
  currentUser,
  onSendMessage,
  onStartVideoCall,
  onStartVoiceCall,
}: MessageViewProps) {
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!channel || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen flex-1 bg-background">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Hash className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No channel selected</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Select a channel from the sidebar to start chatting with your team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen flex-1 bg-background">
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          {channel.isPrivate ? (
            <Lock className="w-5 h-5 text-foreground/70" />
          ) : (
            <Hash className="w-5 h-5 text-foreground/70" />
          )}
          <div>
            <h2 className="font-semibold text-foreground">{channel.name}</h2>
            {channel.description && (
              <p className="text-xs text-muted-foreground">{channel.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onStartVoiceCall}
            data-testid="button-start-voice-call"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onStartVideoCall}
            data-testid="button-start-video-call"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-channel-members">
            <Users className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-channel-settings">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const author = users.get(message.authorId);
              const showAvatar =
                index === 0 ||
                messages[index - 1].authorId !== message.authorId ||
                new Date(message.createdAt).getTime() -
                  new Date(messages[index - 1].createdAt).getTime() >
                  300000;

              return (
                <div
                  key={message._id}
                  className={`flex gap-3 group ${showAvatar ? "mt-4" : "mt-0.5"}`}
                  data-testid={`message-${message._id}`}
                >
                  <div className="w-9 flex-shrink-0">
                    {showAvatar && author && (
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={author.avatar} />
                        <AvatarFallback>
                          {author.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {showAvatar && author && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {author.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "h:mm a")}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-foreground break-words">{message.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-card rounded-lg border border-card-border p-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message #${channel.name}`}
              className="border-0 focus-visible:ring-0 p-0 text-sm bg-transparent"
              data-testid="input-message"
            />
            <div className="flex items-center gap-2 mt-2">
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="h-auto py-3"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
