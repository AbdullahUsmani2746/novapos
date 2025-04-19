"use client";

import EntityPageLayout from "@/components/shared/EntityPageLayout";
import { useEffect, useState } from "react";

const DepartmentsPage = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <EntityPageLayout
      title="Departments"
      endpoint="departments"
      fields={[
        { name: "dept_code", label: "Dept Code", fieldType: "text" },
        { name: "dept_name", label: "Dept Name", fieldType: "text" },
        {
          relation: "company",
          relationName: "company",
          name: "company_id",
          label: "Company",
          fieldType: "select",
          options: companies.map((company) => ({
            value: company.id,
            label: company.company,
          })),
        },
      ]}
      buttonText="Add Department"
    />
  );
};

export default DepartmentsPage;
