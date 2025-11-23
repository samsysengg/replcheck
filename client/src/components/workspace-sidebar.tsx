import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Workspace } from "@shared/schema";

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  onWorkspaceSelect,
  onCreateWorkspace,
}: WorkspaceSidebarProps) {
  return (
    <div className="flex flex-col h-screen w-20 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-lg">T</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <div className="flex flex-col items-center gap-3 px-3">
          {workspaces.map((workspace) => (
            <Tooltip key={workspace._id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onWorkspaceSelect(workspace._id)}
                  className={`relative w-12 h-12 rounded-md transition-all hover-elevate ${
                    activeWorkspaceId === workspace._id
                      ? "bg-sidebar-accent"
                      : "bg-sidebar-accent/50"
                  }`}
                  data-testid={`button-workspace-${workspace._id}`}
                >
                  <Avatar className="w-12 h-12 rounded-md">
                    <AvatarImage src={workspace.avatar} />
                    <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {activeWorkspaceId === workspace._id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-1 h-8 bg-primary rounded-r" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{workspace.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border space-y-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="w-12 h-12 rounded-md"
              onClick={onCreateWorkspace}
              data-testid="button-create-workspace"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Create workspace</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
