"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  CreditCard,
  UserCheck,
  Plus,
  Save,
  Search,
  Upload,
  Trash2,
  Edit3,
  DollarSign,
  Calendar,
  Package,
} from "lucide-react";

const CustomerMasterForm = () => {
  const [isActive, setIsActive] = useState(true);
  const [customerData, setCustomerData] = useState({
    customer: "",
    detailAdd: "",
    area: "",
    city: "",
    zip: "",
    province: "SIND",
    region: "SOUTH",
    phoneFax: "",
    email: "",
    category: "",
    crDaysC: "",
    crDaysM: "",
    crLimit: "",
    shippingAddress: "",
    ntn: "",
    stReg: "Registered",
    strn: "",
    dealingStaff: "",
    salesPerson: "",
  });

  const [priceList, setPriceList] = useState([
    { mm: "", inkCode: "", materialDescription: "", date: "", rate: "" },
  ]);

  const [customerManagement, setCustomerManagement] = useState([
    { name: "", designation: "", contact: "" },
  ]);

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPriceListRow = () => {
    setPriceList(prev => [
      ...prev,
      { mm: "", inkCode: "", materialDescription: "", date: "", rate: "" }
    ]);
  };

  const removePriceListRow = (index) => {
    setPriceList(prev => prev.filter((_, i) => i !== index));
  };

  const updatePriceListRow = (index, field, value) => {
    setPriceList(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addManagementRow = () => {
    setCustomerManagement(prev => [
      ...prev,
      { name: "", designation: "", contact: "" }
    ]);
  };

  const removeManagementRow = (index) => {
    setCustomerManagement(prev => prev.filter((_, i) => i !== index));
  };

  const updateManagementRow = (index, field, value) => {
    setCustomerManagement(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    console.log("Saving customer data:", {
      customerData,
      priceList,
      customerManagement,
      isActive
    });
    // Handle save logic here
  };

  const handleQueryResult = () => {
    console.log("Query result clicked");
    // Handle query logic here
  };

  const handlePostQuery = () => {
    console.log("Post query clicked");
    // Handle post query logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-8 rounded-xl shadow-xl"
          >
            <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
              <User className="h-8 w-8" />
              Customer Master
            </h1>
            <p className="text-blue-100 mt-2">Comprehensive customer management system</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Basic Data */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6" />
                  Basic Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Customer Name & Status */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="customer" className="text-sm font-medium text-gray-700 mb-2 block">
                      Customer Name
                    </Label>
                    <Input
                      id="customer"
                      value={customerData.customer}
                      onChange={(e) => handleInputChange("customer", e.target.value)}
                      placeholder="Enter customer name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pb-2">
                    <Checkbox
                      id="in-active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      className="border-gray-300"
                    />
                    <Label htmlFor="in-active" className="text-sm font-medium text-gray-700">
                      In-Active
                    </Label>
                  </div>
                </div>

                {/* Detail Address */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Detail Address
                  </Label>
                  <Textarea
                    value={customerData.detailAdd}
                    onChange={(e) => handleInputChange("detailAdd", e.target.value)}
                    placeholder="Enter detailed address"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Area
                    </Label>
                    <Input
                      value={customerData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      placeholder="Area"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      City
                    </Label>
                    <Input
                      value={customerData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Zip Code
                    </Label>
                    <Input
                      value={customerData.zip}
                      onChange={(e) => handleInputChange("zip", e.target.value)}
                      placeholder="Zip"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Province & Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Province
                    </Label>
                    <Select value={customerData.province} onValueChange={(value) => handleInputChange("province", value)}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIND">SIND</SelectItem>
                        <SelectItem value="PUNJAB">PUNJAB</SelectItem>
                        <SelectItem value="KPK">KPK</SelectItem>
                        <SelectItem value="BALOCHISTAN">BALOCHISTAN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Region
                    </Label>
                    <Select value={customerData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOUTH">SOUTH</SelectItem>
                        <SelectItem value="NORTH">NORTH</SelectItem>
                        <SelectItem value="EAST">EAST</SelectItem>
                        <SelectItem value="WEST">WEST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone/Fax
                    </Label>
                    <Input
                      value={customerData.phoneFax}
                      onChange={(e) => handleInputChange("phoneFax", e.target.value)}
                      placeholder="Phone/Fax number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email address"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </Label>
                  <Input
                    value={customerData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="Customer category"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Credit Information */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-medium text-blue-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credit Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        CR Days(C)
                      </Label>
                      <Input
                        type="number"
                        value={customerData.crDaysC}
                        onChange={(e) => handleInputChange("crDaysC", e.target.value)}
                        placeholder="Days"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        CR Days(M)
                      </Label>
                      <Input
                        type="number"
                        value={customerData.crDaysM}
                        onChange={(e) => handleInputChange("crDaysM", e.target.value)}
                        placeholder="Days"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        CR Limit
                      </Label>
                      <Input
                        type="number"
                        value={customerData.crLimit}
                        onChange={(e) => handleInputChange("crLimit", e.target.value)}
                        placeholder="Credit limit"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </Label>
                  <Textarea
                    value={customerData.shippingAddress}
                    onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                    placeholder="Enter shipping address"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>

                {/* Tax Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      NTN
                    </Label>
                    <Input
                      value={customerData.ntn}
                      onChange={(e) => handleInputChange("ntn", e.target.value)}
                      placeholder="NTN number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      ST Reg
                    </Label>
                    <Select value={customerData.stReg} onValueChange={(value) => handleInputChange("stReg", value)}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Registered">Registered</SelectItem>
                        <SelectItem value="Non-Registered">Non-Registered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      STRN
                    </Label>
                    <Input
                      value={customerData.strn}
                      onChange={(e) => handleInputChange("strn", e.target.value)}
                      placeholder="STRN number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Staff Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Dealing Staff
                    </Label>
                    <Input
                      value={customerData.dealingStaff}
                      onChange={(e) => handleInputChange("dealingStaff", e.target.value)}
                      placeholder="Staff name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sales Person
                    </Label>
                    <Input
                      value={customerData.salesPerson}
                      onChange={(e) => handleInputChange("salesPerson", e.target.value)}
                      placeholder="Sales person name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Price List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-2">
                      <Package className="h-6 w-6" />
                      Product Price List
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={addPriceListRow}
                      className="bg-white/20 hover:bg-white/30 border-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-80">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-center w-16">MM#</TableHead>
                          <TableHead className="text-center">Ink Code</TableHead>
                          <TableHead className="text-center">Material Description</TableHead>
                          <TableHead className="text-center w-32">Date</TableHead>
                          <TableHead className="text-center w-24">Rate</TableHead>
                          <TableHead className="text-center w-16">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {priceList.map((item, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="p-2">
                              <Input
                                value={item.mm}
                                onChange={(e) => updatePriceListRow(index, "mm", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="MM#"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={item.inkCode}
                                onChange={(e) => updatePriceListRow(index, "inkCode", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="Code"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={item.materialDescription}
                                onChange={(e) => updatePriceListRow(index, "materialDescription", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="Description"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                type="date"
                                value={item.date}
                                onChange={(e) => updatePriceListRow(index, "date", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                type="number"
                                value={item.rate}
                                onChange={(e) => updatePriceListRow(index, "rate", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="Rate"
                              />
                            </TableCell>
                            <TableCell className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removePriceListRow(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-4 bg-gray-50 border-t flex justify-center gap-2">
                    <Button variant="outline" size="sm" className="text-gray-600">
                      Replace Data
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600">
                      Material List (Excel)
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600">
                      Rates Upload New Proc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Management */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-2">
                      <Building className="h-6 w-6" />
                      Customer Management
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={addManagementRow}
                      className="bg-white/20 hover:bg-white/30 border-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-center">Name</TableHead>
                          <TableHead className="text-center">Designation</TableHead>
                          <TableHead className="text-center">Contact</TableHead>
                          <TableHead className="text-center w-16">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerManagement.map((item, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="p-2">
                              <Input
                                value={item.name}
                                onChange={(e) => updateManagementRow(index, "name", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="Full name"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={item.designation}
                                onChange={(e) => updateManagementRow(index, "designation", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="Designation"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={item.contact}
                                onChange={(e) => updateManagementRow(index, "contact", e.target.value)}
                                className="border-gray-200 text-sm h-8"
                                placeholder="Contact info"
                              />
                            </TableCell>
                            <TableCell className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeManagementRow(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl shadow-lg border border-yellow-200"
        >
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              Save
            </Button>
            <Button
              onClick={handleQueryResult}
              variant="outline"
              className="bg-white hover:bg-blue-50 text-blue-600 border-blue-300 px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              Query Result
            </Button>
            <Button
              onClick={handlePostQuery}
              variant="outline"
              className="bg-white hover:bg-purple-50 text-purple-600 border-purple-300 px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Post Query
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerMasterForm;