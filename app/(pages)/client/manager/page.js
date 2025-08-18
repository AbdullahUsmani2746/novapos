"use client";
import DataManagementPage from "@/components/Dynamic/DataManagement";
import DynamicFormComponent from "@/components/Dynamic/DynamicFormComponent";
import { useSession } from "next-auth/react";
import { UserPlus, Building2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
const DynamicComponent = ({ existingData, onClose }) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "";

  const [department, setDepartment] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Fetch departments
  useEffect(() => {
    if (employerId) {
      const fetchDepartment = async () => {
        try {
          const response = await axios.get(
            `/api/employees/department?employerId=${employerId}`
          );
          setDepartment(response.data.data || []);
        } catch (error) {
          console.error("Error getting Department Data", error);
        }
      };
      fetchDepartment();
    }
  }, [employerId]);

  // Fetch employees when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const fetchEmployeeData = async () => {
        try {
          const response = await axios.get(
            `/api/employees?departmentId=${selectedDepartment}&inactive=true`
          );
          setEmployeeData(response.data.data || []);
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      };
      fetchEmployeeData();
    }
  }, [selectedDepartment]);

  // Transform existing data for editing
  const transformedExistingData = existingData
    ? {
        ...existingData,
        departmentId: {
          _id: existingData.departmentId?._id,
          department: existingData.departmentId?.department,
        },
        employeeId: existingData.employeeId,
        manager: existingData.manager,
      }
    : null;

  const handleFieldChange = (field, value, formData, setFormData) => {
    if (field === "departmentId") {
      setSelectedDepartment(value._id);
      // Reset employee selection when department changes
      setFormData({
        ...formData,
        departmentId: value,
        clientId: employerId,
        employeeId: null,
        manager: "",
      });
    } else if (field === "employeeId") {
      const selectedEmployee = employeeData.find(
        (emp) => emp.employeeId === value._id
      );
      if (selectedEmployee) {
        const managerName = `${selectedEmployee.firstName} ${selectedEmployee.surname}`;
        setFormData({
          ...formData,
          employeeId: value,
          manager: managerName,
        });
      }
    }
  };

  const fields = [
    {
      name: "manager",
      label: "Manager Name",
      placeholder: "Manager Name",
      icon: UserPlus,
      disabled: true,
      required: true,
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      placeholder: "Select Department",
      icon: Building2,
      displayKey: "department",
      options: department.map((dept) => ({
        value: dept._id,
        label: dept.department,
      })),
      required: true,
      onChange: handleFieldChange,
    },
    {
      name: "employeeId",
      label: "Employee",
      type: "select",
      placeholder: "Select Employee",
      icon: Users,
      displayKey: "fullName",
      options: employeeData.map((emp) => ({
        value: emp.employeeId,
        label: `${emp.firstName} ${emp.surname}`,
        fullName: `${emp.firstName} ${emp.surname}`,
      })),
      required: true,
      disabled: !selectedDepartment,
      onChange: handleFieldChange,
    },
  ];

  const handleSubmit = async (data, isEditing, editIndex) => {
    try {
      console.log(data);
      console.log(editIndex);

      const submitData = {
        ...(isEditing ? data[editIndex] : data),
      };

      if (isEditing) {
        await axios.put(
          `/api/employees/manager/${data[editIndex]._id}`,
          data[editIndex]
        );
      } else {
        await axios.post("/api/employees/manager", { data });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <DynamicFormComponent
      title="Manager"
      fields={fields}
      existingData={transformedExistingData}
      onSubmit={handleSubmit}
      onClose={onClose}
      allowMultiple={!existingData}
      onFieldChange={handleFieldChange}
    />
  );
};
const Page = () => {
  const { data: session } = useSession();
  const employerId = session?.user?.username;
  const columns = [
    { key: "manager", header: "Manager" },
    { key: "employeeId", header: "Employee ID" },
    { key: "departmentId", key2: "department", header: "Department" },
  ];

  return (
    <DataManagementPage
      pageTitle="Manager"
      pageDescription="Manage and track manager efficiently"
      addButtonText="Add Manager"
      apiEndpoint={`/api/employees/manager`}
      columns={columns}
      employerId={employerId}
      searchKeys={["manager", "employeeId"]}
      FormComponent={DynamicComponent}
    />
  );
};

export default Page;
