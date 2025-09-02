'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Users, ShoppingCart, Building2, Filter } from 'lucide-react';

const VendorManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ city: '', category: '', area: '', salesArea: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState('edit');
  const [formData, setFormData] = useState({});
  const [vendorsData, setVendorsData] = useState({ vendors: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: currentPage.toString(), limit: '10', search: searchTerm, ...filters });
    const res = await fetch(`/api/forms/vendors?${params}`);
    const data = await res.json();
    setVendorsData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, [currentPage, searchTerm, filters]);

  const handleSubmit = async () => {
    await fetch(`/api/vendors`, {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    setModalIsOpen(false);
    setFormData({});
    fetchVendors();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, isDisabled: checked }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const openModal = (type, data) => {
    setModalType(type);
    setFormData(data || {});
    setModalIsOpen(true);
  };

  const VendorTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6}>Loading...</TableCell>
          </TableRow>
        ) : vendorsData.vendors.map((vendor) => (
          <TableRow key={vendor.acno}>
            <TableCell>{vendor.acno}</TableCell>
            <TableCell>{vendor.acname}</TableCell>
            <TableCell>{vendor.city}</TableCell>
            <TableCell>{vendor.email}</TableCell>
            <TableCell>{vendor.category}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => openModal('edit', vendor)}>
                <Edit3 className="h-4 w-4 mr-1" /> Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const VendorForm = () => (
    <div className="grid grid-cols-2 gap-4">
      <Input name="acno" value={formData.acno || ''} disabled placeholder="Code" />
      <Input name="acname" value={formData.acname || ''} onChange={handleInputChange} placeholder="Name" />
      <Input name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="Detail Address" />
      <Input name="area" value={formData.area || ''} onChange={handleInputChange} placeholder="Area" />
      <Input name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="City" />
      <Input name="phoneFax" value={formData.phoneFax || ''} onChange={handleInputChange} placeholder="Phone/Fax" />
      <Input name="salesArea" value={formData.salesArea || ''} onChange={handleInputChange} placeholder="Sales Person" />
      <Input name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} placeholder="Contact Person" />
      <div className="flex items-center space-x-2">
        <Checkbox id="disable" checked={formData.isDisabled || false} onCheckedChange={handleCheckboxChange} />
        <label htmlFor="disable">Disable</label>
      </div>
      <Select onValueChange={handleSelectChange} value={formData.type || ''}>
        <SelectTrigger>
          <SelectValue placeholder="Select Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="regular">Regular</SelectItem>
          {/* Add more options if needed */}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendor Master</h1>

        <div className="flex items-center justify-between my-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search..."
                className="pl-10 w-80"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input name="city" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} placeholder="City" />
                  <Input name="category" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} placeholder="Category" />
                  <Input name="area" value={filters.area} onChange={(e) => handleFilterChange('area', e.target.value)} placeholder="Area" />
                  <Input name="salesArea" value={filters.salesArea} onChange={(e) => handleFilterChange('salesArea', e.target.value)} placeholder="Sales Area" />
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" onClick={() => setFilters({ city: '', category: '', area: '', salesArea: '' })}>Clear</Button>
                  <Button onClick={() => setShowFilters(false)}>Apply</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <VendorTable />

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Page {currentPage} of {Math.ceil(vendorsData.total / 10)}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(vendorsData.total / 10)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagementDashboard;