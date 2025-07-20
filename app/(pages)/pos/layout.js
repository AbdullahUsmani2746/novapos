"use client";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingCart,
  Receipt,
  Menu,
  X,
  ChevronRight,
  Zap,
  Settings,
  LogOut,
  Notebook,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ModernPosLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/pos",
      icon: LayoutDashboard,
      color: "from-primary to-primary",
    },
    {
      id: "products",
      label: "Products",
      href: "/pos/products",
      icon: Package,
      color: "from-primary to-primary",
    },
    {
      id: "categories",
      label: "Categories",
      href: "/pos/categories",
      icon: Grid3X3,
      color: "from-primary to-primary",
    },
    {
      id: "cart",
      label: "Cart",
      href: "/pos/cart",
      icon: ShoppingCart,
      color: "from-primary to-primary",
    },
    {
      id: "orders",
      label: "Orders",
      href: "/pos/orders",
      icon: Receipt,
      color: "from-primary to-primary",
    },

    {
      id: "reports",
      label: "Reports",
      href: "/pos/reports",
      icon: Notebook,
      color: "from-primary to-primary",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavClick = (itemId, link) => {
    setActiveTab(itemId);
    setIsSidebarOpen(false);
    router.push(link);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed inset-y-0 left-0 z-50 w-72 md:w-80
    bg-primary backdrop-blur-xl border-r border-slate-200/50
    shadow-2xl shadow-slate-900/10
    transform transition-all duration-500 ease-out
    flex flex-col
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    ${isLoaded ? "opacity-100" : "opacity-0"}
  `}
      >
        {/* Sidebar Header */}
        <div className=" p-6 border-b border-slate-200/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl shadow-lg">
                <div className="flex aspect-square 12 items-center justify-center rounded-lg bg-sidebar-primary-foreground text-sidebar-primary-foreground">
                  <Image
                    src="/logo.webp"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="rounded-sm object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-white">
                  Silky Slik Flowers
                </h1>
                <p className="text-xs text-white">Point of Sale</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 hover:bg-slate-100"
              onClick={toggleSidebar}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-2 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <p className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2">
              Navigation
            </p>
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div
                  key={item.id}
                  className={`transform transition-all duration-500 ease-out ${
                    isLoaded
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
                >
                  <Button
                    variant="ghost"
                    className={`group relative w-full justify-start p-4 h-auto transition-all duration-300 ease-out hover:bg-secondary hover:shadow-md hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${
                      isActive
                        ? "bg-gradient-to-r from-secondary to-secondary shadow-md border-l-4 border-secondary"
                        : "hover:border-l-4 hover:border-transparent"
                    }`}
                    onClick={() => handleNavClick(item.id, item.href)}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50 rounded-lg" />
                    )}

                    <div
                      className={`relative p-2.5 rounded-xl mr-4 transition-all duration-300 ${
                        isActive
                          ? `bg-primary shadow-lg`
                          : `bg-white group-hover:bg-primary group-hover:bg-gradient-to-r ${item.color}`
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-primary group-hover:text-white"
                        }`}
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <span
                        className={`font-bold transition-colors duration-300 ${
                          isActive
                            ? "text-primary "
                            : "text-white group-hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive
                          ? "text-primary translate-x-1"
                          : "text-white group-hover:text-slate-600 group-hover:translate-x-1"
                      }`}
                    />

                    <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150 rounded-lg pointer-events-none" />
                  </Button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className=" p-4 border-t border-slate-200/50 bg-primary backdrop-blur-sm shrink-0">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start p-3 hover:bg-secondary group transition-all duration-300"
            >
              <Settings className="w-4 h-4 mr-3 text-white group-hover:text-primary" />
              <span className="text-white font-medium group-hover:text-primary">
                Settings
              </span>
            </Button>
            <Button
              onClick={() => {
                if (session?.user?.role === "ACCOUNTANT") {
                  router.push("/accounting/reports");
                } else {
                  signOut({ callbackUrl: "/auth/signin" });
                }
              }}
              variant="ghost"
              className="w-full justify-start p-3 hover:bg-red-50 text-white group transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:text-primary" />
              <span className="font-medium group-hover:text-primary">
                {session?.user?.role === "ACCOUNTANT"
                  ? "Go to Accounting"
                  : "Sign Out"}
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-80 overflow-x-hidden">
        {/* Top Bar */}
        <header
          className={`
          bg-white/80 backdrop-blur-xl border-b border-slate-200/50 
          px-4 py-4 md:px-6 md:py-5 shadow-sm
          transform transition-all duration-700 ease-out
          ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 hover:bg-slate-100 transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-slate-500">POS System</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="font-medium text-slate-800 capitalize">
                  {activeTab}
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-slate-100 transition-all duration-200 relative"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </Button>
              </div>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`
          flex-1 p-4 md:p-6 overflow-auto
          transform transition-all duration-700 ease-out
          ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
          style={{ transitionDelay: "0.2s" }}
        >
          {children}
        </main>
      </div>

      {/* Toast Container - This would be replaced with actual Toaster */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Toaster component would go here */}
      </div>
    </div>
  );
};

export default ModernPosLayout;
