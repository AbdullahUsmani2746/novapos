import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export const metadata = {
  title: "Dumo - Client",
  description: "Client Dashboard for Dumo",
};

export default function ClientLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar role="employer" />

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
