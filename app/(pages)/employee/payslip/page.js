"use client"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import axios from '@/lib/axiosInstance';
import { Calendar as CalendarIcon } from "lucide-react";
import Header from "@/components/Others/breadcumb";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

const Payslip = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "001-0001";
  const [isLoading, setIsLoading] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [periodType, setPeriodType] = useState("weekly");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const aggregatePayslips = (payslips, periodType) => {
    const grouped = {};

    payslips.forEach(payslip => {
      const key = `${payslip.employeeId}-${periodType === 'monthly' ? payslip.monthNo :
        periodType === 'fortnightly' ? Math.ceil(payslip.weekNo / 2) : payslip.weekNo}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...payslip,
          payrollBreakdown: {
            ...payslip.payrollBreakdown,
            baseSalary: 0,
            allowances: 0,
            overtimePay: 0,
            netPayable: 0,
            deductions: {
              paye: 0,
              acc: 0,
              npf: 0,
              other: 0,
              total: 0
            },
            employerContributions: {
              acc: 0,
              npf: 0,
              total: 0
            }
          },
          workDetails: {
            ...payslip.workDetails,
            totalWorkHours: 0,
            overtimeHours: 0
          }
        };
      }

      const entry = grouped[key];
      const breakdown = payslip.payrollBreakdown;
      const work = payslip.workDetails;

      entry.payrollBreakdown.baseSalary += breakdown.baseSalary;
      entry.payrollBreakdown.allowances += breakdown.allowances;
      entry.payrollBreakdown.overtimePay += breakdown.overtimePay;
      entry.payrollBreakdown.netPayable += breakdown.netPayable;
      entry.payrollBreakdown.deductions.paye += breakdown.deductions.paye;
      entry.payrollBreakdown.deductions.acc += breakdown.deductions.acc;
      entry.payrollBreakdown.deductions.npf += breakdown.deductions.npf;
      entry.payrollBreakdown.deductions.other += breakdown.deductions.other;
      entry.payrollBreakdown.deductions.total += breakdown.deductions.total;
      entry.payrollBreakdown.employerContributions.acc += breakdown.employerContributions.acc;
      entry.payrollBreakdown.employerContributions.npf += breakdown.employerContributions.npf;
      entry.payrollBreakdown.employerContributions.total += breakdown.employerContributions.total;
      entry.workDetails.totalWorkHours += work.totalWorkHours;
      entry.workDetails.overtimeHours += work.overtimeHours;
    });

    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchPayslips = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/payroll/payslip/${employerId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const aggregatedData = aggregatePayslips(response.data, periodType);
        setPayslips(aggregatedData);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslips();
  }, [employerId, startDate, endDate, periodType]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Header heading="Payslip History" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white  p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold">Payslip History</h1>

            {/* Filters (Select and Date Pickers) */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
              {/* Select Period */}
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Pickers */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Start Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[200px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* End Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[200px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center h-48"
              >
                <div className="animate-spin h-8 w-8 border-b-4 border-gray-900" />
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary">
                          <TableHead className="text-primary-foreground">Employee ID</TableHead>
                          <TableHead className="text-primary-foreground">Name</TableHead>
                          <TableHead className="text-primary-foreground">
                            {periodType === 'monthly' ? 'Month' :
                              periodType === 'fortnightly' ? 'Fortnight' : 'Week'}
                          </TableHead>
                          <TableHead className="text-primary-foreground">Work Hours</TableHead>
                          <TableHead className="text-primary-foreground">Base Pay</TableHead>
                          <TableHead className="text-primary-foreground">Overtime</TableHead>
                          <TableHead className="text-primary-foreground">Deductions</TableHead>
                          <TableHead className="text-primary-foreground">Net Pay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payslips.map((payslip) => (
                          <motion.tr
                            key={`${payslip.employeeId}-${payslip.weekNo}`}
                            variants={item}
                          className="border-b border-text_background/10 "
                          >
                            <TableCell>{payslip.employeeId}</TableCell>
                            <TableCell>{payslip.employeeName}</TableCell>
                            <TableCell>
                              {periodType === 'monthly' ? payslip.monthNo :
                                periodType === 'fortnightly' ? Math.ceil(payslip.weekNo / 2) :
                                  payslip.weekNo}
                            </TableCell>
                            <TableCell>{payslip.workDetails.totalWorkHours.toFixed(1)}</TableCell>
                            <TableCell>${payslip.payrollBreakdown.baseSalary.toFixed(2)}</TableCell>
                            <TableCell>${payslip.payrollBreakdown.overtimePay.toFixed(2)}</TableCell>
                            <TableCell>${payslip.payrollBreakdown.deductions.total.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">
                              ${payslip.payrollBreakdown.netPayable.toFixed(2)}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default Payslip;