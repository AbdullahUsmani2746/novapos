"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  ShoppingCart,
  Building2,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Hash,
  X,
  Eye,
  Sparkles,
  TrendingUp,
  Star,
  Activity,
} from "lucide-react";
import axios from "axios";

const CustomerManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    city: "",
    category: "",
    area: "",
    salesArea: "",
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [modalTab, setModalTab] = useState("customers");
  const [formData, setFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    tab: "",
  });
  const [customersData, setCustomersData] = useState({
    customers: [],
    total: 0,
  });
  const [contacts, setContacts] = useState([]);
  const [salesItems, setSalesItems] = useState([]);
  const [loading, setLoading] = useState({
    customers: false,
    contacts: false,
    sales: false,
  });

  // Separate search states for each tab
  const [searchStates, setSearchStates] = useState({
    customers: "",
    contacts: "",
    sales: "",
  });

  const updateSearchState = (tab, value) => {
    setSearchStates((prev) => ({ ...prev, [tab]: value }));
    setCurrentPage(1);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchStates.customers,
        ...filters,
      });
      const response = await axios.get(`/api/forms/customers?${params}`);
      setCustomersData(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
    setLoading((prev) => ({ ...prev, customers: false }));
  }, [currentPage, searchStates.customers, filters]);

  const fetchContacts = useCallback(async () => {
    if (!selectedCustomer || activeTab !== "party") return;
    setLoading((prev) => ({ ...prev, contacts: true }));
    try {
      const params = new URLSearchParams({
        acno: selectedCustomer.toString(),
        search: searchStates.contacts,
      });
      const response = await axios.get(`/api/forms/contacts?${params}`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
    setLoading((prev) => ({ ...prev, contacts: false }));
  }, [selectedCustomer, searchStates.contacts, activeTab]);

  const fetchSalesItems = useCallback(async () => {
    if (!selectedCustomer || activeTab !== "sales") return;
    setLoading((prev) => ({ ...prev, sales: true }));
    try {
      const params = new URLSearchParams({
        acno: selectedCustomer.toString(),
        search: searchStates.sales,
      });
      const response = await axios.get(`/api/forms/sales-items?${params}`);
      setSalesItems(response.data);
    } catch (error) {
      console.error("Error fetching sales items:", error);
    }
    setLoading((prev) => ({ ...prev, sales: false }));
  }, [selectedCustomer, searchStates.sales, activeTab]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchContacts();
    fetchSalesItems();
  }, [fetchContacts, fetchSalesItems]);

  const handleSubmit = async () => {
    try {
      const data = { ...formData };
      if (modalTab === "party" || modalTab === "sales-items") {
        data.acno = selectedCustomer;
      }
      if (modalTab === "sales-items" && !data.dateD) {
        data.dateD = new Date().toISOString();
      }

      if (modalType === "add") {
        await axios.post(`/api/${modalTab}`, data);
      } else {
        await axios.put(`/api/${modalTab}`, data);
      }

      setModalIsOpen(false);
      setFormData({});

      if (modalTab === "customers") fetchCustomers();
      if (modalTab === "party") fetchContacts();
      if (modalTab === "sales-items") fetchSalesItems();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const key = deleteConfirm.tab === "customers" ? "acno" : "id";
      await axios.delete(`/api/${deleteConfirm.tab}`, {
        data: { [key]: deleteConfirm.id },
      });

      setDeleteConfirm({ open: false, id: null, tab: "" });

      if (deleteConfirm.tab === "customers") fetchCustomers();
      if (deleteConfirm.tab === "contacts") fetchContacts();
      if (deleteConfirm.tab === "sales-items") fetchSalesItems();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const openModal = (type, tab, data) => {
    setModalType(type);
    setModalTab(tab);
    setFormData(data || {});
    setModalIsOpen(true);
  };

  const clearFilters = () => {
    setFilters({ city: "", category: "", area: "", salesArea: "" });
    setCurrentPage(1);
  };

  const ActionButton = ({
    onClick,
    variant = "ghost",
    size = "sm",
    icon: Icon,
    children,
    className = "",
  }) => (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={`h-8 px-3 hover:scale-105 transition-all duration-200 ${className}`}
    >
      <Icon className="h-4 w-4 mr-1" />
      {children}
    </Button>
  );

  const SearchBox = ({ value, onChange, placeholder, className = "" }) => (
    <div className={`relative group ${className}`}>
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
        size={18}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-11 bg-white/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
      />
    </div>
  );

  const StatsCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  const CustomerTable = () => (
    <Card className="shadow-lg border-0 bg-white backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 bg-secondary border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            Customer Directory
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary border-0"
            >
              {customersData.total}
            </Badge>
          </CardTitle>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <SearchBox
              value={searchStates.customers}
              onChange={(value) => updateSearchState("customers", value)}
              placeholder="Search customers..."
              className="w-full sm:w-80"
            />
            <div className="flex gap-2">
              {Object.values(filters).some((f) => f) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="hover:bg-destructive/10 hover:text-destructive border-border/50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button
                onClick={() => openModal("add", "customers")}
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Input
            placeholder="Filter by city..."
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-36 h-9 text-sm bg-white/50 border-border/50"
          />
          <Input
            placeholder="Category..."
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-32 h-9 text-sm bg-white/50 border-border/50"
          />
          <Input
            placeholder="Area..."
            value={filters.area}
            onChange={(e) => handleFilterChange("area", e.target.value)}
            className="w-28 h-9 text-sm bg-white/50 border-border/50"
          />
          <Input
            placeholder="Sales Area..."
            value={filters.salesArea}
            onChange={(e) => handleFilterChange("salesArea", e.target.value)}
            className="w-36 h-9 text-sm bg-white/50 border-border/50"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/30">
                <TableHead className="font-semibold text-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    Account
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Company
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Contact
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Category
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.customers ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
                        <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <span className="text-muted-foreground font-medium">
                        Loading customers...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customersData.customers.map((customer, index) => (
                  <TableRow
                    key={customer.acno}
                    className="hover:bg-muted/30 transition-all duration-200 group border-border/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm font-semibold text-primary py-4">
                      #{customer.acno}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          {customer.acname}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.area}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        <span className="text-foreground font-medium">
                          {customer.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3 text-primary" />
                        <span className="text-sm truncate max-w-32">
                          {customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-secondary/10 text-secondary-foreground border-0 font-medium"
                      >
                        {customer.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end  opacity-100 group-hover:opacity-100 transition-all duration-200">
                        <ActionButton
                          onClick={() => {
                            setSelectedCustomer(customer.acno);
                            setActiveTab("party");
                          }}
                          icon={Users}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        ></ActionButton>
                        <ActionButton
                          onClick={() => {
                            setSelectedCustomer(customer.acno);
                            setActiveTab("sales");
                          }}
                          icon={ShoppingCart}
                          className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                        ></ActionButton>
                        <ActionButton
                          onClick={() =>
                            openModal("edit", "customers", customer)
                          }
                          icon={Edit3}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        ></ActionButton>
                        <ActionButton
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              id: customer.acno,
                              tab: "customers",
                            })
                          }
                          icon={Trash2}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        ></ActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/30 bg-muted/20">
          <div className="text-sm text-primary">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, customersData.total)} of{" "}
            {customersData.total} customers
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="hover:bg-primary border-border/50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, Math.ceil(customersData.total / 10)) },
                (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-9 h-9 p-0 hover:bg-primary border-border/50"
                  >
                    {i + 1}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= Math.ceil(customersData.total / 10)}
              className="hover:bg-primary border-border/50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ContactsTable = () => (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 bg-secondary border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            Contact Directory
            <Badge
              variant="secondary"
              className="ml-2 text-[22px] bg-secondary text-primary border-0"
            >
              {contacts.length}
            </Badge>
          </CardTitle>
          <div className="flex gap-3 w-full sm:w-auto">
            <SearchBox
              value={searchStates.contacts}
              onChange={(value) => updateSearchState("contacts", value)}
              placeholder="Search contacts..."
              className="w-full sm:w-64"
            />
            <Button
              onClick={() =>
                openModal("add", "party", { acno: selectedCustomer })
              }
              className="bg-primary shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="">
              <TableRow className="hover:bg-transparent border-border/30">
                <TableHead className="font-semibold text-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Name
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Designation
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Contact
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.contacts ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600/30 border-t-emerald-600"></div>
                        <Activity className="absolute inset-0 m-auto h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <span className="text-primary font-medium">
                        Loading contacts...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 bg-muted/30 rounded-full">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground font-medium">
                        No contacts found for this customer
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact, index) => (
                  <TableRow
                    key={contact.id}
                    className="hover:bg-emerald-50/30 transition-all duration-200 group border-border/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm font-semibold text-primary py-4">
                      #{contact.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {contact.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-secondary text-primary border-0 font-medium"
                      >
                        {contact.designation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3 text-primary" />
                        <span className="font-mono text-sm font-medium">
                          {contact.contact}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end group-hover:opacity-100 transition-all duration-200">
                        <ActionButton
                          onClick={() =>
                            openModal("edit", "party", {
                              ...contact,
                              acno: selectedCustomer,
                            })
                          }
                          icon={Edit3}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        ></ActionButton>
                        <ActionButton
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              id: contact.id,
                              tab: "contacts",
                            })
                          }
                          icon={Trash2}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        ></ActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const SalesTable = () => (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 bg-secondary border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            Sales Items
            <Badge
              variant="secondary"
              className="ml-2 bg-secondary text-[17px] text-primary border-0"
            >
              {salesItems.length}
            </Badge>
          </CardTitle>
          <div className="flex gap-3 w-full sm:w-auto">
            <SearchBox
              value={searchStates.sales}
              onChange={(value) => updateSearchState("sales", value)}
              placeholder="Search sales items..."
              className="w-full sm:w-64"
            />
            <Button
              onClick={() =>
                openModal("add", "sales-items", { acno: selectedCustomer })
              }
              className="bg-primary shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-violet-50/50">
              <TableRow className="hover:bg-transparent border-border/30">
                <TableHead className="font-semibold text-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Item Code
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Rate
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    GST Rate
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.sales ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="text-primary">
                        Loading sales items...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : salesItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-primary"
                  >
                    No sales items found for this customer
                  </TableCell>
                </TableRow>
              ) : (
                salesItems.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors duration-150 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      #{item.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">#{item.itcd}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 ">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">
                          {item.rate?.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.gst_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 ">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(item.dateD).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end transition-opacity duration-200">
                        <ActionButton
                          onClick={() =>
                            openModal("edit", "sales-items", {
                              ...item,
                              acno: selectedCustomer,
                            })
                          }
                          icon={Edit3}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        ></ActionButton>
                        <ActionButton
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              id: item.id,
                              tab: "sales-items",
                            })
                          }
                          icon={Trash2}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        ></ActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const ModalForm = () => {
    if (modalTab === "customers") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Account Number
            </label>
            <Input
              name="acno"
              value={formData.acno || ""}
              onChange={handleInputChange}
              placeholder="Enter account number"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company Name
            </label>
            <Input
              name="acname"
              value={formData.acname || ""}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              City
            </label>
            <Input
              name="city"
              value={formData.city || ""}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <Input
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              placeholder="Enter email address"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <Input
              name="category"
              value={formData.category || ""}
              onChange={handleInputChange}
              placeholder="Enter category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Area
            </label>
            <Input
              name="area"
              value={formData.area || ""}
              onChange={handleInputChange}
              placeholder="Enter area"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sales Area
            </label>
            <Input
              name="salesArea"
              value={formData.salesArea || ""}
              onChange={handleInputChange}
              placeholder="Enter sales area"
            />
          </div>
        </div>
      );
    } else if (modalTab === "party") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <Input
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              placeholder="Enter contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Designation
            </label>
            <Input
              name="designation"
              value={formData.designation || ""}
              onChange={handleInputChange}
              placeholder="Enter designation"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Number
            </label>
            <Input
              name="contact"
              value={formData.contact || ""}
              onChange={handleInputChange}
              placeholder="Enter contact number"
            />
          </div>
        </div>
      );
    } else if (modalTab === "sales-items") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Item Code
            </label>
            <Input
              name="itcd"
              value={formData.itcd || ""}
              onChange={handleInputChange}
              placeholder="Enter item code"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rate
            </label>
            <Input
              name="rate"
              value={formData.rate || ""}
              onChange={handleInputChange}
              placeholder="Enter rate"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GST Rate (%)
            </label>
            <Input
              name="gst_rate"
              value={formData.gst_rate || ""}
              onChange={handleInputChange}
              placeholder="Enter GST rate"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <Input
              name="dateD"
              value={
                formData.dateD
                  ? new Date(formData.dateD).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              type="date"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Customer Management
              </h1>
              <p className="text-slate-600">
                Manage customers, contacts, and sales data
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-slate-200 p-1 h-full">
            <TabsTrigger
              value="customers"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger
              value="party"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              disabled={!selectedCustomer}
            >
              <Users className="h-4 w-4" />
              Contacts{" "}
              {selectedCustomer && (
                <Badge variant="outline" className="ml-1">
                  #{selectedCustomer}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              disabled={!selectedCustomer}
            >
              <ShoppingCart className="h-4 w-4" />
              Sales{" "}
              {selectedCustomer && (
                <Badge variant="outline" className="ml-1">
                  #{selectedCustomer}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-0">
            <CustomerTable />
          </TabsContent>

          <TabsContent value="party" className="mt-0">
            {selectedCustomer ? (
              <div>
                <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {customersData.customers.find(
                            (c) => c.acno === selectedCustomer
                          )?.acname || "Selected Customer"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Account #{selectedCustomer}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("customers")}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Customers
                    </Button>
                  </div>
                </div>
                <ContactsTable />
              </div>
            ) : (
              <Card className="shadow-sm border-slate-200">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    No Customer Selected
                  </h3>
                  <p className="text-slate-500">
                    Please select a customer from the Customers tab to view
                    their contacts.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-0">
            {selectedCustomer ? (
              <div>
                <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {customersData.customers.find(
                            (c) => c.acno === selectedCustomer
                          )?.acname || "Selected Customer"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Account #{selectedCustomer}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("customers")}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Customers
                    </Button>
                  </div>
                </div>
                <SalesTable />
              </div>
            ) : (
              <Card className="shadow-sm border-slate-200">
                <CardContent className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    No Customer Selected
                  </h3>
                  <p className="text-slate-500">
                    Please select a customer from the Customers tab to view
                    their sales items.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal for Add/Edit */}
        <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {modalType === "add" ? (
                  <Plus className="h-5 w-5 text-blue-600" />
                ) : (
                  <Edit3 className="h-5 w-5 text-blue-600" />
                )}
                {modalType === "add" ? "Add" : "Edit"}{" "}
                {modalTab === "customers"
                  ? "Customer"
                  : modalTab === "party"
                  ? "Contact"
                  : "Sales Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ModalForm />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {modalType === "add" ? "Add" : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null, tab: "" })}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600">
                Are you sure you want to delete this{" "}
                {deleteConfirm.tab === "customers"
                  ? "customer"
                  : deleteConfirm.tab === "contacts"
                  ? "contact"
                  : "sales item"}
                ? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteConfirm({ open: false, id: null, tab: "" })
                }
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerManagementDashboard;
