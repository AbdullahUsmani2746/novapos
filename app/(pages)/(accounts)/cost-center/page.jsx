"use client";

import EntityPageLayout from "@/components/shared/EntityPageLayout";
import { useEffect, useState } from "react";

const CostCentersPage = () => {
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
      title="Cost Centers"
      endpoint="cost-centers"
      fields={[
        { name: "ccno", label: "CCNO", fieldType: "text", required: true },
        { name: "ccname", label: "CC Name", fieldType: "text", required: true },
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
          required: true
        },
      ]}
      buttonText="Add Cost Center"
    />
  );
};

export default CostCentersPage;
