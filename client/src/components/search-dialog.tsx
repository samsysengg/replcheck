import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Hash, MessageSquare } from "lucide-react";

interface SearchResult {
  users?: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    status: string;
  }>;
  channels?: Array<{
    _id: string;
    name: string;
    description?: string;
    workspaceId: string;
  }>;
  messages?: Array<{
    _id: string;
    content: string;
    authorId: string;
    channelId?: string;
    createdAt: string;
  }>;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser?: (userId: string) => void;
  onSelectChannel?: (channelId: string) => void;
}

export function SearchDialog({
  open,
  onOpenChange,
  onSelectUser,
  onSelectChannel,
}: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: results, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", { q: query, type: activeTab }],
    enabled: query.length >= 2,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px]" data-testid="dialog-search">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, channels, and messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
            autoFocus
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="channels" data-testid="tab-channels">Channels</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            {query.length < 2 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Type at least 2 characters to search</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Searching...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <TabsContent value="all" className="space-y-4 mt-0">
                  {results?.users && results.users.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Users
                      </h3>
                      <div className="space-y-2">
                        {results.users.map((user) => (
                          <Button
                            key={user._id}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-auto py-3"
                            onClick={() => {
                              onSelectUser?.(user._id);
                              onOpenChange(false);
                            }}
                            data-testid={`button-user-${user._id}`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{user.username}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <Badge variant="outline" className="ml-auto">
                              {user.status}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results?.channels && results.channels.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Channels
                      </h3>
                      <div className="space-y-2">
                        {results.channels.map((channel) => (
                          <Button
                            key={channel._id}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-auto py-3"
                            onClick={() => {
                              onSelectChannel?.(channel._id);
                              onOpenChange(false);
                            }}
                            data-testid={`button-channel-${channel._id}`}
                          >
                            <Hash className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{channel.name}</span>
                              {channel.description && (
                                <span className="text-xs text-muted-foreground">
                                  {channel.description}
                                </span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results?.messages && results.messages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Messages
                      </h3>
                      <div className="space-y-2">
                        {results.messages.map((message) => (
                          <div
                            key={message._id}
                            className="p-3 rounded-md bg-muted hover-elevate"
                            data-testid={`message-result-${message._id}`}
                          >
                            <p className="text-sm line-clamp-2">{message.content}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!results?.users?.length &&
                    !results?.channels?.length &&
                    !results?.messages?.length) && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No results found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="space-y-2 mt-0">
                  {results?.users && results.users.length > 0 ? (
                    results.users.map((user) => (
                      <Button
                        key={user._id}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={() => {
                          onSelectUser?.(user._id);
                          onOpenChange(false);
                        }}
                        data-testid={`button-user-${user._id}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{user.username}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {user.status}
                        </Badge>
                      </Button>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground py-8">
                      <p>No users found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="channels" className="space-y-2 mt-0">
                  {results?.channels && results.channels.length > 0 ? (
                    results.channels.map((channel) => (
                      <Button
                        key={channel._id}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={() => {
                          onSelectChannel?.(channel._id);
                          onOpenChange(false);
                        }}
                        data-testid={`button-channel-${channel._id}`}
                      >
                        <Hash className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{channel.name}</span>
                          {channel.description && (
                            <span className="text-xs text-muted-foreground">
                              {channel.description}
                            </span>
                          )}
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground py-8">
                      <p>No channels found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="messages" className="space-y-2 mt-0">
                  {results?.messages && results.messages.length > 0 ? (
                    results.messages.map((message) => (
                      <div
                        key={message._id}
                        className="p-3 rounded-md bg-muted hover-elevate"
                        data-testid={`message-result-${message._id}`}
                      >
                        <p className="text-sm line-clamp-2">{message.content}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground py-8">
                      <p>No messages found</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
