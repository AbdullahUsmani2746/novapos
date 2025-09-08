"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  BarChart3,
  FileText,
  CreditCard,
  Truck,
  Store,
  Calendar,
  Bell,
  Shield,
  Globe,
  Zap,
  SquareTerminal,
  Settings2,
  Database,
  Receipt,
  BarChart2,
  Layers,
} from "lucide-react";

// Icon mapping for easy maintenance
const iconMap = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ShoppingCart,
  settings: Settings,
  users: Users,
  analytics: BarChart3,
  reports: FileText,
  billing: CreditCard,
  shipping: Truck,
  inventory: Store,
  calendar: Calendar,
  notifications: Bell,
  security: Shield,
  database: Database,
  website: Globe,
  integrations: Zap,
};

// ----------------- NAVIGATION CONFIG -----------------
export const navigationConfig = {
  main: [
    { name: "Reports", path: "/accounting/reports", icon: "dashboard", shortcut: "⌘D" },
    { name: "Products", path: "/products", icon: "products", shortcut: "⌘P" },
    { name: "Orders", path: "/orders", icon: "orders", shortcut: "⌘O" },
    { name: "Analytics", path: "/analytics", icon: "analytics", shortcut: "⌘A" },
    { name: "Users", path: "/users", icon: "users", shortcut: "⌘U" },
  ],

  reports: [
    { name: "Sales Report", path: "/accounting/reports/sales", icon: "reports" },
    { name: "Expense Report", path: "/accounting/reports/expense", icon: "reports" },
    { name: "Profit & Loss", path: "/accounting/reports/profit-loss", icon: "reports" },
  ],

  accounting: [
    {
      name: "Accounts",
      icon: "dashboard",
      items: [
        { name: "Add Account", path: "/accounting/add-account" },
        { name: "Show Account", path: "/accounting/show-account" },
      ],
    },
    {
      name: "Vouchers",
      icon: "reports",
      items: [
        { name: "Payment Voucher", path: "/accounting/voucher/payment" },
        { name: "Receipt Voucher", path: "/accounting/voucher/receipt" },
        { name: "Journal Voucher", path: "/accounting/voucher/journal" },
      ],
    },
    {
      name: "Subsidary Details",
      icon: "users",
      items: [
        { name: "Customers", path: "/accounting/forms/customer" },
        { name: "Vendors", path: "/accounting/forms/vendor" },
        { name: "Material", path: "/accounting/material" },
      ],
    },
    {
      name: "Invoices",
      icon: "reports",
      items: [
        { name: "Purchase Invoice", path: "/accounting/invoice/purchase" },
        { name: "Sale Invoice", path: "/accounting/invoice/sale" },
        { name: "Good Receipt Note", path: "/accounting/report/grn" },
        { name: "Dispatch Note", path: "/accounting/report/dispatch" },
      ],
    },
    {
      name: "Orders",
      icon: "orders",
      items: [
        { name: "Purchase Order", path: "/accounting/order/purchaseOrder" },
        { name: "Sale Order", path: "/accounting/order/saleOrder" },
      ],
    },
    {
      name: "Returns",
      icon: "products",
      items: [
        { name: "Purchase Return", path: "/accounting/return/purchaseReturn" },
        { name: "Sale Return", path: "/accounting/return/saleReturn" },
      ],
    },
    {
      name: "Transfer",
      icon: "shipping",
      items: [{ name: "Godown Transfer", path: "/accounting/godown/transfer" }],
    },
    {
      name: "POS",
      path: "/pos",
      icon: "dashboard",
    },
  ],

  management: [
    { name: "Inventory", path: "/inventory", icon: "inventory" },
    { name: "Shipping", path: "/shipping", icon: "shipping" },
    { name: "Calendar", path: "/calendar", icon: "calendar" },
  ],

  setups: [
    { name: "Item Setup", path: "/accounting/forms/items", icon: "database" },
    { name: "Company Setup", path: "/accounting/setup/companies", icon: "database" },
    { name: "Cost Center Setup", path: "/accounting/setup/cost_centers", icon: "database" },
    { name: "Department Setup", path: "/accounting/setup/departments", icon: "database" },
    { name: "Godown Setup", path: "/accounting/setup/godowns", icon: "database" },
    { name: "Season Setup", path: "/accounting/setup/seasons", icon: "database" },
    { name: "Financial Year Setup", path: "/accounting/setup/financial_years", icon: "database" },
    { name: "Product Category Setup", path: "/accounting/setup/purchase_product_categories", icon: "database" },
    { name: "Delivery Mode Setup", path: "/accounting/setup/delivery_modes", icon: "database" },
    { name: "Delivery Terms Setup", path: "/accounting/setup/delivery_terms", icon: "database" },
    { name: "Commission Term Setup", path: "/accounting/setup/commission_terms", icon: "database" },
    { name: "Employee Setup", path: "/accounting/setup/employees", icon: "database" },
  ],

  system: [
    { name: "Settings", path: "/settings", icon: "settings" },
    { name: "Billing", path: "/billing", icon: "billing" },
    { name: "Security", path: "/security", icon: "security" },
    { name: "Integrations", path: "/integrations", icon: "integrations" },
    { name: "Database", path: "/database", icon: "database" },
  ],
};

