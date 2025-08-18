"use client";
import React, { useState, useEffect } from "react";
import axios from '@/lib/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Others/breadcumb";
import { useSession } from "next-auth/react";
import { Trash } from "lucide-react";

const PayrollPageComponent = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";

  // States for payroll data
  const [payrollIds, setPayrollIds] = useState([]);
  const [selectedPayrollId, setSelectedPayrollId] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState(null); // Store selected payroll details
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Additional states for allowances and deductions lists
  const [allowancesList, setAllowancesList] = useState([]);
  const [deductionsList, setDeductionsList] = useState([]);
  const [allowanceSearch, setAllowanceSearch] = useState("");
  const [deductionSearch, setDeductionSearch] = useState("");

  // States for allowance form
  const [allowanceForm, setAllowanceForm] = useState({
    allowance_id: "",
    rate: "",
    month_no: "",
    week_no: "",
    employeeId: "",
  });

  // States for deduction form
  const [deductionForm, setDeductionForm] = useState({
    deduction_id: "",
    rate: "",
    month_no: "",
    week_no: "",
    employeeId: "",
  });

  // States for displaying current allowances and deductions
  const [currentAllowances, setCurrentAllowances] = useState([]);
  const [currentDeductions, setCurrentDeductions] = useState([]);

  // States for employees
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Fetch allowances list
  useEffect(() => {
    const fetchAllowances = async () => {
      try {
        const response = await axios.get(
          `/api/employees/allownce?employerId=${employerId}`
        );
        setAllowancesList(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch allowances");
      }
    };

    fetchAllowances();
  }, [employerId]);

  // Fetch deductions list
  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const response = await axios.get(
          `/api/employees/deduction?employerId=${employerId}`
        );
        setDeductionsList(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch deductions");
      }
    };

    fetchDeductions();
  }, [employerId]);

  // Filter functions
  const filteredAllowances = allowancesList.filter((allowance) =>
    allowance.allownce.toLowerCase().includes(allowanceSearch.toLowerCase())
  );

  const filteredDeductions = deductionsList.filter((deduction) =>
    deduction.deduction.toLowerCase().includes(deductionSearch.toLowerCase())
  );

  // Handle allowance selection
  const handleAllowanceSelection = async (allowanceId) => {
    try {
      const response = await axios.get(
        `/api/employees/allownce/${allowanceId}`
      );
      const allowanceData = response.data.data;
      setAllowanceForm((prev) => ({
        ...prev,
        allowance_id: allowanceId,
        rate: allowanceData.rate,
      }));
    } catch (err) {
      setError("Failed to fetch allowance details");
    }
  };

  //handle Delete Allowance from payroll
  const handleDelete = async (id , type) => {
 
    if(type === "Allowance"){


      try {
        const response = await axios.delete(`/api/payroll/payrollAllownce`,{
          data:{_id: id},
        })

        if (response.data.success) {
          setCurrentAllowances((prev) => {
        
            // Return the filtered array, where deductions with the matching _id are removed
            return prev.filter((allowance) => {
              return allowance._id !== id; // Only keep deductions where _id is not equal to the passed id
            });
          });
        }

        alert('Allownce deleted successfully');

      } catch (error) {
        console.error('Error deleting Allownce:', error);
        alert('Failed to delete Allownce');
      }

    }

    else if(type==="Deduction"){
      try {
        const response = await axios.delete(`/api/payroll/payrollDeduction`,{
          data:{_id: id},
        })

        if (response.data.success) {
          setCurrentDeductions((prev) => {
        
            // Return the filtered array, where deductions with the matching _id are removed
            return prev.filter((deduction) => {
              return deduction._id !== id; // Only keep deductions where _id is not equal to the passed id
            });
          });
        }

        alert('Deduction deleted successfully');

      } catch (error) {
        console.error('Error deleting Deduction:', error);
        alert('Failed to delete Deduction');
      }
    }

  }

  // Handle deduction selection
  const handleDeductionSelection = async (deductionId) => {
    try {
      const response = await axios.get(
        `/api/employees/deduction/${deductionId}`
      );
      const deductionData = response.data.data;
      setDeductionForm((prev) => ({
        ...prev,
        deduction_id: deductionId,
        rate: deductionData.rate,
      }));
    } catch (err) {
      setError("Failed to fetch deduction details");
    }
  };

  // Fetch payroll IDs on component mount
  useEffect(() => {
    const fetchPayrollIds = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/payroll/payroll-process?employerId=${employerId}`
        );
        setPayrollIds(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch payroll IDs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollIds();
  }, [employerId]);

  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `/api/employees?employerId=${employerId}`
        );
        setEmployees(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch employees");
      }
    };

    fetchEmployees();
  }, []);

  // Fetch payroll details when payroll ID changes
  useEffect(() => {
    const fetchPayrollDetails = async () => {
      if (!selectedPayrollId) return;

      setIsLoading(true);
      try {
        // Fetch payroll details
        const payrollResponse = await axios.get(
          `/api/payroll/payroll-process/${selectedPayrollId}`
        );
        const payrollData = payrollResponse.data.data;
        console.log("Ded:" + payrollData);
        setSelectedPayroll(payrollData);

        // Pre-fill month_no and week_no in forms
        setAllowanceForm((prev) => ({
          ...prev,
          month_no: payrollData.month_no,
          week_no: payrollData.week_no,
        }));
        setDeductionForm((prev) => ({
          ...prev,
          month_no: payrollData.month_no,
          week_no: payrollData.week_no,
        }));

        // Fetch current allowances and deductions
        const responseAllownce = await axios.get(
          `/api/payroll/payrollAllownce/${selectedPayrollId}`
        );
        const responseDeduction = await axios.get(
          `/api/payroll/payrollDeduction/${selectedPayrollId}`
        );

        setCurrentAllowances(responseAllownce.data.data || []);
        setCurrentDeductions(responseDeduction.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollDetails();
  }, [selectedPayrollId]);

  // Handle adding new allowance
  const handleAddAllowance = async (e) => {
    e.preventDefault();
    if (!selectedPayrollId) return;

    setIsLoading(true);
    try {
      const payload = {
        ...allowanceForm,
        payroll_id: selectedPayrollId,
        employerId: employerId,
      };

      const response = await axios.post(
        "/api/payroll/payrollAllownce",
        payload
      );

      // Add new allowance to current list
      setCurrentAllowances([...currentAllowances, response.data.data]);

      // Reset form
      setAllowanceForm({
        allowance_id: "",
        rate: "",
        month_no: selectedPayroll?.month_no || "",
        week_no: selectedPayroll?.week_no || "",
        employeeId: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add allowance");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding new deduction
  const handleAddDeduction = async (e) => {
    e.preventDefault();
    if (!selectedPayrollId) return;

    setIsLoading(true);
    try {
      const payload = {
        ...deductionForm,
        payroll_id: selectedPayrollId,
        employerId: employerId,
      };

      const response = await axios.post(
        "/api/payroll/payrollDeduction",
        payload
      );

      // Add new deduction to current list
      setCurrentDeductions([...currentDeductions, response.data.data]);

      // Reset form
      setDeductionForm({
        deduction_id: "",
        rate: "",
        month_no: selectedPayroll?.month_no || "",
        week_no: selectedPayroll?.week_no || "",
        employeeId: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add deduction");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees based on search input
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.surname.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Update the allowance form section
  const AllowanceFormSection = () => <></>;

  // Update the deduction form section
  const DeductionFormSection = () => <></>;

  return (
    <>
      <Header heading="Payroll Management" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Payroll Selection */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Select Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedPayrollId}
              onValueChange={setSelectedPayrollId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Payroll ID" />
              </SelectTrigger>
              <SelectContent>
                {payrollIds.map((payroll) => (
                  <SelectItem key={payroll.payroll_id} value={payroll.payroll_id}>
                    Payroll ID: {payroll.payroll_id}<br/>
                    Start Date: {new Date(payroll.date_from).toLocaleDateString()}<br/>
                    End Date: {new Date(payroll.date_to).toLocaleDateString()}

                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedPayrollId && (
          <>
            {/* Add Allowance Form */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Add Allowance</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleAddAllowance}
                  className="flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Allowance
                    </label>
                    <Select
                      value={allowanceForm.allowance_id}
                      onValueChange={handleAllowanceSelection}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Allowance" />
                      </SelectTrigger>
                      <SelectContent>
                        <Input
                          type="text"
                          placeholder="Search allowances..."
                          value={allowanceSearch}
                          onChange={(e) => setAllowanceSearch(e.target.value)}
                        />

                        {filteredAllowances.length > 0 ? (
                          filteredAllowances.map((allowance) => (
                            <SelectItem
                              key={allowance._id}
                              value={allowance._id}
                              className="cursor-pointer"
                            >
                              {allowance.allownce}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            No allowances found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Amount
                    </label>
                    <Input
                      type="number"
                      value={allowanceForm.rate}
                      onChange={(e) =>
                        setAllowanceForm({
                          ...allowanceForm,
                          rate: e.target.value,
                        })
                      }
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Month
                    </label>
                    <Input
                      type="text"
                      value={allowanceForm.month_no}
                      onChange={(e) =>
                        setAllowanceForm({
                          ...allowanceForm,
                          month_no: e.target.value,
                        })
                      }
                      placeholder="Enter month (e.g., 01)"
                      required
                      disabled // Pre-filled from payroll
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Week
                    </label>
                    <Input
                      type="text"
                      value={allowanceForm.week_no}
                      onChange={(e) =>
                        setAllowanceForm({
                          ...allowanceForm,
                          week_no: e.target.value,
                        })
                      }
                      placeholder="Enter week number"
                      required
                      disabled // Pre-filled from payroll
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Employee
                    </label>
                    <Select
                      value={allowanceForm.employeeId}
                      onValueChange={(value) =>
                        setAllowanceForm({
                          ...allowanceForm,
                          employeeId: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <Input
                          placeholder="Search employees..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="mb-2"
                        />
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee) => (
                            <SelectItem key={employee._id} value={employee._id}>
                              {employee.firstName} {employee.surname}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            No employees found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    Add Allowance
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Add Deduction Form */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Add Deduction</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleAddDeduction}
                  className="flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Deduction
                    </label>
                    <Select
                      value={deductionForm.deduction_id}
                      onValueChange={handleDeductionSelection}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Deduction" />
                      </SelectTrigger>
                      <SelectContent>
                        <Input
                          type="text"
                          placeholder="Search deductions..."
                          value={deductionSearch}
                          onChange={(e) => setDeductionSearch(e.target.value)}
                        />
                        {filteredDeductions.length > 0 ? (
                          filteredDeductions.map((deduction) => (
                            <SelectItem
                              key={deduction._id}
                              value={deduction._id}
                              className="cursor-pointer"
                            >
                              {deduction.deduction}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            No deductions found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Amount
                    </label>
                    <Input
                      type="text"
                      value={deductionForm.rate}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          rate: e.target.value,
                        })
                      }
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Month
                    </label>
                    <Input
                      type="text"
                      value={deductionForm.month_no}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          month_no: e.target.value,
                        })
                      }
                      placeholder="Enter month (e.g., 01)"
                      required
                      disabled // Pre-filled from payroll
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Week
                    </label>
                    <Input
                      type="number"
                      value={deductionForm.week_no}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          week_no: e.target.value,
                        })
                      }
                      placeholder="Enter week number"
                      required
                      disabled // Pre-filled from payroll
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Employee
                    </label>
                    <Select
                      value={deductionForm.employeeId}
                      onValueChange={(value) =>
                        setDeductionForm({
                          ...deductionForm,
                          employeeId: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <Input
                          placeholder="Search employees..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="mb-2"
                        />
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee) => (
                            <SelectItem key={employee._id} value={employee._id}>
                              {employee.firstName} {employee.surname}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            No employees found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    Add Deduction
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Allowances Table */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Current Allowances</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead>Allowance ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Week</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Action</TableHead>

                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAllowances.map((allowance, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell>
                          {allowancesList
                            .filter(
                              (allownce) =>
                                allownce._id === allowance.allowance_id
                            ) // Filter based on employee ID
                            .map((allowance) => (
                              <div key={allowance._id}>
                                {allowance.allownce}
                              </div>
                            ))}
                        </TableCell>
                        <TableCell>${allowance.rate}</TableCell>
                        <TableCell>{allowance.month_no}</TableCell>
                        <TableCell>{allowance.week_no}</TableCell>
                        <TableCell>
                          {" "}
                          {employees
                            .filter(
                              (employee) =>
                                employee._id === allowance.employeeId
                            ) // Filter based on employee ID
                            .map((employee) => (
                              <div key={employee._id}>
                                {employee.firstName} {employee.surname}{" "}
                                {/* Display firstName and surname */}
                              </div>
                            ))}
                        </TableCell>
                        <TableCell>
        <button
          className="bg-foreground text-white p-2 rounded-full flex items-center justify-center"
          onClick={() => handleDelete(allowance._id , "Allowance")} // Call delete handler with deduction ID
        >
          <Trash size={10} />
        </button>
      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Current Deductions Table */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Current Deductions</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead>Deduction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Week</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Action</TableHead>

                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDeductions.map((deduction, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell>
                          {deductionsList
                            .filter(
                              (deduct) =>
                                deduct._id === deduction.deduction_id
                            ) // Filter based on employee ID
                            .map((deduct) => (
                              <div key={deduct._id}>
                                {deduct.deduction}
                              </div>
                            ))}
                        </TableCell>
                        <TableCell>${deduction.rate}</TableCell>
                        <TableCell>{deduction.month_no}</TableCell>
                        <TableCell>{deduction.week_no}</TableCell>
                        
                        <TableCell>
                          {employees
                            .filter(
                              (employee) =>
                                employee._id === deduction.employeeId
                            ) // Filter based on employee ID
                            .map((employee) => (
                              <div key={employee._id}>
                                {employee.firstName} {employee.surname}{" "}
                                {/* Display firstName and surname */}
                              </div>
                            ))}
                        </TableCell>
                        <TableCell>
        <button
          className="bg-foreground text-white p-2 rounded-full flex items-center justify-center"
          onClick={() => handleDelete(deduction._id , "Deduction")} // Call delete handler with deduction ID
        >
          <Trash size={10} />
        </button>
      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default PayrollPageComponent;
