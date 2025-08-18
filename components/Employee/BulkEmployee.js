import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} from "libphonenumber-js";
import axios from "@/lib/axiosInstance";
import { FileUp, DownloadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/Others/spinner";
import { motion } from "framer-motion";
import { utils, writeFile } from "xlsx";
import * as XLSX from "xlsx";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  },
};

const BulkEmployeeUpload = ({ onClose, setEmployees }) => {
  const { data: session } = useSession();
  const clientId = session?.user?.username;
  const [isLoading, setIsLoading] = useState(false);
  const [mappingData, setMappingData] = useState({});
  const [errors, setErrors] = useState([]);
  const [processing, setProcessing] = useState(false);

  const fetchMappingData = async () => {
    setIsLoading(true);
    try {
      const [
        depResponse,
        jobTitleResponse,
        locationResponse,
        employeeTypeResponse,
        leaveResponse,
        allownceResponse,
        deductionResponse,
        managerResponse,
        costCenterResponse,
      ] = await Promise.all([
        axios.get(`/api/employees/department?employerId=${clientId}`),
        axios.get(`/api/employees/jobTitle?employerId=${clientId}`),
        axios.get(`/api/employees/workLocation?employerId=${clientId}`),
        axios.get(`/api/employees/employeeType?employerId=${clientId}`),
        axios.get(`/api/employees/leave?employerId=${clientId}`),
        axios.get(`/api/employees/allownce?employerId=${clientId}`),
        axios.get(`/api/employees/deduction?employerId=${clientId}`),
        axios.get(`/api/employees/manager?employerId=${clientId}`),
        axios.get(`/api/employees/costCenter?employerId=${clientId}`),
      ]);

      setMappingData({
        departments: depResponse.data.data,
        jobTitles: jobTitleResponse.data.data,
        locations: locationResponse.data.data,
        employeeTypes: employeeTypeResponse.data.data,
        leaves: leaveResponse.data.data,
        allownces: allownceResponse.data.data,
        deductions: deductionResponse.data.data,
        managers: managerResponse.data.data,
        costCenters: costCenterResponse.data.data,
      });
    } catch (error) {
      toast.error("Failed to load reference data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMappingData();
  }, [clientId]);

  const getIDFromName = (type, name) => {
    console.log(mappingData);
    const fieldMap = {
      department: { data: mappingData.departments, field: "department" },
      jobtitle: { data: mappingData.jobTitles, field: "job_title" },
      worklocation: { data: mappingData.locations, field: "work_location" },
      employeetype: { data: mappingData.employeeTypes, field: "employee_type" }, // assuming field is typeName
      manager: { data: mappingData.managers, field: "manager" }, // assuming field is fullName
      costcenter: { data: mappingData.costCenters, field: "cost_center" }, // assuming field is code
      leave: { data: mappingData.leaves, field: "leave" }, // assuming field is leaveType
      allownce: { data: mappingData.allownces, field: "allownce" }, // assuming field is allowanceName
      deduction: { data: mappingData.deductions, field: "deduction" }, // assuming field is deductionName
    };

    const { data, field } = fieldMap[type] || {};
    if (!data || !field) return null;

    // Clean up input name and search case-insensitively
    const cleanName = name?.trim().toLowerCase();

    console.log(data, field, cleanName);

    return data?.find((item) => String(item[field]).toLowerCase() === cleanName)
      ?._id;
  };

  const processRow = (row) => {
    console.log(row);
    const errors = [];
    const processed = { ...row };

    const convertDate = (dateValue) => {
      if (!dateValue) return null;

      // Case 1: If it's a string in DD-MM-YYYY format
      if (typeof dateValue === "string") {
        const [day, month, year] = dateValue.split("-");
        if (!day || !month || !year) return null;
        return new Date(`${year}-${month}-${day}`);
      }

      // Case 2: If it's a number (Excel date serial number)
      if (typeof dateValue === "number") {
        // Excel dates are number of days since January 0, 1900
        // Excel has a leap year bug where it thinks 1900 was a leap year, so we adjust
        const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + dateValue * millisecondsPerDay);
      }

      return null;
    };

    // Add phone number validation and formatting
    const validateAndFormatPhone = (value) => {
      if (!value) return { valid: false, formattedNumber: null };

      const phoneValue = String(value);

      // Try to parse the phone number
      // Default to 'WS' (Western Samoa/Samoa) country code if not specified
      const phoneNumber = parsePhoneNumberFromString(phoneValue, "WS");

      if (!phoneNumber || !phoneNumber.isValid()) {
        // Try with a '+' prefix if user entered just the number
        const phoneWithPlus = phoneValue.startsWith("+")
          ? phoneValue
          : `+${phoneValue}`;
        const phoneNumberWithPlus = parsePhoneNumberFromString(
          phoneWithPlus,
          "WS"
        );

        if (!phoneNumberWithPlus || !phoneNumberWithPlus.isValid()) {
          return { valid: false, formattedNumber: null };
        }

        return {
          valid: true,
          formattedNumber: phoneNumberWithPlus.formatInternational(),
        };
      }

      return {
        valid: true,
        formattedNumber: phoneNumber.formatInternational(),
      };
    };

    // Map CSV headers to database fields
    processed.firstName = row.firstname;
    processed.middleName = row.middlename;
    processed.surname = row.surname;
    console.log(row.dob);
    processed.dob = convertDate(row.dob);
    processed.hireDate = convertDate(row.hiredate);

    // Process phone number
    const phoneResult = validateAndFormatPhone(row.phonenumber);
    if (!phoneResult.valid) {
      errors.push(
        `Invalid phone number format: ${row.phonenumber}. Use international format like +685XXXXXXX`
      );
      processed.phoneNumber = null;
    } else {
      processed.phoneNumber = phoneResult.formattedNumber;
    }

    const safeTransform = (value, transform) => {
      // Return null/default if value is null or undefined
      if (value == null) return null;

      // Convert to string, trim whitespace, then apply the transform function
      return transform(String(value).trim());
    };

    console.log(row.gender);
    processed.gender = safeTransform(row.gender, (str) => str.toUpperCase());
    processed.emailAddress = safeTransform(row.emailaddress, (str) => str);

    processed.village = row.village;
    processed.payType = safeTransform(row.paytype, (str) =>
      str.toUpperCase() === "WAGES" ? "HOUR" : str.toUpperCase()
    );
    processed.ratePerHour = row.rateperhour;
    processed.paymentMethod = safeTransform(row.paymentmethod, (str) =>
      str.toUpperCase()
    );
    processed.bankName = row.bankname;
    processed.accountName = row.accountname;
    processed.accountNumber = row.accountnumber;
    processed.npfNumber = row.npfnumber;
    processed.payFrequency = safeTransform(row.payfrequency, (str) => str);

    const requiredFields = [
      "npfnumber",
      "firstname",
      "surname",
      "dob",
      "gender",
      "phonenumber",
      "emailaddress",
      "hiredate",
      "jobtitle",
      "department",
      "worklocation",
      "paytype",
      "payfrequency",
      "rateperhour",
      "paymentmethod",
    ];

    requiredFields.forEach((field) => {
      if (!row[field]) errors.push(`Missing ${field}`);
    });

    // Date validation
    if (isNaN(processed.dob?.getTime())) 
      errors.push("Invalid dob format (DD-MM-YYYY)");
    if (isNaN(processed.hireDate?.getTime()))
      errors.push("Invalid hiredate format (DD-MM-YYYY)");

    processed.department = getIDFromName("department", row.department.trim());
    processed.jobTitle = getIDFromName("jobtitle", row.jobtitle.trim());
    processed.workLocation = getIDFromName(
      "worklocation",
      row.worklocation?.trim()
    );
    processed.employeeType = getIDFromName(
      "employeetype",
      row.employeetype.trim()
    );
    processed.manager = getIDFromName("manager", row.manager.trim());
    processed.costCenter = getIDFromName(
      "costcenter",
      row.costcenter ? row.costcenter.trim() : ""
    );

    console.log(processed.department);

    [
      ["department", processed.department],
      ["jobtitle", processed.jobtitle],
      ["worklocation", processed.worklocation],
      ["employeetype", processed.employeetype],
      ["costcenter", processed.costcenter],
    ].forEach(([field, id]) => {
      if (!id) errors.push(`Invalid ${field}: ${row[field]}`);
    });

    processed.allownces = row.allownces
      ?.split(",")
      .map((name) => getIDFromName("allownce", name.trim()))
      .filter(Boolean);
    processed.deductions = row.deductions
      ?.split(",")
      .map((name) => getIDFromName("deduction", name.trim()))
      .filter(Boolean);

    return { processed, errors };
  };

  const downloadTemplate = async () => {
    // Create workbook and worksheet
    const wb = utils.book_new();

    // Combine headers and sample data into a single array
    const data = [
      [
        "NPFNUMBER",
        "FIRSTNAME",
        "MIDDLENAME",
        "SURNAME",
        "DOB",
        "GENDER",
        "PHONENUMBER",
        "EMAILADDRESS",
        "VILLAGE",
        "HIREDATE",
        "JOBTITLE",
        "DEPARTMENT",
        "WORKLOCATION",
        "MANAGER",
        "COSTCENTER",
        "EMPLOYEETYPE",
        "PAYTYPE",
        "PAYFREQUENCY",
        "RATEPERHOUR",
        "PAYMENTMETHOD",
        "BANKNAME",
        "ACCOUNTNAME",
        "ACCOUNTNUMBER",
        "ALLOWNCES",
        "DEDUCTIONS",
      ],
    ];

    // Create worksheet from the full data array
    const ws = utils.aoa_to_sheet(data);

    // Add styling to header row
    const headerStyle = {
      font: { bold: true, sz: 12 },
      fill: { patternType: "solid", fgColor: { rgb: "FFD3D3D3" } },
    };

    // Apply styling to header cells
    data[0].forEach((_, colIndex) => {
      const cellRef = utils.encode_cell({ c: colIndex, r: 0 });
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = headerStyle;
    });

    // Set column widths and row heights
    ws["!cols"] = data[0].map(() => ({ wch: 20 }));
    ws["!rows"] = [{ hpx: 25 }];

    // Add comments/notes
    ws["!comments"] = [
      {
        ref: "A1",
        text: "Date Format: DD-MM-YYYY\nRequired Fields: NPFNUMBER, FIRSTNAME, SURNAME, DOB, HIREDATE",
        author: "System",
      },
      {
        ref: "G1",
        text: "Phone Format: Use international format with country code (e.g., +685XXXXXXX for Samoa)",
        author: "System",
      },
    ];

    utils.book_append_sheet(wb, ws, "Employees");
    writeFile(wb, "Employee_Template.xlsx");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setProcessing(true);
      try {
        // await fetchMappingData();
        const file = acceptedFiles[0];

        // Process Excel files
        if (file.name.match(/\.(xlsx|xls)$/i)) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(ws, {
              header: 1,
            });

            const headers = jsonData[0].map((h) =>
              h.toLowerCase().replace(/[^a-z0-9]/gi, "")
            );
            // Filter out empty rows
            const rows = jsonData.slice(1).filter((row) => {
              // Check if the row has any non-empty values
              return row.some(
                (cell) => cell !== undefined && cell !== null && cell !== ""
              );
            });
            const employees = [];
            const allErrors = [];

            rows.forEach((row, index) => {
              const rowObj = {};
              headers.forEach((header, i) => {
                rowObj[header] = row[i];
              });

              const { processed, errors } = processRow(rowObj);
              console.log(processed);
              if (errors.length > 0) {
                allErrors.push({ row: index + 1, errors });
              } else {
                employees.push({
                  ...processed,
                  clientId,
                  status: "ACTIVE",
                  documents: [],
                  leaves: [],
                });
              }
            });

            if (allErrors.length > 0) {
              setErrors(allErrors);
              return;
            }

            // Generate employee IDs
            const lastEmp = await axios.get(
              `/api/employees?employerId=${clientId}`
            );
            const lastNumber =
              lastEmp.data.data[
                lastEmp.data.data.length - 1
              ]?.employeeId?.split("-")[1] || 0;

            employees.forEach((emp, index) => {
              emp.employeeId = `${clientId.split("-")[1]}-${String(
                Number(lastNumber) + index + 1
              ).padStart(4, "0")}`;
            });

            const { data: res } = await axios.post("/api/employees", employees);
            setEmployees((prev) => [...prev, ...res.data]);
            toast.success(`Successfully added ${employees.length} employees`);
            onClose();
          };
          reader.readAsArrayBuffer(file);
        }
        // Process CSV files
        else if (file.name.match(/\.csv$/i)) {
          Papa.parse(file, {
            complete: async (results) => {
              const validRows = results.data.filter((row, index) => {
                if (index === 0) return true; // Keep header row

                // Check if row has any meaningful data
                const hasData = Object.values(row).some(
                  (value) =>
                    value !== undefined && value !== null && value !== ""
                );

                return hasData;
              });
              const employees = [];
              const allErrors = [];

              results.data.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                const { processed, errors } = processRow(row);
                if (errors.length > 0) {
                  allErrors.push({ row: index, errors });
                } else {
                  employees.push({
                    ...processed,
                    clientId,
                    status: "ACTIVE",
                    documents: [],
                    leaves: [],
                  });
                }
              });

              if (allErrors.length > 0) {
                setErrors(allErrors);
                return;
              }

              const lastEmp = await axios.get(
                `/api/employees?clientId=${clientId}&sort=employeeId&limit=1`
              );
              const lastNumber =
                lastEmp.data.data[0]?.employeeId?.split("-")[1] || 0;

              employees.forEach((emp, index) => {
                emp.employeeId = `${clientId.split("-")[1]}-${String(
                  Number(lastNumber) + index + 1
                ).padStart(4, "0")}`;
              });

              const { data } = await axios.post(
                "/api/employees/bulk",
                employees
              );
              setEmployees((prev) => [...prev, ...data.data]);
              toast.success(`Successfully added ${employees.length} employees`);
              onClose();
            },
            header: true,
          });
        }
      } catch (error) {
        toast.error("Bulk upload failed");
        console.error(error);
      } finally {
        setProcessing(false);
      }
    },
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });

  return (
    <Dialog open={true}>
      <DialogContent className=" max-w-full md:max-w-3xl p-0 h-[90vh] md:h-auto">
        <DialogHeader className=" text-foreground p-3 md:p-4 rounded-t-lg flex flex-col md:flex-row justify-between">
          <DialogClose
            onClick={onClose}
            className="text-blue hover:bg-background group order-1 md:order-2 self-end md:self-auto"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-foreground" />
          </DialogClose>

          <DialogTitle className="text-lg md:text-2xl font-bold order-2 md:order-1">
            Bulk Employee Upload
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="h-full md:h-[75vh] overflow-y-auto p-4"
          >
            <div className="space-y-6">
              {/* Download Template Button */}
              <div className="text-center">
                <Button
                  onClick={downloadTemplate}
                  className="gap-2 bg-red_foreground text-background hover:text-foreground hover:bg-background/90 w-full md:w-auto"
                >
                  <DownloadCloud className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              {/* File Upload Section */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50/20"
                  : "border-background/30"
              }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <FileUp className="w-8 h-8 md:w-12 md:h-12 mx-auto text-foreground/50" />
                  <p className="text-sm md:text-base text-foreground/80">
                    {isDragActive
                      ? "Drop CSV file here"
                      : "Drag & drop CSV file, or click to select"}
                  </p>
                  <p className="text-xs md:text-sm text-foreground/60">
                    CSV, XLS, XLSX formats supported
                  </p>
                </div>
              </div>

              {/* Processing Message */}
              {processing && (
                <div className="mt-4 p-4 bg-background/10 rounded-lg text-center">
                  <p className="text-sm md:text-base text-foreground/80">
                    Processing file... Please wait
                  </p>
                </div>
              )}

              {/* Errors Section */}
              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                  <h3 className="text-red-500 font-bold mb-2 text-sm md:text-base">
                    Errors found:
                  </h3>
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-red-400 text-xs md:text-sm"
                    >
                      Row {error.row}: {error.errors.join(", ")}
                    </div>
                  ))}
                </div>
              )}

              {/* Important Notes Section */}
              <div className="text-sm text-foreground/80">
                <p className="font-bold text-foreground text-base md:text-lg">
                  Important notes:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2 text-xs md:text-sm">
                  <li>
                    Use exact names from the system for department, job title,
                    etc.
                  </li>
                  <li>
                    Required fields: NPF Number, First Name, Surname, Date of
                    Birth, Gender, Phone, Email, Hire Date, Job Title,
                    Department, Work Location, Cost Center, Pay Type, Rate/Salary, Payment
                    Method
                  </li>
                  <li>For allowances/deductions, use comma-separated names</li>
                  <li>Date formats: DD-MM-YYYY</li>
                  <li>
                    Phone numbers should be in international format with country
                    code (e.g., +685XXXXXXX for Samoa)
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmployeeUpload;
