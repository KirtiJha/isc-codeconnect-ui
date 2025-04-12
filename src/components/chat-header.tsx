"use client";
import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";

import { SidebarToggleLeft } from "@/components/sidebar-toggle-left";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NavActions } from "./nav-actions";
import { PrintChat } from "@/types/types";
import { memo } from "react";
import { FileEditIcon, Sparkles } from "lucide-react";
// import { SidebarToggleRight } from "./sidebar-toggle-right";

export function PureChatHeader({ printChat }: { printChat: PrintChat }) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  const navigateToHome = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggleLeft />
      <div className="flex">
        {(!open || windowWidth < 768) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="order-1 md:order-0 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                onClick={navigateToHome}
              >
                <FileEditIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        )}
      </div>
      {!open && (
        <div
          className="flex items-center"
          onClick={navigateToHome}
          role="button"
          tabIndex={0}
          aria-label="Navigate to home page"
        >
          <span className="inline-block pl-1">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </span>
          <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ISC-CodeConnect
          </span>
        </div>
      )}
      <div className="flex ml-auto px-3">
        <NavActions printChat={printChat} />
      </div>
      {/* <SidebarToggleRight /> */}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader);
