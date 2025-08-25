"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EntityPageLayout from "@/components/shared/EntityPageLayout";
import entityConfig from "@/components/Setups/config";

const DynamicEntityPage = () => {
  const { entity } = useParams();
  const config = entityConfig[entity];
  console.log({ config });
  const [relatedData, setRelatedData] = useState({});

  useEffect(() => {
    if (!config?.fields) return;

    const fetchRelations = async () => {
      const relations = {};

      await Promise.all(
        config.fields
          .filter((field) => field.fieldType === "select" && field.fetchFrom)
          .map(async (field) => {
            try {
              const res = await fetch(field.fetchFrom);
              const data = await res.json();

              relations[field.name] = data;
              console.log(relations[field.name]);
            } catch (err) {
              console.error(`Error fetching ${field.label}:`, err);
            }
          })
      );

      setRelatedData(relations);
    };

    fetchRelations();
  }, [entity]);

  if (!config) {
    return <div className="p-4 text-red-500">Invalid entity: {entity}</div>;
  }

  const fieldsWithOptions = config.fields.map((field) => {
    console.log(relatedData[field.name]);
    if (
      field.fieldType === "select" &&
      relatedData[field.name] &&
      field.optionLabelKey &&
      field.optionValueKey
    ) {
      console.log("im here");
      return {
        ...field,
        options:
          relatedData?.length > 0 &&
          relatedData[field.name]?.map((item) => ({
            label: item[field.optionLabelKey],
            value: item[field.optionValueKey],
          })),
      };
    }
    // console.log({options})
    return field;
  });

  return (
    <EntityPageLayout
      title={config.title}
      endpoint={config.endpoint}
      fields={fieldsWithOptions}
      tableFields={config.tableFields || fieldsWithOptions}
      buttonText={config.buttonText}
    />
  );
};

export default DynamicEntityPage;
