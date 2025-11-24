import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User } from "@shared/schema";
import { useState, useMemo } from "react";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  isLoading?: boolean;
}

export function NewChatDialog({
  open,
  onOpenChange,
  users,
  currentUserId,
  onSelectUser,
  isLoading = false,
}: NewChatDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const otherUsers = users.filter((u) => u._id !== currentUserId);
  
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return otherUsers;
    const query = searchQuery.toLowerCase();
    return otherUsers.filter((u) =>
      (u.username || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query)
    );
  }, [otherUsers, searchQuery]);

  const handleCreate = () => {
    if (selectedUserId) {
      onSelectUser(selectedUserId);
      setSelectedUserId(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
          <DialogDescription>Select someone to start chatting</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
            data-testid="input-search-users"
          />
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUserId(user._id)}
                className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${
                  selectedUserId === user._id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
                data-testid={`button-user-${user._id}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback>
                    {(user.username || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.username || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.status || "offline"}</p>
                </div>
              </button>
            ))}
              {filteredUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? "No users found" : "No other users available"}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedUserId || isLoading}
            data-testid="button-create-chat"
          >
            Start Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
