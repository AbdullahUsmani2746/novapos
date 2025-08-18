// pages/employers.js
"use client";
import Header from "@/components/Others/breadcumb";
import EmployeeTable from "@/components/Employee/EmployeeTable";

const Employers = () => {




  return (
    <>
      <Header heading="Employees" />
      <div className="flex flex-1 flex-col gap-4 p-4">



        <EmployeeTable />
      </div>
    </>

  );
};

export default Employers;
