"use client";
import Header from "@/components/Others/breadcumb";
import LoadingSpinner from "@/components/Others/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AttendanceHistory = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [Name, setName] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchData = async (page = 1) => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/users/attendance/${employerId}?page=${page}&limit=${pagination.itemsPerPage}`
        );
        setData(response.data.attendance);
        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.total,
            itemsPerPage: response.data.pagination.limit,
          });
        }
        const nameResponse = await axios.get(`/api/employees/${employerId}`);
        setName(nameResponse.data.data);
      } catch (error) {
        toast.error("Error fetching attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (employerId) {
      fetchData(pagination.currentPage);
    }
  }, [employerId, pagination.currentPage, pagination.itemsPerPage]);

  const getStatusColor = (status) => {
    const statusColors = {
      Approved: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || statusColors.default;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header heading="Attendance History" />
      {isLoading ? (
        <LoadingSpinner
          variant="pulse"
          size="large"
          text="Processing..."
          fullscreen={true}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-1 flex-col gap-4 p-4 pt-4"
        >
          <div className="transition-all duration-300 flex-1 p-6 rounded-xl ">
            <div className="p-4">
              <motion.div
                {...fadeInUp}
                className="flex justify-between items-center mb-6"
              >
                <h1 className="text-xl md:text-3xl font-bold text-text_background dark:text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-red_foreground" />
                  Attendance History
                </h1>
              </motion.div>

              <div className="overflow-hidden relative rounded-lg  border border-text_background/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-background/10 bg-red_foreground">
                      <TableHead className="text-white font-semibold text-left">
                        Name
                      </TableHead>
                      <TableHead className="text-white font-semibold text-left">
                        Date
                      </TableHead>
                      <TableHead className="text-white font-semibold text-left text-sm">
                        Time
                      </TableHead>
                      {/* <TableHead className="text-white font-semibold text-left">
                        
                      </TableHead> */}
                      <TableHead className="text-white font-semibold text-left">
                        Break
                      </TableHead>
                      <TableHead className="text-white font-semibold text-left">
                        Hours
                      </TableHead>
                      <TableHead className="text-white font-semibold text-left">
                        Leave
                      </TableHead>
                      <TableHead className="text-white font-semibold text-left">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.length > 0 ? (
                      data.map((record, index) => (
                        <motion.tr
                          key={record._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-text_background/10 "
                        >
                          <TableCell>
                            <p className="font-semibold">{Name}</p>

                            <span className="text-sm font-normal">{record.employeeId}</span>
                          </TableCell>
                          <TableCell >
                            <div className="flex items-center gap-2 ">
                              <Calendar className="w-4 h-4 text-foreground" />
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="space-y-2">
                            <div className="flex items-center gap-2  ">
                              <Clock className="w-4 h-4 text-green-500" />
                              {new Date(
                                record.checkInTime
                              ).toLocaleTimeString()}
                            </div>
                            <div className="flex items-center gap-2 ">
                              <Clock className="w-4 h-4 text-red-500" />
                              {new Date(
                                record.checkOutTime
                              ).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          
                          <TableCell>{record.totalBreakDuration}</TableCell>
                          <TableCell>{record.totalWorkingHours}</TableCell>
                          <TableCell>
                            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                              {record.leave || "No Leave"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center mt-4"
              >
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (pagination.currentPage > 1) {
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: prev.currentPage - 1,
                            }));
                          }
                        }}
                        className={`text-foreground hover:text-background ${
                          pagination.currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-background/10 hover:bg-red_foreground cursor-pointer"
                        }`}
                        />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.currentPage >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: pageNum,
                                }))
                              }
                              isActive={pagination.currentPage === pageNum}
                              className={
                                pagination.currentPage === pageNum
                                  ? "bg-background/20 text-foreground  hover:bg-red_foreground cursor-pointer"
                                  : "text-foreground cursor-pointer hover:bg-red_foreground"
                              }
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (pagination.currentPage < pagination.totalPages) {
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: prev.currentPage + 1,
                            }));
                          }
                        }}
                        disabled={
                          pagination.currentPage <= pagination.totalPages
                        }
                        className={`text-foreground hover:text-background ${
                          pagination.currentPage >= pagination.totalPages 
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-background/10 hover:bg-red_foreground cursor-pointer"
                        }`}
                        
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceHistory;
