import { createColumnHelper } from '@tanstack/react-table';
import axios from '@/lib/axiosInstance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor('businessName', { header: 'Name', id: 'businessName', isVisible: true }),
  columnHelper.accessor('cpPhoneNumber', { header: 'Phone Number', id: 'cpPhoneNumber', isVisible: false }),
  columnHelper.accessor('paymentMethod', { header: 'Method', id: 'paymentMethod', isVisible: true }),
  columnHelper.accessor('terms', { header: 'Terms', id: 'terms', isVisible: true }),
  columnHelper.accessor('activatedOn', { header: 'Active', id: 'activatedOn', isVisible: true }),
  columnHelper.accessor('status', { 
    header: 'Status', 
    id: 'status', 
    isVisible: true,
    cell: ({ row, table }) => {
      const handleStatusChange = async (newStatus) => {
        try {
          const response = await axios.put("/api/employers/status", {
            employerId,
            status: newStatus,
          });
      
          if (response.status !== 200) {
            throw new Error(response.data.message || "Failed to update status");
          }
      
          // Refresh the employer list
          table.options.meta.fetchEmployers();
        } catch (error) {
          console.error('Error updating employer status:', error);
        }
      };

      return (
        <Select
          value={row.original.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[120px] text-background">
            <SelectValue placeholder={row.original.status} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      );
    }
  })
];

