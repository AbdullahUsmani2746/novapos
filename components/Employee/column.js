import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const columns_employee = [
  columnHelper.accessor("name", { header: "Name", id: "firstName", id2:"surname", isVisible: true }),
  columnHelper.accessor("phone", { header: "Phone", id: "phoneNumber", isVisible: true }),
  columnHelper.accessor("department", { header: "Department", id: "department", isVisible: true }),
  columnHelper.accessor("designation", { header: "Designation", id: "jobTitle", isVisible: true }),
  // columnHelper.accessor("allownces", { header: "Allownce", id: "allownces", isVisible: true }),
  // columnHelper.accessor("deductions", { header: "Deduction", id: "deductions", isVisible: true }),
  columnHelper.accessor("status", { header: "Status", id: "status", isVisible: true }),


];
