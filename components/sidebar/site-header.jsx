"use client"

import { SidebarIcon, Search, Bell, User, Settings, ChevronRight } from "lucide-react"

import { SearchForm } from "@/components/sidebar/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gradient-to-r from-primary/95 via-accent/90 to-primary/95 border-b border-border/10 shadow-2xl">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-chart-1/20 via-chart-2/20 to-chart-3/20 animate-pulse opacity-50" />
      
      {/* Glassmorphism layer */}
      <div className="absolute inset-0 bg-background/5 backdrop-blur-sm" />
      
      <div className="relative flex h-14 w-full items-center gap-3 px-6">
        {/* Sidebar toggle with modern styling */}
        <Button 
          className="h-10 w-10 rounded-xl bg-background/10 hover:bg-background/20 border border-border/20 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm" 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
        >
          <SidebarIcon className="h-5 w-5 text-primary-foreground" />
        </Button>

        {/* Modern separator with glow */}
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent mx-2" />
        
        {/* Enhanced breadcrumb with modern styling */}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList className="flex items-center space-x-2">
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="#" 
                className="text-sm font-semibold text-primary-foreground/90 hover:text-primary-foreground transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-background/10 backdrop-blur-sm border border-transparent hover:border-border/20"
              >
                SIEGWERK PAKISTAN LIMITED
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              {/* <ChevronRight className="h-4 w-4 text-muted-foreground/60" /> */}
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {/* <BreadcrumbPage className="text-primary-foreground/80 font-medium px-3 py-1.5 bg-background/10 rounded-lg backdrop-blur-sm border border-border/20">
                
              </BreadcrumbPage> */}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Modern search form container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-chart-1 to-chart-2 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur" />
          <SearchForm className="relative w-full sm:w-80 bg-background/10 backdrop-blur-sm border border-border/20 rounded-xl hover:bg-background/15 transition-all duration-300" />
        </div>

        {/* Action buttons with modern styling */}
        <div className="flex items-center space-x-2">
          <Button 
            className="h-10 w-10 rounded-xl bg-background/10 hover:bg-background/20 border border-border/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm relative" 
            variant="ghost" 
            size="icon"
          >
            <Bell className="h-5 w-5 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
          </Button>

          <Button 
            className="h-10 w-10 rounded-xl bg-background/10 hover:bg-background/20 border border-border/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm" 
            variant="ghost" 
            size="icon"
          >
            <Settings className="h-5 w-5 text-primary-foreground" />
          </Button>

          <Button 
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-chart-1/80 to-chart-2/80 hover:from-chart-1 hover:to-chart-2 border border-border/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm" 
            variant="ghost" 
            size="icon"
          >
            <User className="h-5 w-5 text-primary-foreground" />
          </Button>
        </div>
      </div>

      {/* Bottom accent line with animated gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </header>
  )
} 