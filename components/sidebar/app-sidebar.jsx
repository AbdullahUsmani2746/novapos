"use client"
import Image from "next/image"
import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Accounts",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Add Account",
          url: "/add-account",
        },
        {
          title: "Show Account",
          url: "/show-account",
        },

      ],
    },
    {
      title: "Vouchers",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Payment Voucher",
          url: "/voucher/payment",
        },
        {
          title: "Receipt Voucher",
          url: "/voucher/receipt",
        },{
          title: "Journal Voucher",
          url: "/voucher/journal",
        },
        
      ],
    },
    {
      title: "Invoices",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Purchase Invoice",
          url: "/invoice/purchase",
        },
        {
          title: "Sale Invoice",
          url: "/invoice/sale",
        },
        
      ],
    },
    {
      title: "Returns",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Purchase Reuturn",
          url: "/return/purchaseReturn",
        },
        {
          title: "Sale Reuturn",
          url: "/return/saleReturn",
        },
        
      ],
    },

    {
      title: "POS",
      url: "/pos",
      icon: SquareTerminal,
      isActive: true,
     
    },

    {
      title: "Setups",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Company Setup",
          url: "/setup/companies",
        },
        {
          title: "Cost Center Setup",
          url: "/setup/cost_centers",
        },
        {
          title: "Department Setup",
          url: "/setup/departments",
        },
        {
          title: "Godown Setup",
          url: "/setup/godowns",
        },
        {
          title: "Season Setup",
          url: "/setup/seasons",
        },
        {
          title: "Financial Year Setup",
          url: "/setup/financial_years",
        },
        {
          title: "Product Category Setup",
          url: "/setup/purchase_product_categories",
        },
        {
          title: "Delivery Mode Setup",
          url: "/setup/delivery_modes",
        },
        {
          title: "Delivery Terms Setup",
          url: "/setup/delivery_terms",
        },
        {
          title: "Commission Term Setup",
          url: "/setup/commission_terms",
        },
        {
          title: "Employee Setup",
          url: "/setup/employees",
        },
        
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div
  className="flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary-foreground text-sidebar-primary-foreground">
  <Image
    src="/logo.webp" // replace with your actual image path
    alt="Logo"
    width={64}
    height={64}
    className="rounded-sm object-contain"
  />
</div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Silky Silk Flowers</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
