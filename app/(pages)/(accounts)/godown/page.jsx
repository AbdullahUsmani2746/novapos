"use client";

import EntityPageLayout from "@/components/shared/EntityPageLayout";
import { useEffect, useState } from "react";

const GodownsPage = () => {
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
      title="Godowns"
      endpoint="godowns"
      fields={[
        { name: "godown", label: "Godown", fieldType: "text", required: true },
        {
          relation: "company",
          relationName: "company",
          name: "company_id",
          label: "Company",
          fieldType: "select",
          required: true,
          options: companies.map((company) => ({
            value: company.id,
            label: company.company,
          })),
        },
      ]}
      buttonText="Add Godown"
    />
  );
};

export default GodownsPage;
