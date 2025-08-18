"use client";
import Header from "@/components/Others/breadcumb";
import LoadingSpinner from "@/components/Others/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import axios from "@/lib/axiosInstance";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  DollarSign,
  FileSpreadsheet,
  FileText,
  PieChart,
  Search,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ModernPayrollDashboard = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username;

  const [reportType, setReportType] = useState("payroll");
  const [periodType, setPeriodType] = useState("monthly");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: new Date().getFullYear() + 5 - 2020 },
    (_, i) => 2020 + i
  );

  const aggregatePayslips = (payslips, periodType) => {
    const grouped = {};
    const employeeNames = {};

    payslips.forEach((payslip) => {
      if (
        !employeeNames[payslip.employeeId] ||
        payslip.employeeName.length > employeeNames[payslip.employeeId].length
      ) {
        employeeNames[payslip.employeeId] = payslip.employeeName;
      }
    });

    payslips.forEach((payslip) => {
      const periodKey =
        periodType === "monthly"
          ? `${payslip.monthNo}-${payslip.year}`
          : periodType === "fortnightly"
          ? Math.ceil(payslip.weekNo / 2)
          : payslip.weekNo;

      const key = `${payslip.employeeId}-${periodKey}-${payslip.year}`;

      if (!grouped[key]) {
        grouped[key] = {
          employeeId: payslip.employeeId,
          employeeName: employeeNames[payslip.employeeId],
          npfNumber: payslip.npfNumber,
          employerId: payslip.employerId,
          weekNo: payslip.weekNo,
          monthNo: payslip.monthNo,
          year: payslip.year,
          payrollBreakdown: {
            baseSalary: 0,
            allowances: 0,
            deductions: { paye: 0, npf: 0, acc: 0, total: 0 },
            employerContributions: { npf: 0, acc: 0 },
            netPayable: 0,
          },
        };
      }

      const entry = grouped[key];
      const breakdown = payslip.payrollBreakdown;

      entry.payrollBreakdown.baseSalary += breakdown.baseSalary;
      entry.payrollBreakdown.allowances += breakdown.allowances;
      entry.payrollBreakdown.deductions.paye += breakdown.deductions.paye;
      entry.payrollBreakdown.deductions.npf += breakdown.deductions.npf;
      entry.payrollBreakdown.deductions.acc += breakdown.deductions.acc;
      entry.payrollBreakdown.deductions.total += breakdown.deductions.total;
      entry.payrollBreakdown.employerContributions.npf +=
        breakdown.employerContributions.npf;
      entry.payrollBreakdown.employerContributions.acc +=
        breakdown.employerContributions.acc;
      entry.payrollBreakdown.netPayable += breakdown.netPayable;
    });

    if (periodType === "monthly") {
      const monthlyConsolidated = {};
      Object.values(grouped).forEach((entry) => {
        const uniqueKey = `${entry.employeeId}-${entry.monthNo}-${entry.year}`;
        if (!monthlyConsolidated[uniqueKey]) {
          monthlyConsolidated[uniqueKey] = entry;
        }
      });
      return Object.values(monthlyConsolidated);
    }

    if (periodType === "fortnightly") {
      const fortnightlyGrouped = {};
      Object.values(grouped).forEach((entry) => {
        const fortnightNo = Math.ceil(entry.weekNo / 2);
        const key = `${entry.employeeId}-${fortnightNo}-${entry.year}`;

        if (!fortnightlyGrouped[key]) {
          fortnightlyGrouped[key] = {
            ...entry,
            weekRange: `${fortnightNo * 2 - 1}-${fortnightNo * 2}`,
          };
        } else {
          const target = fortnightlyGrouped[key].payrollBreakdown;
          const source = entry.payrollBreakdown;

          target.baseSalary += source.baseSalary;
          target.allowances += source.allowances;
          target.deductions.paye += source.deductions.paye;
          target.deductions.npf += source.deductions.npf;
          target.deductions.acc += source.deductions.acc;
          target.deductions.total += source.deductions.total;
          target.employerContributions.npf += source.employerContributions.npf;
          target.employerContributions.acc += source.employerContributions.acc;
          target.netPayable += source.netPayable;
        }
      });
      return Object.values(fortnightlyGrouped);
    }

    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await fetch(
          `/api/payroll/payslip?employerId=${employerId}&startDate=${startDate}&endDate=${endDate}&periodType=${periodType}`
        );
        const data = await response.json();
        const aggregatedData = aggregatePayslips(data, periodType);
        setPayslips(aggregatedData);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchPayslips();
  }, [startDate, endDate, periodType]);

  useEffect(() => {
    if (payslips.length > 0) {
      const fetchEmployeeDetails = async () => {
        try {
          const response = await axios.get(
            `/api/employees?employerId=${employerId}`
          );

          // Handle different response formats
          let employees = [];

          // Case 1: Response is an array
          if (Array.isArray(response.data)) {
            employees = response.data;
          }
          // Case 2: Response is an object with data property
          else if (Array.isArray(response.data?.data)) {
            employees = response.data.data;
          }
          // Case 3: Response is an object with employees property
          else if (Array.isArray(response.data?.employees)) {
            employees = response.data.employees;
          }
          // Case 4: Convert object to array if needed
          else if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            employees = Object.values(response.data);
          }

          // Final check to ensure we have an array
          if (!Array.isArray(employees)) {
            console.error("Invalid employees data format:", response.data);
            employees = []; // Fallback to empty array
          }

          const methods = {};
          employees.forEach((emp) => {
            methods[emp.employeeId] =
              emp.paymentMethod === "DIRECT DEPOSIT" ||
              emp.paymentMethod === "CHEQUE"
                ? "EFT"
                : "Cash";
          });

          setPaymentMethod(methods);
          setEmployees(employees); // Store the full employee data
        } catch (error) {
          console.error("Error fetching employee details:", error);
          // Fallback to default Cash if error occurs
          const methods = {};
          payslips.forEach((p) => {
            methods[p.employeeId] = "Cash";
          });
          setPaymentMethod(methods);
        }
      };

      fetchEmployeeDetails();
    }
  }, [payslips, employerId]);
  const calculateStats = () => ({
    totalEmployees: new Set(payslips.map((p) => p.employeeId)).size,
    totalPayroll: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.netPayable,
      0
    ),
    totalPAYE: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.deductions.paye,
      0
    ),
    totalNPF: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.deductions.npf,
      0
    ),
    totalACC: payslips.reduce(
      (sum, p) => sum + p.payrollBreakdown.deductions.acc,
      0
    ),
  });

  const stats = calculateStats();

  const getTableContent = () => {
    const filtered = payslips.filter((p) =>
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const payrollTotal = filtered.reduce(
      (acc, p) => ({
        salary: acc.salary + p.payrollBreakdown.baseSalary,
        allowances: acc.allowances + p.payrollBreakdown.allowances,
        deductions: acc.deductions + p.payrollBreakdown.deductions.total,
        total:
          acc.total +
          (p.payrollBreakdown.baseSalary +
            p.payrollBreakdown.allowances -
            p.payrollBreakdown.deductions.total),
      }),
      { salary: 0, allowances: 0, deductions: 0, total: 0 }
    );

    const payeTotal = filtered.reduce(
      (acc, p) => ({
        salary: acc.salary + p.payrollBreakdown.baseSalary,
        paye: acc.paye + p.payrollBreakdown.deductions.paye,
      }),
      { salary: 0, paye: 0 }
    );

    const npfTotal = filtered.reduce(
      (acc, p) => ({
        empContribution:
          acc.empContribution + p.payrollBreakdown.deductions.npf,
        employerContribution:
          acc.employerContribution +
          p.payrollBreakdown.employerContributions.npf,
        total:
          acc.total +
          (p.payrollBreakdown.deductions.npf +
            p.payrollBreakdown.employerContributions.npf),
      }),
      { empContribution: 0, employerContribution: 0, total: 0 }
    );

    const accTotal = filtered.reduce(
      (acc, p) => ({
        empContribution:
          acc.empContribution + p.payrollBreakdown.deductions.acc,
        employerContribution:
          acc.employerContribution +
          p.payrollBreakdown.employerContributions.acc,
        total:
          acc.total +
          (p.payrollBreakdown.deductions.acc +
            p.payrollBreakdown.employerContributions.acc),
      }),
      { empContribution: 0, employerContribution: 0, total: 0 }
    );

    const configs = {
      payroll: {
        headers: [
          "Employee",
          "Period",
          "Salary",
          "Overtime",
          "Allowances",
          "Deductions",
          "Total",
        ],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            periodType === "monthly"
              ? format(new Date(p.year, p.monthNo - 1), "MMMM yyyy")
              : periodType === "fortnightly"
              ? `Fortnight ${Math.ceil(p.weekNo / 2)}`
              : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            "$0.00",
            `$${p.payrollBreakdown.allowances.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.total.toFixed(2)}`,
            `$${(
              p.payrollBreakdown.baseSalary +
              p.payrollBreakdown.allowances -
              p.payrollBreakdown.deductions.total
            ).toFixed(2)}`,
          ]),
          [
            "Total",
            "",
            `$${payrollTotal.salary.toFixed(2)}`,
            "$0.00",
            `$${payrollTotal.allowances.toFixed(2)}`,
            `$${payrollTotal.deductions.toFixed(2)}`,
            `$${payrollTotal.total.toFixed(2)}`,
          ],
        ],
      },
      paye: {
        headers: ["Employee", "Period", "Salary", "PAYE Amount"],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            periodType === "monthly"
              ? format(startDate, "MMMM yyyy")
              : periodType === "fortnightly"
              ? `Fortnight ${Math.ceil(p.weekNo / 2)}`
              : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.paye.toFixed(2)}`,
          ]),
          [
            "Total",
            "",
            `$${payeTotal.salary.toFixed(2)}`,
            `$${payeTotal.paye.toFixed(2)}`,
          ],
        ],
      },
      npf: {
        headers: [
          "Employee",
          "NPF Number",
          "Period",
          "Salary",
          "Employee Contribution",
          "Employer Contribution",
          "Total",
        ],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            p.npfNumber || "N/A",
            periodType === "monthly"
              ? format(startDate, "MMMM yyyy")
              : periodType === "fortnightly"
              ? `Fortnight ${Math.ceil(p.weekNo / 2)}`
              : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.npf.toFixed(2)}`,
            `$${p.payrollBreakdown.employerContributions.npf.toFixed(2)}`,
            `$${(
              p.payrollBreakdown.deductions.npf +
              p.payrollBreakdown.employerContributions.npf
            ).toFixed(2)}`,
          ]),
          [
            "Total",
            "",
            "",
            "",
            `$${npfTotal.empContribution.toFixed(2)}`,
            `$${npfTotal.employerContribution.toFixed(2)}`,
            `$${npfTotal.total.toFixed(2)}`,
          ],
        ],
      },
      acc: {
        headers: [
          "Employee",
          "NPF Number",
          "Period",
          "Salary",
          "Employee Contribution",
          "Employer Contribution",
          "Total",
        ],
        rows: [
          ...filtered.map((p) => [
            p.employeeName,
            p.npfNumber || "N/A",
            periodType === "monthly"
              ? format(startDate, "MMMM yyyy")
              : periodType === "fortnightly"
              ? `Fortnight ${Math.ceil(p.weekNo / 2)}`
              : `Week ${p.weekNo}`,
            `$${p.payrollBreakdown.baseSalary.toFixed(2)}`,
            `$${p.payrollBreakdown.deductions.acc.toFixed(2)}`,
            `$${p.payrollBreakdown.employerContributions.acc.toFixed(2)}`,
            `$${(
              p.payrollBreakdown.deductions.acc +
              p.payrollBreakdown.employerContributions.acc
            ).toFixed(2)}`,
          ]),
          [
            "Total",
            "",
            "",
            "",
            `$${accTotal.empContribution.toFixed(2)}`,
            `$${accTotal.employerContribution.toFixed(2)}`,
            `$${accTotal.total.toFixed(2)}`,
          ],
        ],
      },
      payment: {
        headers: [
          "Employee",
          "Payment Method",
          "Bank Name",
          "Account Number",
          "Account Type",
          "Net Amount",
          "Rounded Amount",
        ],
        rows: [
          // Process Cash payments
          ...filtered
            .filter((p) => {
              const employee =
                employees.find((e) => e.employeeId === p.employeeId) || {};
              return employee.paymentMethod === "CASH";
            })
            .map((p) => {
              const employee =
                employees.find((e) => e.employeeId === p.employeeId) || {};
              return [
                `${employee.firstName} ${employee.middleName}`
                  .replace(/\s+/g, " ")
                  .trim(),
                "Cash",
                "", // No bank details for cash
                "",
                "",
                `$${p.payrollBreakdown.netPayable.toFixed(2)}`,
                `$${Math.round(p.payrollBreakdown.netPayable).toFixed(2)}`,
              ];
            }),

          // Process EFT payments (DIRECT DEPOSIT or CHEQUE)
          ...filtered
            .filter((p) => {
              const employee =
                employees.find((e) => e.employeeId === p.employeeId) || {};
              return (
                employee.paymentMethod === "DIRECT DEPOSIT" ||
                employee.paymentMethod === "CHEQUE"
              );
            })
            .map((p) => {
              const employee =
                employees.find((e) => e.employeeId === p.employeeId) || {};
              return [
                `${employee.firstName}`.replace(/\s+/g, " ").trim(),
                employee.paymentMethod === "DIRECT DEPOSIT" ? "EFT" : "EFT",
                employee.bankName || "N/A",
                employee.accountNumber || "N/A",
                employee.accountName || "N/A",
                `$${p.payrollBreakdown.netPayable.toFixed(2)}`,
                `$${Math.round(p.payrollBreakdown.netPayable).toFixed(2)}`,
              ];
            }),

          // Calculate totals
          [
            "GRAND TOTAL",
            "",
            "",
            "",
            "",
            `$${filtered
              .reduce((sum, p) => sum + p.payrollBreakdown.netPayable, 0)
              .toFixed(2)}`,
            `$${filtered
              .reduce(
                (sum, p) => sum + Math.round(p.payrollBreakdown.netPayable),
                0
              )
              .toFixed(2)}`,
          ],
        ],
      },
    };
    if (reportType === "npfc") {
      return {
        headers: [
          "NPF #",
          "Employee Name",
          "Transaction Type",
          "Employee",
          "Employer",
          "Total",
        ],
        rows: [
          ...filtered.map((p) => [
            p.npfNumber || "N/A",
            p.employeeName,
            "Compulsory",
            `$${p.payrollBreakdown.deductions.npf.toFixed(2)}`, // Employee Contribution
            `$${p.payrollBreakdown.employerContributions.npf.toFixed(2)}`, // Employer Contribution
            `$${(
              p.payrollBreakdown.deductions.npf +
              p.payrollBreakdown.employerContributions.npf
            ).toFixed(2)}`, // Total
          ]),
          [
            "Total",
            "",
            "",
            `$${filtered
              .reduce((sum, p) => sum + p.payrollBreakdown.deductions.npf, 0)
              .toFixed(2)}`,
            `$${filtered
              .reduce(
                (sum, p) => sum + p.payrollBreakdown.employerContributions.npf,
                0
              )
              .toFixed(2)}`,
            `$${filtered
              .reduce(
                (sum, p) =>
                  sum +
                  p.payrollBreakdown.deductions.npf +
                  p.payrollBreakdown.employerContributions.npf,
                0
              )
              .toFixed(2)}`,
          ],
        ],
      };
    }

    return configs[reportType] || configs.payroll;
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      console.log("Export Format:", format);
      // console.log("Request URL:", /api/export/${reportType}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}&employerId=${employerId}&periodType=${periodType});

      const response = await axios.get(
        `
        /api/export/${reportType}?startDate=${startDate}&endDate=${endDate}&format=${format}&employerId=${employerId}&periodType=${periodType}`,
        {
          responseType: "blob",
          headers: {
            Accept:
              format === "pdf"
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (response.status !== 200 || !response.data) {
        throw new Error("Export failed");
      }

      const contentType = response.headers["content-type"];
      console.log("Response Content-Type:", contentType);

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Set the correct file extension based on format
      const extension = format === "pdf" ? "pdf" : "xlsx";
      a.download = `${reportType}-report-${startDate.getFullYear()}-${
        startDate.getMonth() + 1
      }.${extension}`;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Export error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (reportType === "npfc") {
      setPeriodType("monthly");
    }
  }, [reportType]);

  useEffect(() => {
    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0);
    setStartDate(start);
    setEndDate(end);
  }, [selectedMonth, selectedYear]);

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payroll Reports" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className=" border-white/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Payroll Reports
                </h1>
                <p className="text-foreground/70">
                  Manage and track all payroll reports in one place
                </p>
              </div>

              <div className="flex flex-col xs:flex-row gap-4">

                <div className="flex gap-2">
                  {/* Month Selector */}
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="shadow bg-background border-background/10 text-foreground hover:text-background hover:bg-red_foreground">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Year Selector */}
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="shadow bg-background border-background/10 text-foreground hover:text-background hover:bg-red_foreground">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background/10"
                    onClick={() => handleExport("xlsx")}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background/10"
                    onClick={() => handleExport("pdf")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
                <Input
                  placeholder="Search employee..."
                  className="pl-10 bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { type: "payroll", label: "Payroll" },
                { type: "paye", label: "PAYE" },
                { type: "npf", label: "NPF" },
                { type: "acc", label: "ACC" },
                {
                  type: "npfc",
                  label: "NPF Schedule",
                },
                { type: "payment", label: "Payments" },
              ].map(({ type, label }) => (
                <Button
                  key={type}
                  variant={reportType === type ? "default" : "outline"}
                  onClick={() => setReportType(type)}
                  className={`flex items-center gap-2 shadow ${
                    reportType === type
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-background/5 border-background/10 text-foreground hover:bg-red_foreground"
                  }`}
                >
                  
                  {label}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  className="flex justify-center items-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSpinner />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative rounded-lg border border-text_background/10 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red_foreground ">
                          {getTableContent().headers.map((header, index) => (
                            <TableHead
                              key={index}
                              className="text-background font-medium py-3 px-4"
                            >
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTableContent().rows.map((row, rowIndex) => (
                          <TableRow
                            key={rowIndex}
                            className="border-b border-text_background/10 "
                          >
                            {row.map((cell, cellIndex) => (
                              <TableCell
                                key={cellIndex}
                                className={`text-foreground py-3 px-4 ${
                                  rowIndex === getTableContent().rows.length - 1
                                    ? "font-bold bg-background/5"
                                    : ""
                                }`}
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernPayrollDashboard;
