import { cookies } from "next/headers";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import { UserSession } from "@/hooks/use-user-session";
import { SessionProvider } from "next-auth/react";
import { urls } from "@/constants/constants";
import { DialogProvider } from "@/hooks/use-comment-dialog";
// import { SidebarRight } from "@/components/sidebar-right";

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  return (
    <SessionProvider basePath={urls.authBasePath}>
      <UserSession>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <SidebarLeft user={session?.user} />
          <SidebarInset>
            <DialogProvider>{children}</DialogProvider>
          </SidebarInset>
          {/* <SidebarRight user={session?.user} /> */}
        </SidebarProvider>
      </UserSession>
    </SessionProvider>
  );
}
