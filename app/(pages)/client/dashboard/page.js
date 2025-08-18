"use client";
import Header from "@/components/Others/breadcumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast, Toaster } from "sonner";

import axios from '@/lib/axiosInstance';
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  DollarSign,
  Loader2,
  Users,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  LabelList,
  YAxis,
} from "recharts";
import { RiAddBoxLine } from "react-icons/ri";

// ----------QUICK ACTIONS------------
import {
  Clock,
  FileText,
  Headset,
  UserPlus,
  NotepadText,
  Bell,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/Others/spinner";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username;
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");
  const [payrollData, setPayrollData] = useState([]);
  const [empData, setEmpData] = useState([]);
  const [payslipData, setPayslipData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  // ----------QUICK ACTIONS------------
  const quickActions = [
    {
      icon: <RiAddBoxLine className="h-4 w-4" />,
      label: "Add Time Entry",
      href: "/client/attendance",
    },
    {
      icon: <UserPlus className="h-4 w-4" />,
      label: "Add Employee",
      href: "/client/employee",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Approve Time",
      href: "/client/approvals",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Run Report",
      href: "/client/reports",
    },
    {
      icon: <Headset className="h-4 w-4" />,
      label: "Help Desk",
      href: "/client/helpdesk",
    },
  ];

  // ----------QUICK ACTIONS------------

  const handleQuickAction = (label) => {
    toast.success(`Quick action initiated: ${label}`);
  };

  const generateReminders = (
    empData,
    helpdeskData = [],
    leaveRequests = []
  ) => {
    const newReminders = [];

    const employeeNameMap = empData.reduce((acc, emp) => {
      acc[emp.employeeId] = `${emp.firstName} ${emp.surname || ""}`.trim();
      return acc;
    }, {});

    //Leave requests
    leaveRequests.forEach((req) => {
      if (req.status === "Pending") {
        const employeeName = employeeNameMap[req.employeeId] || req.employeeId;
        newReminders.push({
          text: `Leave request pending for ${employeeName}`,
          urgent: true,
        });
      }
    });

    //Resigned employees
    empData.forEach((emp) => {
      if (emp.status === "RESIGNED") {
        newReminders.push({
          text: `Employee ${emp.firstName} has resigned`,
          urgent: true,
        });
      }
    });

    //Recently added employees
    const sevenDaysAgo = new Date();
    // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // empData.forEach((emp) => {
    //   const created = new Date(emp.createdOn);
    //   if (created > sevenDaysAgo) {
    //     newReminders.push({
    //       text: `New employee added: ${emp.firstName}`,
    //       urgent: false,
    //     });
    //   }
    // });

    //Help Desk
    const openTickets = helpdeskData.filter(
      (ticket) => ticket.status === "open"
    );
    if (openTickets.length > 0) {
      newReminders.push({
        text: `${openTickets.length} help desk ticket(s) need attention`,
        urgent: true,
      });
    }

    setReminders(newReminders);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [employeeRes, payrollRes, payslipRes, helpdeskRes, leaveRes] =
          await Promise.all([
            axios.get(`/api/employees?employerId=${employerId}`),
            axios.get(`/api/payroll/payroll-process?employerId=${employerId}`),
            axios.get(
              `/api/payroll/payslip?startDate=2025-02-01&endDate=2025-03-31&employerId=${employerId}`
            ),
            // axios.get(`/api/helpdesk/admin?employeeId=${employerId}`),
            axios
              .get(
                `/api/users/request?type=leave&status=Pending&employerId=${employerId}`
              )
              .catch(() => ({ data: [] })),
          ]);

        const empData = employeeRes.data.data || [];
        const helpdeskData = helpdeskRes.data.data || [];
        const leaveRequests = leaveRes?.data || [];

        setEmpData(empData);
        setPayrollData(payrollRes.data.data);
        setPayslipData(payslipRes.data);

        generateReminders(empData, helpdeskData, leaveRequests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employerId]);

  const statusColors = {
    Draft: "bg-yellow-100 text-yellow-800",
    Pending: "bg-blue-100 text-blue-800",
    "Partially Approved": "bg-purple-100 text-purple-800",
    Approved: "bg-green-100 text-green-800",
  };

  const totalPayroll = payslipData.reduce(
    (acc, payslip) => acc + payslip.payrollBreakdown.netPayable,
    0
  );
  const totalEmployees = payslipData.length;
  const totalDeductions = payslipData.reduce(
    (acc, payslip) => acc + payslip.payrollBreakdown.deductions.total,
    0
  );
  const avgDeductions = totalDeductions / totalEmployees;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      currency: "USD",
    }).format(amount);
  };

  const payrollStats = [
    {
      icon: DollarSign,
      title: "Total Payroll",
      value: formatCurrency(totalPayroll),
      change: "+5.2%",
    },
    {
      icon: Users,
      title: "Active Employees",
      value: empData.length,
      change: "+3.1%",
    },
    {
      icon: Calculator,
      title: "Avg. Deductions",
      value: formatCurrency(avgDeductions),
      change: "-2.3%",
    },
    {
      icon: Wallet,
      title: "Net Payments",
      value: formatCurrency(totalPayroll),
      change: "+4.8%",
    },
  ];

  // const payrollStats = [
  //   {
  //     icon: DollarSign,
  //     title: "Total Payroll",
  //     value: `$${(totalPayroll / 1000).toFixed(1)}k`,
  //     change: "+5.2%",
  //   },
  //   {
  //     icon: Users,
  //     title: "Active Employees",
  //     value: empData.length,
  //     change: "+3.1%",
  //   },
  //   {
  //     icon: Calculator,
  //     title: "Avg. Deductions",
  //     value: `$${avgDeductions.toFixed(0)}`,
  //     change: "-2.3%",
  //   },
  //   {
  //     icon: Wallet,
  //     title: "Net Payments",
  //     value: `$${(totalPayroll / 1000).toFixed(1)}k`,
  //     change: "+4.8%",
  //   },
  // ];

  // Process employee data and consolidate financial data by employee ID
  const processEmployeeData = (empData, payslipData) => {
    // Objects to store consolidated data by employee ID
    const payeByEmployee = {};
    const npfByEmployee = {};
    const accByEmployee = {};

    // Process each employee
    empData.forEach((employee) => {
      const employeeId = employee.employeeId;

      // Initialize data objects for this employee
      payeByEmployee[employeeId] = {
        employeeId,
        name: employee.firstName,
        paye: 0,
      };

      npfByEmployee[employeeId] = {
        employeeId,
        name: employee.firstName,
        employee: 0,
        employer: 0,
      };

      accByEmployee[employeeId] = {
        employeeId,
        name: employee.firstName,
        amount: 0,
      };

      // Filter payslips for this specific employee
      const employeePayslips = payslipData.filter(
        (payslip) => payslip.employeeId === employeeId
      );

      // Sum up values across all payslips for this employee
      employeePayslips.forEach((payslip) => {
        // Add PAYE amount
        payeByEmployee[employeeId].paye +=
          payslip.payrollBreakdown.deductions.paye || 0;

        // Add NPF amounts
        npfByEmployee[employeeId].employee +=
          payslip.payrollBreakdown.deductions.npf || 0;
        npfByEmployee[employeeId].employer +=
          payslip.payrollBreakdown.employerContributions.npf || 0;

        // Add ACC amount
        accByEmployee[employeeId].amount +=
          payslip.payrollBreakdown.deductions.acc || 0;
      });
    });

    // Convert objects to arrays for final output
    const payeData = Object.values(payeByEmployee);
    const npfData = Object.values(npfByEmployee);
    const accData = Object.values(accByEmployee);

    return {
      payeData,
      npfData,
      accData,
    };
  };

  // Example usage
  const { employeeRecords, payeData, npfData, accData } = processEmployeeData(
    empData,
    payslipData
  );
  // Example usage
  console.log("EmployeeRecords", employeeRecords);
  console.log("PayeData", payeData);
  console.log("NpfData", npfData);
  console.log("AccData", accData);

  const months = [
    "January",
    "Febuary",
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
  const transformedData = months.map((month, index) => {
    const dataFromEmployee = payeData[index];
    if (!dataFromEmployee) {
      return {
        month,
        paye: 0,
        netPay: 0,
        employee: 0,
        employer: 0,
        accAmount: 0,
      };
    }
    const npfDataForEmployee = npfData.find(
      (npf) => npf.employeeId === dataFromEmployee.employeeId
    );
    const accDataForEmployee = accData.find(
      (acc) => acc.employeeId === dataFromEmployee.employeeId
    );
    return {
      employeeId: dataFromEmployee.employeeId,
      name: dataFromEmployee.name,
      month,
      PAYE: dataFromEmployee.paye.toFixed(2) ,
      NetPay: (dataFromEmployee.netPay)|| 0,
      Employee: npfDataForEmployee ? npfDataForEmployee.employee.toFixed(2) : 0,
      Employer: npfDataForEmployee ? npfDataForEmployee.employer.toFixed(2) : 0,
      ACC: accDataForEmployee ? accDataForEmployee.amount.toFixed(2) : 0,
    };
  });

  const expenseData = [
    {
      category: "Salaries",
      amount: totalPayroll,
      percentage: (totalPayroll / (totalPayroll + totalDeductions)) * 100,
    },
    {
      category: "Deductions",
      amount: totalDeductions,
      percentage: (totalDeductions / (totalPayroll + totalDeductions)) * 100,
    },
  ];

  const employeeGenderData = (() => {
    const maleCount = empData.filter(
      (emp) => emp.gender?.toLowerCase() === "male"
    ).length;
    const femaleCount = empData.filter(
      (emp) => emp.gender?.toLowerCase() === "female"
    ).length;

    return [
      { name: "Males", Male: maleCount },
      { name: "Females", Female: femaleCount },
    ];
  })();

  const COLORS = {
    primary: ["#FF0000", "#0284c7", "#0369a1"],
    secondary: ["#14b8a6", "#0d9488", "#0f766e"],
    accent: ["#f59e0b", "#d97706", "#b45309"],
    neutral: ["#6b7280", "#4b5563", "#374151"],
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

const calculateDaysUntilPayday  = (payrollData) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

    console.log("pautol Data :",payrollData)

  // Find payrolls for current month & year, and not yet passed
  const upcomingPayrolls = payrollData
    .filter((p) => 
      p.month_no === currentMonth &&
      p.year === currentYear &&
      new Date(p.date_to) >= today
    )
    .sort((a, b) => new Date(a.date_to) - new Date(b.date_to)); // closest first

    console.log("UPCOMIG :",upcomingPayrolls)

  if (upcomingPayrolls.length === 0) {
    return null; // or return "No upcoming payrolls this month"
  }

  const nextPayroll = new Date(upcomingPayrolls[0].date_to);
  console.log("Nmext Payroll: ", nextPayroll)
  const daysUntil = Math.ceil((nextPayroll - today) / (1000 * 60 * 60 * 24));
    console.log("Nmex: ", daysUntil)

  return daysUntil;
};



  return (
    <>
      <div className="min-h-screen bg-gray-50  mb-6">
        <div className="max-w-screen-2xl mx-auto md:px-[3%]">
          <Header heading="Dashboard" />

          <div className="p-4 pb-2 ml-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base text-md sm:text-4xl font-semibold">
                Dashboard
              </h3>
            </div>
          </div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <LoadingSpinner />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5"
            >
              {/* -------  LEFT_COL ------ */}
              <div className="lg:col-span-2 space-y-6">
                <div className="px-4 sm:px-6 py-5 w-full bg-white border border-gray-200  shadow-md p-4 flex items-center justify-end rounded-3xl gap-4">
                  <h2 className="text-sm sm:text-2xl font-bold text-muted-foreground ">
                    {calculateDaysUntilPayday(payrollData)} days until payday
                  </h2>
                  <Image
                    src="/uploads/images/cal-image.png"
                    alt=""
                    width={80}
                    height={80}
                  />
                  {/* <span className="font-bold">Calendar icon</span> */}
                </div>
                <CardTitle className="text-lg sm:text-xl flex justify-between space-y-1.5 p-1 py-3">
                  Employee Summary
                  <div className="relative">
                    <select
                      className="border-none text-[16px] font-normal  p-2 rounded-md text-muted-foreground flex items-center cursor-pointer pr-12 appearance-none outline-none"
                      // value={sortOption}
                      // onChange={handleSortChange}
                    >
                      <option value="monthly">This Month</option>
                      <option value="yearly">This Year</option>
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-1.5 w-7 h-7 "
                      fill="#d4d4d4"
                      strokeWidth={0}
                    />
                  </div>
                </CardTitle>

                <motion.div
                  className="
                   grid grid-cols-1 
                   sm:grid-cols-1
                   lg:grid-cols-2 gap-6"
                  variants={containerVariants}
                >
                  <Card className="bg-white border-gray-200">
                    <div className="flex items-center justify-between px-6">
                      <div className="flex flex-col pt-5 gap-2 text-center">
                        <p className="xl:text-[18px] text-[15px] text-muted-foreground">
                          Active Employees
                        </p>
                        <div className="md:text-[28px] text-md font-medium">
                          {payrollStats[1]?.value}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center ">
                        <div className="flex justify-center md:w-36">
                          <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={employeeGenderData} barGap={-35}>
                              <Bar
                                dataKey="Male"
                                fill="#4a90e2"
                                radius={[5, 5, 5, 5]}
                              />
                              <Bar
                                dataKey="Female"
                                fill="#d6758e"
                                radius={[5, 5, 5, 5]}
                              />
                              <Tooltip cursor={{ fill: "transparent" }} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex justify-evenly gap-4 ml-2.5 w-full">
                          <span className="text-md text-foreground">Males</span>
                          <span className="text-md text-foreground">Females</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* The other Card for the stats */}
                  <Card className="bg-white border-gray-200 h-auto">
                    <div className="flex flex-col justify-center gap-8 px-5 py-8">
                      {payrollStats
                        .filter((stat) => stat.title !== "Active Employees")
                        .map((stat) => (
                          <div
                            className="flex justify-between"
                            key={stat.title}
                          >
                            <p className="sm:text-[15px] text-sm text-muted-foreground">
                              {stat.title}
                            </p>
                            <div className="sm:text-[15px] text-sm font-semibold">
                              {stat.value}
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </motion.div>

                {/* <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-gray-200">
                    <div className="flex items-center justify-between px-5">
                      <div className="flex flex-col pt-5 gap-2 text-center">
                        <p className="sm:text-[18px] text-[15px] text-muted-foreground">
                          Active Employees
                        </p>
                        <div className="md:text-[28px] text-md font-medium">
                          {payrollStats[1]?.value}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="flex justify-center  w-32">
                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={employeeGenderData} barGap={-25}>
                              <Bar dataKey="male" fill="#4a90e2">
                                <LabelList
                                  dataKey="name"
                                  position="bottom"
                                  fill="#4a90e2"
                                  fontSize={12}
                                />
                              </Bar>
                              <Bar dataKey="female" fill="#d6758e">
                                <LabelList
                                  dataKey="name"
                                  position="bottom"
                                  fill="#d6758e"
                                  fontSize={12}
                                />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex justify-between w-full">
                          <span className="text-sm text-gray-500">Male</span>
                          <span className="text-sm text-gray-500">Female</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white border-gray-200 h-auto">
                    <div className="flex flex-col justify-center gap-8 px-5 py-8">
                      {payrollStats
                        .filter((stat) => stat.title !== "Active Employees")
                        .map((stat) => (
                          <div
                            className="flex justify-between "
                            key={stat.title}
                          >
                            <p className="sm:text-[15px] text-sm text-muted-foreground">
                              {stat.title}
                            </p>
                            <div className="sm:text-[15px] text-sm font-semibold">
                              {stat.value}
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </motion.div> */}

                <Tabs defaultValue="paye">
                  <TabsContent value="paye">
                    <Card className=" border-none bg-transparent shadow-inherit">
                      <CardHeader className="py-6 mb-8 p-1">
                        <CardTitle className="text-lg sm:text-xl flex justify-between ">
                          Payroll Cost Summary
                          <div className="relative ">
                            <select
                              className="border-none text-[16px] font-normal  p-2 rounded-md text-muted-foreground flex items-center cursor-pointer pr-12 appearance-none outline-none"
                              // value={sortOption}
                              // onChange={handleSortChange}
                            >
                              <option value="monthly">This Year</option>
                              <option value="yearly">This Month</option>
                            </select>
                            <ChevronDown
                              className="absolute right-2 top-1.5  w-7 h-7 "
                              fill="#d4d4d4"
                              strokeWidth={0}
                            />
                          </div>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="h-64 xs:h-80 sm:h-96 p-1 md:h-[400px] lg:h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={transformedData} barCategoryGap="25%">
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="month"
                              stackId="a"
                              axisLine={false}
                              tickLine={false}
                              fill="#d4d4d4"
                              radius={[0, 0, 4, 4]}
                            />
                            <YAxis axisLine={false} />
                            <Tooltip />
                            
                            <Bar dataKey="NetPay" stackId="a" fill="#FF0000" />
                            <Bar dataKey="PAYE" stackId="a" fill="#FF4500" />
                            <Bar
                              dataKey="Employee"
                              stackId="a"
                              fill="#FF6347"
                            />
                            <Bar
                              dataKey="ACC"
                              stackId="a"
                              fill="#FF7F50"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>

                      <div className="">
                        <Legend
                          payload={[
                            {
                              value: "Net Pay",
                              type: "square",
                              color: "#FF0000",
                            },
                            { value: "PAYE", type: "square", color: "#FF4500" },
                            { value: "NPF", type: "square", color: "#FF6347" },
                            { value: "ACC", type: "square", color: "#FF7F50" },
                          ]}
                          wrapperStyle={{
                            bottom: "inherit",
                            transform: "translateX(50%)",
                          }}
                          formatter={(value) => {
                            return (
                              <span style={{ color: "black" }}>{value}</span>
                            );
                          }}
                        />
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* ------  RIGHT_COL ------- */}
              <div className="lg:col-span-1 space-y-6">
                <motion.div
                  variants={cardVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white border border-gray-200 rounded-lg shadow-md md:mt-0 mt-3  p-4"
                >
                  <div className="font-bold text-lg mb-2">Reminders</div>
                  <div className="space-y-2">
                    {reminders.map((reminder, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2  rounded-md ${
                          reminder.urgent
                            ? " text-black-700"
                            : "bg-muted/10 text-foreground"
                        }`}
                      >
                        <span className="h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                          <Bell size={12} fill="white" />
                        </span>
                        <div className="text-sm text-foreground">
                          {reminder.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="">
                      <div className="grid grid-cols-1 gap-3">
                        {quickActions.map((action, index) => (
                          <Link
                            key={index}
                            href={action.href}
                            passHref
                            legacyBehavior
                          >
                            <Button
                              variant="outline"
                              key={index}
                              // whileHover={{ scale: 1.02, x: 5 }}
                              // whileTap={{ scale: 0.98 }}
                              onClick={() => handleQuickAction(action.label)}
                              className="h-10 text-sm justify-start px-3 border-gray-200 w-full"
                            >
                              <span className="mr-2">{action.icon}</span>

                              <span className="flex-1 text-left">
                                {action.label}
                              </span>
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* </div> */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
