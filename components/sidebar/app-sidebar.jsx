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
  LayoutDashboard,
  Users,
  Clipboard,
  BriefcaseBusiness,
  BriefcaseConveyorBelt,
  DollarSign as DollarSignIcon,
  LucideUmbrella,
  CircleHelp,
  Contact,
  Locate,
  Building,
  UserCheck2 as UserCheck2Icon,
  MinusCircle as MinusCircleIcon,
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
          url: "/accounting/add-account",
        },
        {
          title: "Show Account",
          url: "/accounting/show-account",
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
          url: "/accounting/voucher/payment",
        },
        {
          title: "Receipt Voucher",
          url: "/accounting/voucher/receipt",
        },{
          title: "Journal Voucher",
          url: "/accounting/voucher/journal",
        },
        
      ],
    },
    {
      title: "Subsidary Details",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Customers",
          url: "/accounting/forms/customer",
        },
        {
          title: "Vendors",
          url: "/accounting/forms/vendor",
        },
        {
          title: "Material",
          url: "/accounting/material",
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
          url: "/accounting/invoice/purchase",
        },
        {
          title: "Sale Invoice",
          url: "/accounting/invoice/sale",
        },
        {
          title: "Good Receipt Note",
          url: "/accounting/report/grn",
        },
        {
          title: "Dispatch Note",
          url: "/accounting/report/dispatch",
        },
        
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Purchase Order",
          url: "/accounting/order/purchaseOrder",
        },
        {
          title: "Sale Order",
          url: "/accounting/order/saleOrder",
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
          url: "/accounting/return/purchaseReturn",
        },
        {
          title: "Sale Reuturn",
          url: "/accounting/return/saleReturn",
        },
        
      ],
    },
{
      title: "Transfer",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Godown Transfer",
          url: "/accounting/godown/transfer",
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
      title: "Reports",
      url: "/accounting/reports",
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
          title: "Iten Setup",
          url: "/accounting/setup/items",
        },
        {
          title: "Company Setup",
          url: "/accounting/setup/companies",
        },
        {
          title: "Cost Center Setup",
          url: "/accounting/setup/cost_centers",
        },
        {
          title: "Department Setup",
          url: "/accounting/setup/departments",
        },
        {
          title: "Godown Setup",
          url: "/accounting/setup/godowns",
        },
        {
          title: "Season Setup",
          url: "/accounting/setup/seasons",
        },
        {
          title: "Financial Year Setup",
          url: "/accounting/setup/financial_years",
        },
        {
          title: "Product Category Setup",
          url: "/accounting/setup/purchase_product_categories",
        },
        {
          title: "Delivery Mode Setup",
          url: "/accounting/setup/delivery_modes",
        },
        {
          title: "Delivery Terms Setup",
          url: "/accounting/setup/delivery_terms",
        },
        {
          title: "Commission Term Setup",
          url: "/accounting/setup/commission_terms",
        },
        {
          title: "Employee Setup",
          url: "/accounting/setup/employees",
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
  navAdmin: [
    {
      title: "Users",
      url: "/admin/user",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Shift",
          url: "/admin/shift",
        },

      ],
    },
  ],
   navEmployee: [
    {
      title: "Dashboard",
      url: "/client/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Employee",
      url: "/client/employee",
      icon: Users,
      isActive: true,
    },
    {
      title: "Time Entry",
      url: "/client/attendance",
      icon: Clipboard,
      isActive: true,
    },
     {
      title: "Employee Requests",
      url: "/client/request", // Link to the approval page
      icon: BriefcaseBusiness, // Example icon, can be customized
      isActive: true,
    },
    {
      title: "Time Approvals",
      url: "/client/approvals", // Link to the approval page
      icon: BriefcaseBusiness, // Example icon, can be customized
      isActive: true,
    },
    {
      title: "Leave Approvals",
      url: "/client/requestApproval", // Link to the approval page
      icon: BriefcaseBusiness, // Example icon, can be customized
      isActive: true,
    },
    {
      title: "Run Payroll",
      url: "/client/payroll/employeePayroll",
      icon: LucideUmbrella,
      isActive: true,
    },
    {
      title: "Reports",
      url: "/client/reports",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "Help Desk",
      url: "/client/helpdesk",
      icon: CircleHelp,
      isActive: true,
    },
    {
      title: "Payroll Operations",
      url: "#",
      icon: Users,
      isActive: false,
      items: [
        {
          title: "Work Location",
          url: "/client/location",
          icon: Locate,
          isActive: true,
        },
        {
          title: "Department",
          url: "/client/department",
          icon: Building,
          isActive: true,
        },
        {
          title: "Cost Center",
          url: "/client/costCenter",
          icon: PieChart,
          isActive: true,
        },

        {
          title: "Parent Cost Center",
          url: "/client/parentCostCenter",
          icon: PieChart,
          isActive: true,
        },
        {
          title: "Employee Type",
          url: "/client/employeeType",
          icon: UserCheck2Icon,
          isActive: true,
        },

        {
          title: "Bank",
          url: "/client/bank",
          icon: UserCheck2Icon,
          isActive: true,
        },

        {
          title: "Manager",
          url: "/client/manager",
          icon: BriefcaseConveyorBelt,
          isActive: true,
        },
        {
          title: "Job Title",
          url: "/client/jobTitle",
          icon: BriefcaseBusiness,
          isActive: true,
        },
        {
          title: "Allowances",
          url: "/client/allowance",
          icon: DollarSignIcon,
          isActive: true,
        },
        {
          title: "Deductions",
          url: "/client/deduction",
          icon: MinusCircleIcon,
          isActive: true,
        },

        {
          title: "Leaves",
          url: "/client/leave",
          icon: LucideUmbrella,
          isActive: true,
        },

        {
          title: "Payroll Cycle",
          url: "/client/payrollProcess",
        },
        // {
        //   title: "Payroll Compensation",
        //   url: "/client/payroll",
        // },
      ],
    },

    {
      title: "Settings",
      url: "/client/setting", // Set to "#" since the modal will open without navigating
      icon: Settings2,
      isActive: true,
      onClick: true,
    },
  ],
  navUserEmployee: [
    {
      title: "Dashboard",
      url: "/employee/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Profile",
      url: "/employee/profile",
      icon: Contact,
      isActive: true,
    },
    {
      title: "Attendances",
      url: "/employee/attendances",
      icon: Clipboard,
      isActive: true,
    },
    {
      title: "Request",
      url: "/employee/request",
      icon: Send,
      isActive: true,
    },
    
    {
      title: "Payslip",
      url: "/employee/payslips",
      icon: DollarSignIcon,
      isActive: true,
    },
    {
      title: "Help Desk",
      url: "/employee/helpdesk",
      icon: CircleHelp,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/employee/setting",
      icon: Settings2,
      isActive: true,
      onClick: true,
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
                  <span className="truncate font-semibold">SIEGWERK PAKISTAN LIMITED</span>
                  <span className="truncate text-xs">ENTERPRISE</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
         {props.role === "admin" ? (<NavMain items={data.navAdmin} />) : 
         props.role === "userEmployee" ? (<NavMain items={data.navUserEmployee} />) : 
         props.role === "employer" ? (  <NavMain items={data.navEmployee} />) :
        (
          <NavMain items={data.navMain} />
        )}
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
