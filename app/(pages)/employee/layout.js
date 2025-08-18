import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export const metadata = {
  title: "Dumo- Employee",
  keywords: ["Dumo", "Employee", "Dashboard", "Next.js"],
  description: "Employee Dashboard for Dumo",
  
};

export default function EmployeeLayout({ children }) {

  return (
    <SidebarProvider>
      <AppSidebar role="userEmployee"/>

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
