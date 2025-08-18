// pages/payroll.js
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/Others/spinner";
import { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'; 
import Header from "@/components/Others/breadcumb";

const PayrollHistory = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "001-0001";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [Name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock API calls
        const response = await axios.get(`/api/users/payroll/${employerId}`);
        const nameResponse = await axios.get(`/api/employees/${employerId}`);

        console.log(response);
        setData(response.data);
        setName(nameResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employerId]);

  // Calculate pagination details
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Header heading="Payroll History" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="transition-width duration-300 flex-1 p-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">Payroll History</h1>
              </div>

              <Table className="shadow-md rounded-lg border-separate">
                <TableHeader>
                  <TableRow className="bg-foreground text-left">
                    <TableHead className="px-4 py-2 font-semibold text-white">Payroll ID</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Name</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Pay Date</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Base Salary</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Bonuses</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Deductions</TableHead>
                    <TableHead className="px-4 py-2 font-semibold text-white">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((record) => (
                    <TableRow key={record.payrollId} className="bg-background shadow-lg rounded-lg border-separate">
                      <TableCell className="px-4">{record.payrollId}</TableCell>
                      <TableCell className="px-4">{Name}</TableCell>
                      <TableCell className="px-4">{new Date(record.payDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4">${record.baseSalary}</TableCell>
                      <TableCell className="px-4">${record.bonuses}</TableCell>
                      <TableCell className="px-4">${record.deductions}</TableCell>
                      <TableCell className="px-4">${record.netPay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination controls */}
          <Pagination>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            <PaginationContent>
              {[...Array(totalPages).keys()].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page + 1}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </>
  );
};

export default PayrollHistory;
