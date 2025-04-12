"use client";

import * as React from "react";
import {
  FileEditIcon,
  // HistoryIcon,
  Sparkles,
  // SquareTerminal,
} from "lucide-react";
import type { User } from "next-auth";
// import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarHistory } from "./sidebar-history";
// import { SidebarUserNav } from "./sidebar-user-nav";
// import { NavProjects } from "./nav-projects";
// import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
// import { SidebarComingSoon } from "./sidebar-history";

// This is sample data.
/* const data = {
  navMain: [
    {
      title: "Chat Histiroy",
      url: "/",
      icon: SquareTerminal,
      // isActive: true,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: HistoryIcon,
    },
  ],
}; */

export function SidebarLeft({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { open, state, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center h-8">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="inline-block pl-1">
                <Sparkles className="w-6 h-6 text-blue-400 p-[2px]" />
              </span>
              {state === "expanded" && (
                <span className="text-md font-semibold px-2 hover:bg-muted rounded-md cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  ISC CodeConnect
                </span>
              )}
            </Link>
            {open && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-10"
                    onClick={() => {
                      setOpenMobile(false);

                      router.push("/");
                      router.refresh();
                    }}
                  >
                    <FileEditIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">New Chat</TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarMenu>
        {/* <NavMain items={data.navMain} /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        {/* <NavProjects projects={data.projects} /> */}
        <SidebarHistory user={user} />
        {/* <SidebarComingSoon /> */}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
        {/* {user && <SidebarUserNav user={user} />} */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
