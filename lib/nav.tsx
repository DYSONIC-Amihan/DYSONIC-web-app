import type { ReactNode } from "react"
import {
  LayoutDashboardIcon,
  LifeBuoyIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/routes"
import { ROLE_IDS, isRoleId, type RoleId } from "@/lib/roles"

export type NavItem = {
  title: string
  url: string
  icon: ReactNode
  isActive?: boolean
  items?: { title: string; url: string }[]
}

type RoleNavItem = NavItem & {
  // Roles that see this item. Leave out to show it to everyone.
  roles?: readonly RoleId[]
}

/**
 * Every sidebar item lives here. To add a page to the menu, add one entry
 * and list the roles that should see it.
 */
const NAV_ITEMS: RoleNavItem[] = [
  {
    title: "Dashboard",
    url: ROUTES.dashboard,
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Users",
    url: ROUTES.users,
    icon: <UsersIcon />,
    roles: [ROLE_IDS.admin, ROLE_IDS.superAdmin],
  },
]

export function getMainNav(roleId: number | null | undefined): NavItem[] {
  // Unknown or missing role falls back to the lowest-privilege menu.
  const role = isRoleId(roleId) ? roleId : ROLE_IDS.normal

  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map(
    ({ roles: _roles, ...item }) => item,
  )
}

export const secondaryNav: Omit<NavItem, "items" | "isActive">[] = [
  { title: "Support", url: "#", icon: <LifeBuoyIcon /> },
  { title: "Feedback", url: "#", icon: <SendIcon /> },
]