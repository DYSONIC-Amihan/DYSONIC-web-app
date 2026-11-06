"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getMainNav, secondaryNav } from "@/lib/nav"
import { ROLE_LABELS, isRoleId } from "@/lib/roles"
import { ROUTES } from "@/lib/routes"
import { TerminalIcon } from "lucide-react"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    image?: string | null
    roleId?: number | null
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const roleLabel = isRoleId(user.roleId) ? ROLE_LABELS[user.roleId] : "Member"

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href={ROUTES.dashboard} />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">DYSONIC</span>
                <span className="truncate text-xs">{roleLabel}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getMainNav(user.roleId)} />
        <NavSecondary items={secondaryNav} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{ name: user.name, email: user.email, avatar: user.image ?? "" }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}