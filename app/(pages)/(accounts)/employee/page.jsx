"use client";

import EntityPageLayout from "@/components/shared/EntityPageLayout";
import { useEffect, useState } from "react";

const EmployeesPage = () => {
 const [managers, setManagers] = useState([]);
 const [employers, setEmployers] = useState([]);

 useEffect(() => {
   const fetchManagers = async () => {
     try {
       const res = await fetch("/api/managers");
       const data = await res.json();
       setManagers(data);
     } catch (error) {
       console.error("Error fetching managers:", error);
     }
   };

   const fetchEmployers = async () => {
     try {
       const res = await fetch("/api/employers");
       const data = await res.json();
       setEmployers(data);
     } catch (error) {
       console.error("Error fetching employers:", error);
     }
   };

//    fetchManagers();
//    fetchEmployers();
 }, []);

 return (
   <EntityPageLayout
     title="Employees"
     endpoint="employees"
     fields={[
       { name: "first_name", label: "First Name", fieldType: "text", required: true },
       { name: "middle_name", label: "Middle Name", fieldType: "text" },
       { name: "surname", label: "Surname", fieldType: "text", required: true },
       { name: "dob", label: "Date of Birth", fieldType: "date", required: true },
       { 
         name: "gender", 
         label: "Gender", 
         fieldType: "select", 
         options: [
           { value: "MALE", label: "Male" },
           { value: "FEMALE", label: "Female" },
           { value: "OTHER", label: "Other" }
         ]
       },
       { name: "phone_number", label: "Phone Number", fieldType: "text", required: true },
       { name: "npf_number", label: "NPF Number", fieldType: "text", required: true },
       { name: "email_address", label: "Email Address", fieldType: "email", required: true },
       { name: "village", label: "Village", fieldType: "text", required: true },
       { 
         name: "status", 
         label: "Status", 
         fieldType: "select", 
         options: [
           { value: "ACTIVE", label: "Active" },
           { value: "INACTIVE", label: "Inactive" }
         ]
       },
       { name: "hire_date", label: "Hire Date", fieldType: "date", required: true },
       { name: "job_title", label: "Job Title", fieldType: "text", required: true },
       { name: "department", label: "Department", fieldType: "text", required: true },
       { name: "work_location", label: "Work Location", fieldType: "text", required: true },
    //    {
    //      relation: "manager",
    //      relationName: "manager",
    //      name: "manager_id",
    //      label: "Manager",
    //      fieldType: "select",
    //      options: managers.map((manager) => ({
    //        value: manager.id,
    //        label: manager.id,
    //      })),
    //    },
    //    {
    //      relation: "employer",
    //      relationName: "employer",
    //      name: "client_id",
    //      label: "Employer",
    //      fieldType: "select",
    //      options: employers.map((employer) => ({
    //        value: employer.employer_id,
    //        label: employer.employer_id,
    //      })),
    //      required: true,
    //    },
       { name: "employee_id", label: "Employee ID", fieldType: "text", required: true },
    //    { 
    //      name: "payment_method", 
    //      label: "Payment Method", 
    //      fieldType: "select", 
    //      options: [
    //        { value: "CASH", label: "Cash" },
    //        { value: "DIRECT_DEPOSIT", label: "Direct Deposit" },
    //        { value: "CHEQUE", label: "Cheque" }
    //      ]
    //    },
       { name: "bank_name", label: "Bank Name", fieldType: "text" },
       { name: "account_name", label: "Account Name", fieldType: "text" },
       { name: "account_number", label: "Account Number", fieldType: "text" },
       { 
         name: "pay_type", 
         label: "Pay Type", 
         fieldType: "select", 
         options: [
           { value: "HOUR", label: "Hourly" },
           { value: "SALARY", label: "Salary" }
         ]
       },
       { name: "rate_per_hour", label: "Rate Per Hour", fieldType: "number", required: true },
       { 
         name: "pay_frequency", 
         label: "Pay Frequency", 
         fieldType: "select", 
         options: [
           { value: "Monthly", label: "Monthly" },
           { value: "Fortnightly", label: "Fortnightly" },
           { value: "Weekly", label: "Weekly" }
         ]
       },
       { name: "employee_type", label: "Employee Type", fieldType: "text", required: true },
       { name: "cost_center", label: "Cost Center", fieldType: "text", required: true },
       { name: "allownces", label: "Allowances", fieldType: "text", required: false },
    //    { name: "allownce_eligible", label: "Allowance Eligible", fieldType: "checkbox" },
       { name: "deductions", label: "Deductions", fieldType: "text", required: false },
    //    { name: "profile_image", label: "Profile Image", fieldType: "file" }
     ]}
     buttonText="Add Employee"
   />
 );
};

export default EmployeesPage;