'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, 
  Users, ShoppingCart, Building2, Filter, Mail, Phone,
  MapPin, Calendar, DollarSign, Hash, X, Eye
} from 'lucide-react';
import axios from 'axios';

const CustomerManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ city: '', category: '', area: '', salesArea: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [modalTab, setModalTab] = useState('customers');
  const [formData, setFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, tab: '' });
  const [customersData, setCustomersData] = useState({ customers: [], total: 0 });
  const [contacts, setContacts] = useState([]);
  const [salesItems, setSalesItems] = useState([]);
  const [loading, setLoading] = useState({ customers: false, contacts: false, sales: false });
  
  // Separate search states for each tab
  const [searchStates, setSearchStates] = useState({
    customers: '',
    contacts: '',
    sales: ''
  });

  const updateSearchState = (tab, value) => {
    setSearchStates(prev => ({ ...prev, [tab]: value }));
    setCurrentPage(1);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const params = new URLSearchParams({ 
        page: currentPage.toString(), 
        limit: '10', 
        search: searchStates.customers, 
        ...filters 
      });
      const response = await axios.get(`/api/forms/customers?${params}`);
      setCustomersData(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
    setLoading(prev => ({ ...prev, customers: false }));
  }, [currentPage, searchStates.customers, filters]);

  const fetchContacts = useCallback(async () => {
    if (!selectedCustomer || activeTab !== 'party') return;
    setLoading(prev => ({ ...prev, contacts: true }));
    try {
      const params = new URLSearchParams({ acno: selectedCustomer.toString(), search: searchStates.contacts });
      const response = await axios.get(`/api/forms/contacts?${params}`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
    setLoading(prev => ({ ...prev, contacts: false }));
  }, [selectedCustomer, searchStates.contacts, activeTab]);

  const fetchSalesItems = useCallback(async () => {
    if (!selectedCustomer || activeTab !== 'sales') return;
    setLoading(prev => ({ ...prev, sales: true }));
    try {
      const params = new URLSearchParams({ acno: selectedCustomer.toString(), search: searchStates.sales });
      const response = await axios.get(`/api/forms/sales-items?${params}`);
      setSalesItems(response.data);
    } catch (error) {
      console.error('Error fetching sales items:', error);
    }
    setLoading(prev => ({ ...prev, sales: false }));
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
      if (modalTab === 'party' || modalTab === 'sales-items') {
        data.acno = selectedCustomer;
      }
      if (modalTab === 'sales-items' && !data.dateD) {
        data.dateD = new Date().toISOString();
      }

      if (modalType === 'add') {
        await axios.post(`/api/${modalTab}`, data);
      } else {
        await axios.put(`/api/${modalTab}`, data);
      }

      setModalIsOpen(false);
      setFormData({});
      
      if (modalTab === 'customers') fetchCustomers();
      if (modalTab === 'party') fetchContacts();
      if (modalTab === 'sales-items') fetchSalesItems();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const key = deleteConfirm.tab === 'customers' ? 'acno' : 'id';
      await axios.delete(`/api/${deleteConfirm.tab}`, {
        data: { [key]: deleteConfirm.id }
      });
      
      setDeleteConfirm({ open: false, id: null, tab: '' });
      
      if (deleteConfirm.tab === 'customers') fetchCustomers();
      if (deleteConfirm.tab === 'contacts') fetchContacts();
      if (deleteConfirm.tab === 'sales-items') fetchSalesItems();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const openModal = (type, tab, data) => {
    setModalType(type);
    setModalTab(tab);
    setFormData(data || {});
    setModalIsOpen(true);
  };

  const clearFilters = () => {
    setFilters({ city: '', category: '', area: '', salesArea: '' });
    setCurrentPage(1);
  };

  const ActionButton = ({ onClick, variant = "ghost", size = "sm", icon: Icon, children, className = "" }) => (
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
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
      />
    </div>
  );

  const CustomerTable = () => (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Customer Directory
            <Badge variant="secondary" className="ml-2">{customersData.total}</Badge>
          </CardTitle>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <SearchBox
              value={searchStates.customers}
              onChange={(value) => updateSearchState('customers', value)}
              placeholder="Search customers..."
              className="w-full sm:w-80"
            />
            <div className="flex gap-2">
              {Object.values(filters).some(f => f) && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-slate-600">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button onClick={() => openModal('add', 'customers')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Input 
            placeholder="Filter by city..." 
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-32 h-8 text-sm"
          />
          <Input 
            placeholder="Category..." 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-32 h-8 text-sm"
          />
          <Input 
            placeholder="Area..." 
            value={filters.area}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className="w-32 h-8 text-sm"
          />
          <Input 
            placeholder="Sales Area..." 
            value={filters.salesArea}
            onChange={(e) => handleFilterChange('salesArea', e.target.value)}
            className="w-32 h-8 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Account
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Category</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.customers ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-slate-500">Loading customers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customersData.customers.map((customer, index) => (
                <TableRow 
                  key={customer.acno} 
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-mono text-sm font-medium text-slate-700">
                    #{customer.acno}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">{customer.acname}</div>
                    <div className="text-sm text-slate-500">{customer.area}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="h-3 w-3" />
                      {customer.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {customer.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <ActionButton 
                        onClick={() => openModal('edit', 'customers', customer)} 
                        icon={Edit3}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </ActionButton>
                      <ActionButton 
                        onClick={() => { setSelectedCustomer(customer.acno); setActiveTab('party'); }}
                        icon={Users}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        Contacts
                      </ActionButton>
                      <ActionButton 
                        onClick={() => { setSelectedCustomer(customer.acno); setActiveTab('sales'); }}
                        icon={ShoppingCart}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        Sales
                      </ActionButton>
                      <ActionButton 
                        onClick={() => setDeleteConfirm({ open: true, id: customer.acno, tab: 'customers' })}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, customersData.total)} of {customersData.total} customers
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, Math.ceil(customersData.total / 10)) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(customersData.total / 10)}
              className="hover:bg-slate-50"
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
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Contact Directory
            <Badge variant="secondary" className="ml-2">{contacts.length}</Badge>
          </CardTitle>
          <div className="flex gap-3 w-full sm:w-auto">
            <SearchBox
              value={searchStates.contacts}
              onChange={(value) => updateSearchState('contacts', value)}
              placeholder="Search contacts..."
              className="w-full sm:w-64"
            />
            <Button 
              onClick={() => openModal('add', 'party', { acno: selectedCustomer })} 
              className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Name
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Designation</TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.contacts ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="text-slate-500">Loading contacts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No contacts found for this customer
                  </TableCell>
                </TableRow>
              ) : contacts.map((contact, index) => (
                <TableRow 
                  key={contact.id} 
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-mono text-sm font-medium text-slate-700">
                    #{contact.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">{contact.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {contact.designation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Phone className="h-3 w-3" />
                      <span className="font-mono text-sm">{contact.contact}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <ActionButton 
                        onClick={() => openModal('edit', 'party', { ...contact, acno: selectedCustomer })}
                        icon={Edit3}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </ActionButton>
                      <ActionButton 
                        onClick={() => setDeleteConfirm({ open: true, id: contact.id, tab: 'contacts' })}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const SalesTable = () => (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-purple-600" />
            Sales Items
            <Badge variant="secondary" className="ml-2">{salesItems.length}</Badge>
          </CardTitle>
          <div className="flex gap-3 w-full sm:w-auto">
            <SearchBox
              value={searchStates.sales}
              onChange={(value) => updateSearchState('sales', value)}
              placeholder="Search sales items..."
              className="w-full sm:w-64"
            />
            <Button 
              onClick={() => openModal('add', 'sales-items', { acno: selectedCustomer })} 
              className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Item Code</TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Rate
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">GST Rate</TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.sales ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="text-slate-500">Loading sales items...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : salesItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No sales items found for this customer
                  </TableCell>
                </TableRow>
              ) : salesItems.map((item, index) => (
                <TableRow 
                  key={item.id} 
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-mono text-sm font-medium text-slate-700">
                    #{item.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">#{item.itcd}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">{item.rate?.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.gst_rate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{new Date(item.dateD).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <ActionButton 
                        onClick={() => openModal('edit', 'sales-items', { ...item, acno: selectedCustomer })}
                        icon={Edit3}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </ActionButton>
                      <ActionButton 
                        onClick={() => setDeleteConfirm({ open: true, id: item.id, tab: 'sales-items' })}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const ModalForm = () => {
    if (modalTab === 'customers') {
      return (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
            <Input
              name="acno"
              value={formData.acno || ''}
              onChange={handleInputChange}
              placeholder="Enter account number"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <Input
              name="acname"
              value={formData.acname || ''}
              onChange={handleInputChange}
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
            <Input
              name="city"
              value={formData.city || ''}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <Input
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="Enter email address"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <Input
              name="category"
              value={formData.category || ''}
              onChange={handleInputChange}
              placeholder="Enter category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Area</label>
            <Input
              name="area"
              value={formData.area || ''}
              onChange={handleInputChange}
              placeholder="Enter area"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Sales Area</label>
            <Input
              name="salesArea"
              value={formData.salesArea || ''}
              onChange={handleInputChange}
              placeholder="Enter sales area"
            />
          </div>
        </div>
      );
    } else if (modalTab === 'party') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <Input
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Enter contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
            <Input
              name="designation"
              value={formData.designation || ''}
              onChange={handleInputChange}
              placeholder="Enter designation"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
            <Input
              name="contact"
              value={formData.contact || ''}
              onChange={handleInputChange}
              placeholder="Enter contact number"
            />
          </div>
        </div>
      );
    } else if (modalTab === 'sales-items') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Item Code</label>
            <Input
              name="itcd"
              value={formData.itcd || ''}
              onChange={handleInputChange}
              placeholder="Enter item code"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rate</label>
            <Input
              name="rate"
              value={formData.rate || ''}
              onChange={handleInputChange}
              placeholder="Enter rate"
              type="number"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">GST Rate (%)</label>
            <Input
              name="gst_rate"
              value={formData.gst_rate || ''}
              onChange={handleInputChange}
              placeholder="Enter GST rate"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <Input
              name="dateD"
              value={formData.dateD ? new Date(formData.dateD).toISOString().split('T')[0] : ''}
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Customer Management</h1>
              <p className="text-slate-600">Manage customers, contacts, and sales data</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-slate-200 p-1">
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="party" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              disabled={!selectedCustomer}
            >
              <Users className="h-4 w-4" />
              Contacts {selectedCustomer && <Badge variant="outline" className="ml-1">#{selectedCustomer}</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              disabled={!selectedCustomer}
            >
              <ShoppingCart className="h-4 w-4" />
              Sales {selectedCustomer && <Badge variant="outline" className="ml-1">#{selectedCustomer}</Badge>}
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
                          {customersData.customers.find(c => c.acno === selectedCustomer)?.acname || 'Selected Customer'}
                        </h3>
                        <p className="text-sm text-slate-600">Account #{selectedCustomer}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('customers')}
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
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No Customer Selected</h3>
                  <p className="text-slate-500">Please select a customer from the Customers tab to view their contacts.</p>
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
                          {customersData.customers.find(c => c.acno === selectedCustomer)?.acname || 'Selected Customer'}
                        </h3>
                        <p className="text-sm text-slate-600">Account #{selectedCustomer}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('customers')}
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
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No Customer Selected</h3>
                  <p className="text-slate-500">Please select a customer from the Customers tab to view their sales items.</p>
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
                {modalType === 'add' ? (
                  <Plus className="h-5 w-5 text-blue-600" />
                ) : (
                  <Edit3 className="h-5 w-5 text-blue-600" />
                )}
                {modalType === 'add' ? 'Add' : 'Edit'} {
                  modalTab === 'customers' ? 'Customer' :
                  modalTab === 'party' ? 'Contact' : 'Sales Item'
                }
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ModalForm />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                {modalType === 'add' ? 'Add' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, id: null, tab: '' })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600">
                Are you sure you want to delete this {
                  deleteConfirm.tab === 'customers' ? 'customer' :
                  deleteConfirm.tab === 'contacts' ? 'contact' : 'sales item'
                }? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null, tab: '' })}>
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