// ----------------- FLATTEN NAVIGATION -----------------
function flattenNav(config) {
  const result = [];

  function recurse(items, group) {
    items.forEach((item) => {
      result.push({ ...item, group });
      if (item.items) recurse(item.items, group); // include children
    });
  }

  Object.entries(config).forEach(([group, items]) => {
    recurse(items, group);
  });

  return result;
}

const allCommands = flattenNav(navigationConfig);

// ----------------- SEARCH FORM -----------------
export function SearchForm({ ...props }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  // Global shortcuts
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }

      if (!open) {
        navigationConfig.main.forEach((item) => {
          if (
            item.shortcut &&
            e.key.toLowerCase() === item.shortcut.slice(-1).toLowerCase() &&
            (e.metaKey || e.ctrlKey)
          ) {
            e.preventDefault();
            router.push(item.path);
          }
        });
      }

      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, router]);

  const filtered = allCommands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.group.toLowerCase().includes(query.toLowerCase())
  );

  const groupedFiltered = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const handleSelect = (path) => {
    router.push(path);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="group relative flex h-10 w-full max-w-sm items-center justify-between rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        {...props}
      >
        <div className="relative w-full">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Type to search or (Ctrl + K)"
            className="h-8 pl-7"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-50" />
        </div>
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="opacity-0"></DialogTitle>
          </DialogHeader>
          <Command className="rounded-lg border-0 shadow-none">
            {/* Input */}
            <div className="relative border-b border-border/50">
              <CommandInput
                placeholder="Type a command or search..."
                value={query}
                onValueChange={setQuery}
                className="h-14 pl-12 text-base border-0 focus:ring-0 bg-transparent"
              />
            </div>

            {/* Results */}
            <CommandList className="max-h-96 overflow-y-auto p-2">
              {Object.keys(groupedFiltered).length === 0 ? (
                <CommandEmpty className="py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                </CommandEmpty>
              ) : (
                Object.entries(groupedFiltered).map(([groupName, items], index) => (
                  <CommandGroup
                    key={index}
                    heading={groupName.charAt(0).toUpperCase() + groupName.slice(1)}
                    className="mb-2"
                  >
                    {items.map((cmd, index) => {
                      const IconComponent = iconMap[cmd.icon] || FileText;
                      return (
                        <CommandItem
                          key={index}
                          onSelect={() => handleSelect(cmd.path)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/80"
                        >
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-medium">{cmd.name}</span>
                            {cmd.shortcut && (
                              <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))
              )}
            </CommandList>

            {/* Footer */}
            <div className="border-t border-border/50 p-4 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border bg-background font-mono text-xs">
                      ↵
                    </kbd>
                    <span>to select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border bg-background font-mono text-xs">
                      ↑↓
                    </kbd>
                    <span>to navigate</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 items-center gap-1 rounded border bg-background px-1 font-mono text-xs">
                    esc
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
