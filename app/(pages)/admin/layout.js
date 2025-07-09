import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"


export const metadata = {
    title: "Accounts",
    description: "sidebar",
  };
  
  export default function AccountsLayout({ children }) {

    return (
      
        <div className="[--header-height:calc(theme(spacing.14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar role="admin" />
            <SidebarInset>
            {children}
            </SidebarInset>
            </div>

          </SidebarProvider>
          </div>
      
    );
  }
  