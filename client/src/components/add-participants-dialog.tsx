import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: string;
}

interface AddParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userIds: string[], groupName?: string) => void;
  isLoading?: boolean;
  currentParticipantIds?: string[];
  isGroupChat?: boolean;
}

export function AddParticipantsDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  currentParticipantIds = [],
  isGroupChat = false,
}: AddParticipantsDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults } = useQuery<{ users: User[] }>({
    queryKey: ["/api/search", { q: searchQuery, type: "users" }],
    enabled: searchQuery.length >= 2,
  });

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    const newUserIds = selectedUserIds.filter((id) => !currentParticipantIds.includes(id));
    const willBeGroupChat = currentParticipantIds.length + newUserIds.length > 2;
    
    if (willBeGroupChat && !isGroupChat && !groupName.trim()) {
      return;
    }
    
    onSubmit(newUserIds, willBeGroupChat ? groupName || undefined : undefined);
    setSelectedUserIds([]);
    setGroupName("");
    setSearchQuery("");
  };

  const availableUsers = searchResults?.users?.filter(
    (u) => !currentParticipantIds.includes(u._id)
  ) || [];

  const willBeGroupChat = currentParticipantIds.length + selectedUserIds.length > 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-add-participants">
        <DialogHeader>
          <DialogTitle>Add People</DialogTitle>
          <DialogDescription>
            Search for users to add to the conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>

          {willBeGroupChat && !isGroupChat && (
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Chat Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                data-testid="input-group-name"
              />
            </div>
          )}

          <ScrollArea className="h-[300px] border rounded-md p-2">
            {searchQuery.length < 2 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <p>Type at least 2 characters to search</p>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                    onClick={() => toggleUser(user._id)}
                    data-testid={`user-option-${user._id}`}
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(user._id)}
                      onCheckedChange={() => toggleUser(user._id)}
                      data-testid={`checkbox-user-${user._id}`}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              selectedUserIds.length === 0 ||
              isLoading ||
              (willBeGroupChat && !isGroupChat && !groupName.trim())
            }
            data-testid="button-add"
          >
            {isLoading ? "Adding..." : "Add People"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
