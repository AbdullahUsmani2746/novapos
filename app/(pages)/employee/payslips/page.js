"use client";
import Header from "@/components/Others/breadcumb";
import { Badge } from "@/components/ui/badge";
import axios from '@/lib/axiosInstance';
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Calendar, Download, RefreshCw, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const PayslipPage = () => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username || null;
  const employerId = `CLIENT-${employeeId?.split("-")[0]}`;
  const [periods, setPeriods] = useState([]);
  const [filteredPeriods, setFilteredPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payslipData, setPayslipData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("month"); // "all", "month", "year"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [EmployeeData, setEmployeeData] = useState({});

  const Months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  // Fetch company settings from the settings API
  useEffect(() => {
    if (showModal && payslipData) {
      const fetchCompanySettings = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/setting/${employerId}`);
          if (response.status !== 200) {
            throw new Error("Failed to fetch company settings");
          }
          const data = response.data.data;
          setCompanySettings(data);
        } catch (error) {
          console.error("Error fetching company settings:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCompanySettings();
    }
  }, [showModal, payslipData]);

  // Fetch company settings from the settings API
  useEffect(() => {
    if (showModal && payslipData) {
      const fetchCompanySettings = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/employees/${employeeId}`);
          const responseDepartment = await axios.get(
            `/api/employees/department?employerId=${employerId}`
          );
          const responseJobTitle = await axios.get(
            `/api/employees/jobTitle?employerId=${employerId}`
          );

          if (response.status !== 200) {
            throw new Error("Failed to fetch Employee Data");
          }

          setEmployeeData(response.data.EmployeeData);
          const department = responseDepartment.data.data.find(
            (dept) => dept._id === response.data.EmployeeData.department
          );
          const jobTitle = responseJobTitle.data.data.find(
            (job) => job._id === response.data.EmployeeData.jobTitle
          );
          setEmployeeData((prev) => ({
            ...prev,
            department: department ? department.department : "N/A",
            jobTitle: jobTitle ? jobTitle.job_title : "N/A",
          }));
          console.log(response.data.EmployeeDJ);
        } catch (error) {
          console.error("Error fetching Employee Data", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCompanySettings();
    }
  }, [showModal, payslipData]);

  // Fetch leave balances from the leave API
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (!employeeId) return;
      try {
        setLeaveLoading(true);
        const employerId = `CLIENT-${employeeId.split("-")[0]}`;
        const response = await axios.get(
          `/api/users/leaveBalance?employeeId=${employeeId}`
        );
        const responseLeaves = await axios.get(
          `/api/employees/leave?employerId=${employerId}`
        );
        setLeaveBalances(response.data.leaveBalances || []);
        setLeaves(responseLeaves.data.data || []);
      } catch (error) {
        console.error("Error fetching leave balances:", error);
        toast.error("Failed to load leave balances");
      } finally {
        setLeaveLoading(false);
      }
    };
    fetchLeaveBalances();
  }, [employeeId]);

  // Fetch payroll periods when component mounts
  useEffect(() => {
    const fetchPayrollPeriods = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/payroll/payroll-process?employerId=${employerId}`
        );
        setPeriods(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch payroll periods:", err);
        setError("Failed to load payroll periods. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollPeriods();
  }, [employerId]);

  // Filter periods based on selected filter type
  useEffect(() => {
    if (periods.length === 0) {
      setFilteredPeriods([]);
      return;
    }

    let filtered = [...periods];

    if (filterType === "month") {
      filtered = filtered.filter(
        (period) =>
          period.month_no === selectedMonth && period.year === selectedYear
      );
    } else if (filterType === "year") {
      filtered = filtered.filter((period) => period.year === selectedYear);
    }

    setFilteredPeriods(filtered);
  }, [periods, filterType, selectedMonth, selectedYear]);

  // Handle Payslip Data
  const handleExtractPayslipData = (data, period) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("No payslip data received.");
      return;
    }

    // Normalize selected period dates
    const selectedStart = new Date(period.date_from).getTime();
    const selectedEnd = new Date(period.date_to).getTime();

    // Find matching payslip
    const matchingPayslip = data.find((item) => {
      const slipStart = new Date(item?.payPeriodDetails?.startDate).getTime();
      const slipEnd = new Date(item?.payPeriodDetails?.endDate).getTime();
      console.log("Slip Start:", slipStart, "Slip End:", slipEnd);
      console.log(
        "Selected Start:",
        selectedStart,
        "Selected End:",
        selectedEnd
      );
      return selectedStart >= slipStart && selectedEnd <= slipEnd;
    });

    if (matchingPayslip) {
      console.log("Matching payslip found:", matchingPayslip);
      setPayslipData(matchingPayslip);
      setShowModal(true);
    } else {
      console.warn("No matching payslip for selected period.");
      setError("No matching payslip found for the selected period.");
    }
  };

  // Handle period selection
  const handlePeriodSelect = async (period) => {
    // Check if period is pending or draft
    if (period.status === "pending" || period.status === "draft") {
      setError("Payslip not available for pending or draft periods.");
      return;
    }

    try {
      setLoading(true);
      setSelectedPeriod(period);
      setError(null);
      console.log(period);
      const response = await axios.get(
        `/api/payslips?startDate=${period?.date_from}&&endDate=${period?.date_to}&&employeeId=${employeeId}`
      );
      if (response.data) {
        handleExtractPayslipData(response.data, period);
        // setPayslipData(response.data);
        // setShowModal(true);
      } else {
        setError("Payslip not available for the selected period.");
      }
    } catch (err) {
      console.error("Failed to fetch payslip:", err);
      setError("Failed to load the payslip. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Format currency amounts
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const payslipElement = document.getElementById("payslip-content");

      if (!payslipElement) {
        console.error("Payslip element not found");
        return;
      }

      // Hide the download button temporarily
      const buttonContainer = payslipElement.querySelector(
        ".remove-on-download"
      );
      if (buttonContainer) buttonContainer.style.display = "none";

      // Create a clone of the element to avoid affecting the original
      const elementClone = payslipElement.cloneNode(true);
      elementClone.style.width = "800px"; // Set a fixed width for better scaling
      elementClone.style.position = "absolute";
      elementClone.style.left = "-9999px";
      document.body.appendChild(elementClone);

      // Apply PDF-specific styles
      const style = document.createElement("style");
      style.innerHTML = `
      .payments-table td, .payments-table th {
        padding: 2px 4px !important;
        margin: 0 !important;
        line-height: 1.7 !important;
      }
         .company-header p ,  .company-header span{
         
         margin: 0 !important;
        line-height: 1.5 !important;
         }
         .details-row .details-col *{
        margin: 0 !important;
        line-height: 1.2 !important;}
    `;
      elementClone.appendChild(style);

      // Use html2canvas with proper configuration
      const canvas = await html2canvas(elementClone, {
        scale: 2,
        scrollY: -window.scrollY,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        windowHeight: elementClone.scrollHeight,
      });

      // Remove the clone
      document.body.removeChild(elementClone);

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF with auto-height
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [imgWidth, imgHeight + 20], // Add extra space
      });

      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
      );
      // Restore the button
      if (buttonContainer) buttonContainer.style.display = "flex";

      // Save PDF
      const fileName = `Payslip-${Months[payslipData.monthNo]}-${
        payslipData.year
      }-Week-${payslipData.weekNo}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate years for dropdown (5 years back and 1 year forward)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Payslip" />

      <motion.div
        className="max-w-4xl mx-auto p-4 sm:p-6 md:px-0 md:py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white rounded-xl shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4 sm:mb-0">
              Select Payroll Period
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto p-2">
              <div className="relative">
                <select
                  className="appearance-none w-full px-4 py-2.5 bg-gray-50 text-foreground rounded-lg border border-foreground transition-all pr-10 text-sm font-medium"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Periods</option>
                  <option value="month">Filter by Month</option>
                  <option value="year">Filter by Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              {filterType === "month" && (
                <div className="flex flex-row gap-3">
                  <div className="relative">
                    <select
                      className="appearance-none w-full px-4 py-2.5 bg-gray-50 text-foreground rounded-lg border border-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all pr-10 text-sm font-medium"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {Object.entries(Months).map(([num, name]) => (
                        <option key={num} value={num}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      className="appearance-none w-full px-4 py-2.5 bg-gray-50 text-foreground rounded-lg border border-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all pr-10 text-sm font-medium"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {getYearOptions().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {filterType === "year" && (
                <div className="relative">
                  <select
                    className="appearance-none w-full px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all pr-10 text-sm font-medium"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading && !periods.length && (
            <motion.div
              className="flex flex-col items-center justify-center py-12"
              variants={itemVariants}
            >
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading payroll periods...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {!loading && filteredPeriods.length === 0 && !error && (
            <motion.div
              className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
              variants={itemVariants}
            >
              <p className="text-blue-700">
                No payroll periods found for the selected criteria. Please try a
                different filter.
              </p>
            </motion.div>
          )}

          {!loading && filteredPeriods.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              {filteredPeriods.map((period) => {
                const isPendingOrDraft =
                  period.status === "pending" || period.status === "draft";
                const isDisabled = isPendingOrDraft;

                return (
                  <motion.div
                    key={period._id}
                    className={`border rounded-lg p-4 transition-all ${
                      isDisabled
                        ? "opacity-70 cursor-not-allowed bg-gray-100"
                        : "cursor-pointer hover:shadow-md"
                    } ${
                      selectedPeriod?._id === period._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => !isDisabled && handlePeriodSelect(period)}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    variants={itemVariants}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-medium text-foreground">
                            {Months[period.month_no]} {period.year}
                          </h3>
                        </div>
                        <Badge
                          variant="default"
                          className={`ml-2 rounded-md ${
                            period.status === "pending" ||
                            period.status === "draft"
                              ? "bg-yellow-500 text-black"
                              : period.status === "approved"
                              ? "text-white bg-green-800"
                              : period.status === "partially_approved"
                              ? "text-white bg-blue-600"
                              : ""
                          }`}
                        >
                          {period.status === "pending" ||
                          period.status === "draft"
                            ? "Draft"
                            : period.status === "partially_approved"
                            ? "Partially Approved"
                            : period.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">
                        Week: {period.week_no}
                      </h3>
                    </div>
                    <p className="text-sm text-foreground mt-2">
                      {formatDate(period.date_from)} to{" "}
                      {formatDate(period.date_to)}
                    </p>
                    {isDisabled && (
                      <p className="text-xs text-red-500 mt-2 italic">
                        Payslip not available
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {showModal && payslipData && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center rounded-t-xl">
                <h3 className="text-xl font-semibold text-foreground">
                  Payslip - {Months[payslipData.monthNo]} {payslipData.year},
                  Week {payslipData.weekNo}
                </h3>
                <button
                  className="text-foreground"
                  onClick={() => setShowModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div id="payslip-content" className="p-6 overflow-y-auto flex-1">
                <div>
                  <style>
                    {`
    
    .payslip-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .details-col { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 8px; text-align: left; } /* Removed border property */
    .totals { display: flex; justify-content: space-between; margin: 15px 0; }
    .net-pay { font-weight: bold; margin: 20px 0; font-size: 18px; }
    .leave-balances { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px; }
    .leave-title { font-weight: bold; margin-bottom: 10px; }
    .leave-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .leave-item { display: flex; flex-direction: column; }
    .leave-label { font-weight: bold; }
    .employee-number { position: absolute; top: 20px; right: 20px; font-weight: bold; }
    .bold-text { font-weight: bold; }
    /* Added for better alignment like the PDF */
    .payments-table td, .payments-table th {
      padding: 4px 8px;
    }
    .payments-table {
      margin: 20px 0;
    }
  `}
                  </style>

                  {/* Company Header from Settings API */}
                  {
                    // companySettings ? (
                    //   <div className="company-header">
                    //     <h2>{companySettings.companyName}</h2>
                    //     <p>{companySettings.companyAddress}</p>
                    //     <p>
                    //       T: {companySettings.companyPhone} | E:{" "}
                    //       {companySettings.companyEmail}
                    //     </p>
                    //   </div>
                    // ) : (
                    <div className="flex items-center justify-center p-4 max-w-4xl mx-auto company-header">
                      {/* Logo section */}
                      <div className="mr-4">
                        <Image
                          src="/payslip_images/logo.png"
                          alt="Bravos Limited Logo"
                          width={100}
                          height={100}
                          className="h-auto"
                        />
                      </div>

                      {/* Text section */}
                      <div className="flex flex-col">
                        <h1 className=" text-xl font-bold tracking-wider">
                          <span className="text-3xl font-bold"> BRAVOS </span>{" "}
                          LIMITED
                        </h1>
                        <p className="text-xs mt-1 ">
                          2nd Floor, Potoi Building, Matafele, Apia, Samoa
                        </p>
                        <p className="text-xs mt-1 italic">
                          <span>T: (+685) 609061</span>
                          <span className="mx-2">|</span>
                          <span>E: team@bravoslimited.com</span>
                        </p>
                      </div>
                    </div>
                  }

                  <h1 className="payslip-title">PAYSLIP</h1>

                  {/* <div className="employee-number">
                    **{payslipData.employeeId}
                  </div> */}

                  <div className="details-row">
                    <div className="details-col">
                      <p>
                        <strong>Employee:</strong> {payslipData.employeeName}
                      </p>
                      <p>
                        <strong>Employee ID:</strong> {payslipData.employeeId}
                      </p>
                      <p>
                        <strong>Position:</strong> {EmployeeData.jobTitle}
                      </p>
                      <p>
                        <strong>Department:</strong> {EmployeeData.department}
                      </p>
                    </div>
                  </div>

                  <div className="details-row">
                    <div className="details-col">
                      <p>
                        <strong>Period:</strong>{" "}
                        {formatDate(payslipData.payPeriodDetails.startDate)} -{" "}
                        {formatDate(payslipData.payPeriodDetails.endDate)}
                      </p>
                      <p>
                        <strong>Pay Day:</strong>{" "}
                        {new Date(payslipData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Payments</th>
                        <th>Hours</th>
                        <th>Rate</th>
                        <th>Value</th>
                        <th>Deductions</th>
                        <th>Reference</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Normal Time</td>
                        <td>{payslipData.workDetails.totalWorkHours}</td>
                        <td>
                          {formatCurrency(payslipData.workDetails.hourlyRate)}
                        </td>
                        <td>
                          {formatCurrency(
                            payslipData.payrollBreakdown.baseSalary
                          )}
                        </td>
                        <td>SNPF</td>
                        <td>{payslipData.npfNumber}</td>
                        <td>
                          {formatCurrency(
                            payslipData.payrollBreakdown.deductions.npf
                          )}
                        </td>
                      </tr>
                      {payslipData.workDetails.overtimeHours > 0 ? (
                        <tr>
                          <td>Overtime</td>
                          <td>{payslipData.workDetails.overtimeHours}</td>
                          <td>
                            {formatCurrency(
                              payslipData.workDetails.overtimeRate
                            )}
                          </td>
                          <td>
                            {formatCurrency(
                              payslipData.payrollBreakdown.overtimePay
                            )}
                          </td>
                          <td>ACC</td>
                          <td></td>
                          <td>
                            {formatCurrency(
                              payslipData.payrollBreakdown.deductions.acc
                            )}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td>Overtime</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>ACC</td>
                          <td></td>
                          <td>
                            {formatCurrency(
                              payslipData.payrollBreakdown.deductions.acc
                            )}
                          </td>
                        </tr>
                      )}
                      {/* Added Double Time row */}
                      <tr>
                        <td>Double Time</td>
                        <td>
                          {payslipData.workDetails.doubleTimeHours || "-"}
                        </td>
                        <td>
                          {payslipData.workDetails.doubleTimeRate
                            ? formatCurrency(
                                payslipData.workDetails.doubleTimeRate
                              )
                            : "-"}
                        </td>
                        <td>
                          {payslipData.payrollBreakdown.doubleTimePay
                            ? formatCurrency(
                                payslipData.payrollBreakdown.doubleTimePay
                              )
                            : "-"}
                        </td>
                        <td>PAYE</td>
                        <td></td>
                        <td>
                          {formatCurrency(
                            payslipData.payrollBreakdown.deductions.paye
                          )}
                        </td>
                      </tr>
                      {payslipData.payrollBreakdown.allowances > 0 ? (
                        <tr>
                          <td>Allowances</td>
                          <td></td>
                          <td></td>
                          <td>
                            {formatCurrency(
                              payslipData.payrollBreakdown.allowances +
                              payslipData.payrollBreakdown.taxableAllowances +
                                payslipData.payrollBreakdown.nonTaxableAllowances
                            )}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      ) : (
                        <tr>
                          <td>Allowances</td>
                          <td>-</td>
                          <td></td>
                          <td>-</td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      )}
                      {payslipData.payrollBreakdown.deductions.other > 0 && (
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Other Deductions</td>
                          <td></td>
                          <td>
                            {formatCurrency(
                              payslipData.payrollBreakdown.deductions.other
                            )}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="3" className="text-right">
                          <strong></strong>
                        </td>
                        <td className="bold-text">
                          {formatCurrency(
                            (payslipData.payrollBreakdown.baseSalary || 0) +
                              (payslipData.payrollBreakdown.allowances || 0) +
                              (payslipData.payrollBreakdown.overtimePay || 0) +
                              (payslipData.payrollBreakdown.doubleTimePay || 0)
                          )}
                        </td>
                        <td colSpan="2" className="text-right">
                          <strong></strong>
                        </td>
                        <td className="bold-text">
                          {formatCurrency(
                            payslipData.payrollBreakdown.deductions.total
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Net Pay Section - Matches PDF styling */}
                  <div
                    style={{
                      marginTop: "20px",
                      // borderTop: "1px solid #000",
                      paddingTop: "8px",
                      textAlign: "right",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Net Pay</span>
                      <span style={{ fontWeight: "bold", fontSize: "20px" }}>
                        {formatCurrency(
                          payslipData.payrollBreakdown.netPayable
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Leave Balances Section - Matches PDF styling */}
                  <div className="m-2 pt-2 w-[250px]">
                    {/* Header Row */}
                    <div className="flex justify-between mb-2 ">
                      <span className="font-bold">Leave Balances</span>
                      <span className="font-bold">Total</span>
                    </div>

                    {/* Leave Items */}
                    <div className="flex flex-col gap-1">
                      {leaveBalances ? (
                        leaveBalances.map((lb) => (
                          <div
                            key={lb.leaveId}
                            className="flex justify-between"
                          >
                            <span>
                              {leaves.find((l) => l._id === lb.leaveId)
                                ?.leave || "Leave Type"}
                            </span>
                            <span>{lb.available || 0}</span>
                          </div>
                        ))
                      ) : (
                        <div>No leave balances available</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8 remove-on-download">
                  <motion.button
                    className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-medium"
                    onClick={handleDownloadPDF}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        {/* <LoadingSpinner className="h-5 w-5 mr-2" /> */}
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2 " />
                        Download as PDF
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && selectedPeriod && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-700 font-medium">Loading payslip...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayslipPage;
