import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "@/lib/axiosInstance";
import { parsePhoneNumber, AsYouType } from "libphonenumber-js";
import { Country } from "country-state-city";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/Others/spinner";
import Image from "next/image";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  House,
  X,
  AlertCircle,
} from "lucide-react";

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

const EmployeeFormDialog = ({
  employeeToEdit,
  onClose,
  handleSubmit,
  employeeData,
  setEmployeeData,
  handleChange,
  handleFileChange,
  profileImage,
  isLoading,
  isSubmitting,
  jobTitle,
  department,
  location,
  manager,
  costCenter,
  employeeType,
  allownce,
  deduction,
  Banks,
  leave,
  selectedAllownces,
  selectedDeductions,
  uploadDocument,
  handleDescriptionChange,
  removeDocument,
  handleSelectChange,
  handleLeaveCheckboxChange,
  handleSelectLeaveChange,
}) => {
  // In EmployeeFormDialog component
  const [errors, setErrors] = useState({}); // Local error state
  const [activeTab, setActiveTab] = useState("profile");

  // Add to your component state
  const [countryCode, setCountryCode] = useState("WS"); // Default to Samoa (WS)
  const [phoneInput, setPhoneInput] = useState("");

  const fieldToTabMap = {
    npfNumber: "profile",
    firstName: "personal",
    surname: "personal",
    dob: "personal",
    gender: "personal",
    phoneNumber: "personal",
    emailAddress: "personal",
    hireDate: "job",
    jobTitle: "job",
    department: "job",
    costCenter: "job",
    workLocation: "job",
    payType: "payment",
    ratePerHour: "payment",
    paymentMethod: "payment",
    bankName: "payment",
    accountName: "payment",
    accountNumber: "payment",
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneNumber = parsePhoneNumber(employeeData.phoneNumber, countryCode);
    console.log(phoneNumber);

    if (!phoneNumber || !phoneNumber.isValid()) {
      newErrors.phoneNumber = "Invalid phone number";
    }

    if (!employeeData.npfNumber?.trim())
      newErrors.npfNumber = "NPF number is required";
    if (!employeeData.firstName?.trim())
      newErrors.firstName = "First name is required";
    if (!employeeData.surname?.trim())
      newErrors.surname = "Surname is required";
    if (!employeeData.dob) newErrors.dob = "Date of birth is required";
    if (!employeeData.gender) newErrors.gender = "Gender is required";
    if (!employeeData.village) newErrors.village = "Village is required";
    if (!employeeData.phoneNumber?.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!employeeData.emailAddress?.trim())
      newErrors.emailAddress = "Email is required";
    if (!employeeData.hireDate) newErrors.hireDate = "Hire date is required";
    if (!employeeData.jobTitle) newErrors.jobTitle = "Job title is required";
    if (!employeeData.department)
      newErrors.department = "Department is required";
    if (!employeeData.workLocation)
      newErrors.workLocation = "Work location is required";
    if (!employeeData.costCenter)
      newErrors.costCenter = "Cost Center is required";
    if (!employeeData.payType) newErrors.payType = "Pay type is required";
    if (!employeeData.ratePerHour)
      newErrors.ratePerHour = "Rate/salary is required";
    if (!employeeData.paymentMethod)
      newErrors.paymentMethod = "Payment method is required";

    if (employeeData.paymentMethod !== "CASH") {
      if (!employeeData.bankName?.trim())
        newErrors.bankName = "Bank name is required";
      if (!employeeData.accountName?.trim())
        newErrors.accountName = "Account name is required";
      if (!employeeData.accountNumber?.trim())
        newErrors.accountNumber = "Account number is required";
    }

    return newErrors;
  };

  const handleFormSubmit = (e) => {
    console.log("done");
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log("done2");
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const firstErrorTab = fieldToTabMap[firstErrorField];
      if (firstErrorTab) setActiveTab(firstErrorTab);
      return;
    }
    handleSubmit(e);
  };

  const getInputClass = (fieldName) =>
    `text-foreground bg-background/5 border-background/10 text-xs md:text-sm ${
      errors[fieldName] ? "border-red-500" : ""
    }`;

  const handleChangeWithValidation = (e) => {
    handleChange(e);
    if (errors[e.target.name]) {
      setEmployeeData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSelectChangeWithValidation = (name, value) => {
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  // Get all countries
  const allCountries = Country.getAllCountries();

  // Update useEffect to parse existing number
  useEffect(() => {
    if (employeeData.phoneNumber) {
      try {
        const phoneNumber = parsePhoneNumber(employeeData.phoneNumber);
        if (phoneNumber) {
          setCountryCode(phoneNumber.country || "WS");
          setPhoneInput(phoneNumber.nationalNumber);
        }
      } catch (e) {
        setPhoneInput(employeeData.phoneNumber);
      }
    }
  }, [employeeData.phoneNumber]);

  // Phone number input handler
  const handlePhoneChange = (value) => {
    const formatter = new AsYouType(countryCode);
    const formatted = formatter.input(value);

    setPhoneInput(formatted);

    // Update the actual phone number in employeeData
    try {
      const phoneNumber = parsePhoneNumber(formatted, countryCode);
      if (phoneNumber && phoneNumber.isValid()) {
        setEmployeeData((prev) => ({
          ...prev,
          phoneNumber: phoneNumber.number,
        }));
      }
    } catch (e) {
      // Invalid number
    }
  };

  // Country select handler
  const handleCountryChange = (code) => {
    setCountryCode(code);
    // Re-format existing number with new country code
    handlePhoneChange(phoneInput);
  };
  return (
    <Dialog open={true}>
      <DialogContent className=" max-w-full md:max-w-4xl p-0 h-[90vh] md:h-auto">
        <DialogHeader className=" text-foreground p-3 md:p-4 rounded-t-lg flex flex-row justify-between">
          <DialogTitle className="text-xl md:text-2xl font-bold">
            {employeeToEdit ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
          <DialogClose
            onClick={onClose}
            className="text-blue hover:bg-background group"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-foreground" />
          </DialogClose>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          </div>
        ) : (
          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="h-full  overflow-y-auto"
          >
            <form onSubmit={handleFormSubmit}>
              <Tabs
                defaultValue="personal"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex bg-background/5 p-1 mx-2 mt-2 rounded-lg overflow-x-auto">
                  <TabsTrigger
                    value="profile"
                    className="flex-shrink-0 data-[state=active]:bg-red_foreground data-[state=active]:text-background text-foreground text-xs md:text-sm"
                  >
                    <ImageIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="personal"
                    className="flex-shrink-0 data-[state=active]:bg-red_foreground data-[state=active]:text-background text-foreground text-xs md:text-sm"
                  >
                    <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger
                    value="job"
                    className="flex-shrink-0 data-[state=active]:bg-red_foreground data-[state=active]:text-background text-foreground text-xs md:text-sm"
                  >
                    <Briefcase className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Job
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    className="flex-shrink-0 data-[state=active]:bg-red_foreground data-[state=active]:text-background text-foreground text-xs md:text-sm"
                  >
                    <CreditCard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Payment
                  </TabsTrigger>
                  <TabsTrigger
                    value="allowances"
                    className="flex-shrink-0 data-[state=active]:bg-red_foreground data-[state=active]:text-background text-foreground text-xs md:text-sm"
                  >
                    <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Benefits
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="flex-shrink-0 data-[state=active]:bg-red_foreground data-[state=active]:text-background text-foreground text-xs md:text-sm"
                  >
                    <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="p-2 md:p-4">
                  <Card className="border border-foreground/5 shadow-sm">
                    <CardContent className="p-3 md:p-6">
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4  text-foreground">
                              Employee Identification
                            </h3>
                            <div className="space-y-3 md:space-y-4">
                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                  Employee ID
                                </label>
                                <Input
                                  name="employeeId"
                                  value={employeeData.employeeId}
                                  onChange={handleChange}
                                  placeholder="Employee ID"
                                  readOnly
                                  className=" text-foreground bg-background/5 border-background/10"
                                />
                              </div>
                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                  Client ID
                                </label>
                                <Input
                                  name="clientId"
                                  value={employeeData.clientId}
                                  onChange={handleChange}
                                  placeholder="Client ID"
                                  readOnly
                                  className="text-foreground bg-background/5 border-background/10"
                                />
                              </div>

                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                  NPF Number
                                </label>
                                <div className="relative">
                                  <Input
                                    name="npfNumber"
                                    value={employeeData.npfNumber}
                                    onChange={handleChangeWithValidation}
                                    placeholder="NPF Number"
                                    className={` ${getInputClass(
                                      "npfNumber"
                                    )} text-foreground`}
                                  />
                                  {errors.npfNumber && (
                                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                                  )}
                                </div>
                                {errors.npfNumber && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.npfNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
                            <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4">
                              Profile Image
                            </h3>
                            <div className="border border-background/10 p-3 md:p-4 rounded-lg shadow-sm bg-background/5 w-full max-w-xs md:w-48">
                              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-3 md:mb-4">
                                {profileImage || employeeData.profileImage ? (
                                  <Image
                                    src={
                                      profileImage
                                        ? URL.createObjectURL(profileImage)
                                        : employeeData.profileImage
                                    }
                                    width={50}
                                    height={50}
                                    alt="Profile Preview"
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full rounded-full bg-background/10 text-red_foreground">
                                    <span className="text-xs md:text-sm">
                                      No Image
                                    </span>
                                  </div>
                                )}
                              </div>
                              <label className="block text-center bg-red_foreground text-background py-2 px-3 md:px-4 rounded-md cursor-pointer hover:bg-background border hover:text-foreground transition duration-150 text-xs md:text-sm">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(e, "profileImage")
                                  }
                                  className="hidden"
                                />
                                {employeeData.profileImage
                                  ? "Change Image"
                                  : "Upload Image"}
                              </label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personal" className="p-2 md:p-4">
                  <Card className="border border-foreground/5 shadow-sm">
                    <CardContent className="p-3 md:p-6">
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="space-y-4 md:space-y-6"
                      >
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-foreground">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              First Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="firstName"
                                value={employeeData.firstName}
                                onChange={handleChangeWithValidation}
                                placeholder="First Name"
                                className={`pl-8 md:pl-10 ${getInputClass(
                                  "firstName"
                                )}`}
                              />
                              {errors.firstName && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                              )}
                            </div>
                            {errors.firstName && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.firstName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Middle Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="middleName"
                                value={employeeData.middleName}
                                onChange={handleChangeWithValidation}
                                placeholder="Middle Name"
                                className="text-foreground pl-8 md:pl-10 bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Surname
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="surname"
                                value={employeeData.surname}
                                onChange={handleChangeWithValidation}
                                placeholder="Surname"
                                className={`pl-8 md:pl-10 ${getInputClass(
                                  "surname"
                                )}`}
                              />
                              {errors.surname && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                              )}
                            </div>
                            {errors.surname && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.surname}
                              </p>
                            )}
                          </div>

                          <DatePicker
                            // {...props}
                            employeeData={employeeData}
                            handleChangeWithValidation={
                              handleChangeWithValidation
                            }
                            errors={errors}
                            getInputClass={getInputClass}
                            fieldName="dob"
                            label="Date of Birth"
                            placeholder="Select date of birth"
                          />

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Gender
                            </label>
                            <Select
                              value={employeeData.gender}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "gender",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("gender")}
                              >
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.gender && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.gender}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Village
                            </label>
                            <div className="relative">
                              <House className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="village"
                                value={employeeData.village}
                                onChange={handleChangeWithValidation}
                                placeholder="Village"
                                className={`pl-8 md:pl-10 ${getInputClass(
                                  "village"
                                )}`}
                              />
                              {errors.village && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                              )}
                            </div>
                            {errors.village && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.village}
                              </p>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-4 md:mt-6">
                          Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                Country
                              </label>
                              <Select
                                value={countryCode}
                                onValueChange={handleCountryChange}
                              >
                                <SelectTrigger
                                  className={getInputClass("phoneNumber")}
                                >
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {allCountries.map((country) => (
                                    <SelectItem
                                      key={country.isoCode}
                                      value={country.isoCode}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-2xl fi fi-${country.isoCode.toLowerCase()}`}
                                        ></span>
                                        {country.name} (+{country.phonecode})
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                Phone Number
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                                <Input
                                  value={phoneInput}
                                  onChange={(e) =>
                                    handlePhoneChange(e.target.value)
                                  }
                                  placeholder="Enter phone number"
                                  className={`pl-8 md:pl-10 ${getInputClass(
                                    "phoneNumber"
                                  )}`}
                                />
                                {errors.phoneNumber && (
                                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                                )}
                              </div>
                              {errors.phoneNumber && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="emailAddress"
                                value={employeeData.emailAddress}
                                onChange={handleChangeWithValidation}
                                placeholder="Email Address"
                                className={`pl-8 md:pl-10 ${getInputClass(
                                  "emailAddress"
                                )}`}
                              />
                              {errors.emailAddress && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                              )}
                            </div>
                            {errors.emailAddress && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.emailAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="job" className="p-2 md:p-4">
                  <Card className="border border-foreground/5 shadow-sm">
                    <CardContent className="p-3 md:p-6">
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="space-y-4 md:space-y-6"
                      >
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-foreground">
                          Job Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <DatePicker
                            // {...props}
                            employeeData={employeeData}
                            handleChangeWithValidation={
                              handleChangeWithValidation
                            }
                            errors={errors}
                            getInputClass={getInputClass}
                            fieldName="hireDate"
                            label="Hire Date"
                            placeholder="Select hire date"
                          />

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Job Title
                            </label>
                            <Select
                              value={employeeData.jobTitle}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "jobTitle",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("jobTitle")}
                              >
                                <SelectValue
                                  placeholder={
                                    jobTitle.find(
                                      (jt) => jt._id === employeeData.jobTitle
                                    )?.job_title || "Job Title"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {jobTitle.map((single) => (
                                  <SelectItem
                                    key={single._id}
                                    value={single._id}
                                  >
                                    {single.job_title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.jobTitle && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.jobTitle}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Department
                            </label>
                            <Select
                              value={employeeData.department}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "department",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("department")}
                              >
                                <SelectValue
                                  placeholder={
                                    department.find(
                                      (dept) =>
                                        dept._id === employeeData.department
                                    )?.department || "Department"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {department.map((single) => (
                                  <SelectItem
                                    key={single._id}
                                    value={single._id}
                                  >
                                    {single.department}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.department && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.department}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Work Location
                            </label>
                            <Select
                              value={employeeData.workLocation}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "workLocation",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("workLocation")}
                              >
                                <SelectValue
                                  placeholder={
                                    location.find(
                                      (wl) =>
                                        wl._id === employeeData.workLocation
                                    )?.work_location || "Work Location"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {location.map((single) => (
                                  <SelectItem
                                    key={single._id}
                                    value={single._id}
                                  >
                                    {single.work_location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.workLocation && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.workLocation}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Manager
                            </label>
                            <Select
                              value={employeeData.manager}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "manager",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="text-foreground bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue
                                  placeholder={
                                    manager.find(
                                      (man) => man._id === employeeData.manager
                                    )?.manager || "Manager"
                                  }
                                  className="text-foreground"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {manager.map((single) => (
                                  <SelectItem
                                    key={single._id}
                                    value={single._id}
                                  >
                                    {single.manager}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Cost Center
                            </label>
                            <Select
                              value={employeeData.costCenter}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "costCenter",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("costCenter")}
                              >
                                <SelectValue
                                  placeholder={
                                    costCenter.find(
                                      (cc) => cc._id === employeeData.costCenter
                                    )?.cost_center || "Cost Center"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {costCenter.map((single) => (
                                  <SelectItem
                                    key={single._id}
                                    value={single._id}
                                  >
                                    {single.cost_center}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.costCenter && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.costCenter}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Employee Type
                            </label>
                            <Select
                              value={employeeData.employeeType}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "employeeType",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="text-forground bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue
                                  placeholder={
                                    employeeType.find(
                                      (et) =>
                                        et._id === employeeData.employeeType
                                    )?.employee_type || "Employee Type"
                                  }
                                  className="text-foreground"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {employeeType.map((single) => (
                                  <SelectItem
                                    key={single._id}
                                    value={single._id}
                                  >
                                    {single.employee_type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="p-2 md:p-4">
                  <Card className="border border-foreground/5 shadow-sm">
                    <CardContent className="p-3 md:p-6">
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="space-y-4 md:space-y-6"
                      >
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-foreground">
                          Pay Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Pay Type
                            </label>
                            <Select
                              value={employeeData.payType}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "payType",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("payType")}
                              >
                                <SelectValue placeholder="Pay Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HOUR">Wages</SelectItem>
                                <SelectItem value="SALARY">Salary</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.payType && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.payType}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              {employeeData.payType === "SALARY"
                                ? "Salary"
                                : "Rate Per Hour"}
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-3 h-3 md:w-4 md:h-4" />
                              <Input
                                name="ratePerHour"
                                value={employeeData.ratePerHour}
                                onChange={handleChangeWithValidation}
                                placeholder={
                                  employeeData.payType === "SALARY"
                                    ? "Salary"
                                    : "Rate Per Hour"
                                }
                                className={`pl-8 md:pl-10 ${getInputClass(
                                  "ratePerHour"
                                )}`}
                              />
                              {errors.ratePerHour && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                              )}
                            </div>
                            {errors.ratePerHour && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.ratePerHour}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Pay Frequency
                            </label>
                            <Select
                              value={employeeData.payFrequency}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "payFrequency",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="text-foreground bg-background/5 border-background/10 text-xs md:text-sm">
                                <SelectValue placeholder="Pay Frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Fortnightly">
                                    Fortnightly
                                  </SelectItem>
                                  <SelectItem value="Monthly">
                                    Monthly
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-4 md:mt-6">
                          Payment Method
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                              Payment Method
                            </label>
                            <Select
                              value={employeeData.paymentMethod}
                              onValueChange={(value) =>
                                handleSelectChangeWithValidation(
                                  "paymentMethod",
                                  value
                                )
                              }
                            >
                              <SelectTrigger
                                className={getInputClass("paymentMethod")}
                              >
                                <SelectValue placeholder="Payment Method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                                <SelectItem value="DIRECT DEPOSIT">
                                  Direct Deposit
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.paymentMethod && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.paymentMethod}
                              </p>
                            )}
                          </div>

                          {employeeData.paymentMethod !== "CASH" && (
                            <>
                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                  Banks
                                </label>
                                <Select
                                  value={employeeData.bankName}
                                  onValueChange={(value) =>
                                    handleSelectChangeWithValidation(
                                      "bankName",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className={getInputClass("bankName")}
                                  >
                                    <SelectValue placeholder="Banks" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Banks.map((single) => {
                                      return (
                                        <SelectItem
                                          key={single._id}
                                          value={single.bank}
                                        >
                                          {single.bank}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                {errors.bankName && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.bankName}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                  Account Name
                                </label>
                                <div className="relative">
                                  <Input
                                    name="accountName"
                                    value={employeeData.accountName}
                                    onChange={handleChangeWithValidation}
                                    placeholder="Account Name"
                                    className={getInputClass("accountName")}
                                  />
                                  {errors.accountName && (
                                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                                  )}
                                </div>
                                {errors.accountName && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.accountName}
                                  </p>
                                )}
                              </div>

                              <div className="col-span-full">
                                <label className="block pb-1 text-xs md:text-sm text-foreground/70">
                                  Account Number
                                </label>
                                <div className="relative">
                                  <Input
                                    name="accountNumber"
                                    value={employeeData.accountNumber}
                                    onChange={handleChangeWithValidation}
                                    placeholder="Account Number"
                                    className={getInputClass("accountNumber")}
                                  />
                                  {errors.accountNumber && (
                                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                                  )}
                                </div>
                                {errors.accountNumber && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.accountNumber}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="allowances" className="p-2 md:p-4">
                  <Card className="border border-foreground/5 shadow-sm">
                    <CardContent className="p-3 md:p-6">
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="space-y-4 md:space-y-6"
                      >
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 text-foreground">
                          Allowances & Deductions
                        </h3>
                        <div className="mb-4">
                          <label className="flex items-center space-x-2 text-xs md:text-sm text-foreground/70">
                            <Checkbox
                              checked={employeeData.allowanceEligible}
                              onCheckedChange={(checked) =>
                                setEmployeeData((prev) => ({
                                  ...prev,
                                  allowanceEligible: checked,
                                }))
                              }
                              className="bg-background"
                            />
                            <span>Eligible for Allowances</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                          <div className="bg-background/5 p-3 md:p-4 rounded-lg">
                            <h4 className="text-sm md:text-md font-bold mb-2 md:mb-4 text-center text-foreground">
                              Allowances
                            </h4>
                            <div className="space-y-1 md:space-y-2">
                              {allownce.map((single) => (
                                <div
                                  key={single._id}
                                  className="flex items-center p-1 md:p-2 rounded text-foreground hover:bg-background/10"
                                >
                                  <Checkbox
                                    checked={selectedAllownces.includes(
                                      single._id
                                    )}
                                    onCheckedChange={() =>
                                      handleSelectChange(single._id, "allownce")
                                    }
                                    className="bg-background mr-2 md:mr-3"
                                  />
                                  <span className="text-xs md:text-sm">
                                    {single.allownce}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-background/5 p-3 md:p-4 rounded-lg">
                            <h4 className="text-sm md:text-md font-bold mb-2 md:mb-4 text-center text-foreground">
                              Deductions
                            </h4>
                            <div className="space-y-1 md:space-y-2">
                              {deduction.map((single) => (
                                <div
                                  key={single._id}
                                  className="flex items-center p-1 md:p-2 rounded text-foreground hover:bg-background/10"
                                >
                                  <Checkbox
                                    checked={selectedDeductions.includes(
                                      single._id
                                    )}
                                    onCheckedChange={() =>
                                      handleSelectChange(
                                        single._id,
                                        "deduction"
                                      )
                                    }
                                    className="bg-background mr-2 md:mr-3"
                                  />
                                  <span className="text-xs md:text-sm">
                                    {single.deduction}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4 mt-4 md:mt-6 text-foreground">
                          Leave Entitlements
                        </h3>
                        <div className="bg-background/5 p-3 md:p-4 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                            {leave.map((single) => (
                              <div
                                key={single._id}
                                className="flex items-center space-x-2 md:space-x-3 p-1 md:p-2 rounded text-foreground hover:bg-background/10"
                              >
                                <Checkbox
                                  checked={employeeData.leaves.some(
                                    (leave) => leave.leaveId === single._id
                                  )}
                                  onCheckedChange={() =>
                                    handleLeaveCheckboxChange(single._id)
                                  }
                                  className="bg-background mr-2 md:mr-3"
                                />
                                <span className="w-24 md:w-32 text-xs md:text-sm">
                                  {single.leave}
                                </span>
                                {employeeData.leaves.some(
                                  (leave) => leave.leaveId === single._id
                                ) && (
                                  <Input
                                    className="w-16 md:w-20 text-xs md:text-sm"
                                    type="number"
                                    min="0"
                                    value={
                                      employeeData.leaves.find(
                                        (leave) => leave.leaveId === single._id
                                      )?.available || 0
                                    }
                                    onChange={(e) =>
                                      handleSelectLeaveChange(
                                        single._id,
                                        e.target.value,
                                        single.balance
                                      )
                                    }
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="p-2 md:p-4">
                  <Card className="border border-foreground/5 shadow-sm">
                    <CardContent className="p-3 md:p-6">
                      <motion.div
                        variants={ANIMATION_VARIANTS.item}
                        className="space-y-4 md:space-y-6"
                      >
                        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-4  text-foreground">
                          Upload Documents
                        </h3>
                        <div className="grid gap-3 md:gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div>
                              <label className="block pb-1 text-xs md:text-sm text-foreground/60">
                                Document Type
                              </label>
                              <Input
                                name="documentType"
                                value={employeeData.documentType}
                                onChange={handleChange}
                                placeholder="Document Type"
                                className=" text-foreground bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>

                            <div>
                              <label className="block pb-1 text-xs md:text-sm text-foreground/60">
                                Document Description
                              </label>
                              <Input
                                name="documentDescription"
                                value={employeeData.documentDescription}
                                onChange={handleDescriptionChange}
                                placeholder="Document Description"
                                className="text-foreground bg-background/5 border-background/10 text-xs md:text-sm"
                              />
                            </div>

                            <div className="flex items-end">
                              <div className="relative w-full">
                                <input
                                  type="file"
                                  id="documentFile"
                                  onChange={(e) =>
                                    handleFileChange(e, "document")
                                  }
                                  className="hidden"
                                />
                                <label
                                  htmlFor="documentFile"
                                  className="block w-full bg-red_foreground text-background py-2 px-3 md:px-4 rounded-md cursor-pointer hover:bg-background hover:text-foreground border-2 transition duration-150 text-center text-xs md:text-sm"
                                >
                                  Choose File
                                </label>
                              </div>
                            </div>
                          </div>

                          {employeeData.documents.length > 0 && (
                            <div className="mt-4 md:mt-6">
                              <h4 className="text-sm md:text-md font-bold mb-1 md:mb-2">
                                Uploaded Documents
                              </h4>
                              <div className="bg-background/5 rounded-lg p-2">
                                <table className="w-full">
                                  <thead className="border-b">
                                    <tr>
                                      <th className="text-left p-1 md:p-2 text-xs md:text-sm">
                                        Type
                                      </th>
                                      <th className="text-left p-1 md:p-2 text-xs md:text-sm">
                                        Description
                                      </th>
                                      <th className="text-left p-1 md:p-2 text-xs md:text-sm">
                                        File
                                      </th>
                                      <th className="text-right p-1 md:p-2 text-xs md:text-sm">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {employeeData.documents.map(
                                      (doc, index) => (
                                        <tr
                                          key={index}
                                          className="border-b border-background/10 hover:bg-background/10"
                                        >
                                          <td className="p-1 md:p-2 text-xs md:text-sm">
                                            {doc.type}
                                          </td>
                                          <td className="p-1 md:p-2 text-xs md:text-sm">
                                            {doc.description}
                                          </td>
                                          <td className="p-1 md:p-2 text-xs md:text-sm text-foreground/70">
                                            {doc.document
                                              ? doc.document.split("/").pop()
                                              : doc.file.name}
                                          </td>
                                          <td className="p-1 md:p-2 text-right">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              onClick={() =>
                                                removeDocument(index)
                                              }
                                              className="h-6 md:h-8 px-1 md:px-2 text-destructive hover:bg-destructive/10 text-xs md:text-sm"
                                            >
                                              Remove
                                            </Button>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="bg-background/5 p-3 md:p-4 flex flex-col sm:flex-row justify-between">
                <div className="mb-2 sm:mb-0">
                  {activeTab !== "profile" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const tabs = [
                          "profile",
                          "personal",
                          "job",
                          "payment",
                          "allowances",
                          "documents",
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex - 1]);
                      }}
                      className="mr-2 bg-red_foreground border text-background hover:bg-background hover:text-foreground transition-all text-xs md:text-sm"
                    >
                      Previous
                    </Button>
                  )}
                  {activeTab !== "documents" && (
                    <Button
                      type="button"
                      onClick={() => {
                        const tabs = [
                          "profile",
                          "personal",
                          "job",
                          "payment",
                          "allowances",
                          "documents",
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        setActiveTab(tabs[currentIndex + 1]);
                      }}
                      className="bg-red_foreground text-background hover:bg-background hover:text-foreground  text-xs md:text-sm"
                    >
                      Next
                    </Button>
                  )}
                </div>
                <div>
                  {activeTab === "documents" && (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-background text-foreground hover:bg-red_foreground hover:text-background transition-all text-xs md:text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-background mr-1 md:mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Employee"
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const DatePicker = ({
  employeeData,
  handleChangeWithValidation,
  errors,
  getInputClass,
  fieldName,
  label,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    employeeData[`${fieldName}`]
      ? new Date(employeeData[`${fieldName}`])
      : undefined
  );

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (date) {
      setOpen(false);
      // Create a synthetic event to match your existing handler
      const syntheticEvent = {
        target: {
          name: fieldName,
          value: date.toISOString(),
        },
      };
      handleChangeWithValidation(syntheticEvent);
    }
  };

  // Set different date constraints based on field type
  const getDateConstraints = () => {
    if (fieldName === "dob") {
      return {
        disabled: (date) => date > new Date() || date < new Date("1900-01-01"),
      };
    } else if (fieldName === "hireDate") {
      return {
        disabled: (date) => date > new Date() || date < new Date("1900-01-01"),
      };
    }
    return {};
  };

  return (
    <div>
      <label className="block pb-1 text-xs md:text-sm text-foreground/70">
        {label}
      </label>
      <div className="relative group">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left pl-8 md:pl-10 ${getInputClass(
                fieldName
              )}`}
            >
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground group-hover:text-background w-3 h-3 md:w-4 md:h-4" />
              {selectedDate ? (
                format(selectedDate.toISOString(), "MMM dd, yyyy")
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              {...getDateConstraints()}
              initialFocus
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
        {errors[fieldName] && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
        )}
      </div>
      {errors[fieldName] && (
        <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p>
      )}
    </div>
  );
};

const PopupForm = ({ onClose, setEmployees, employeeToEdit }) => {
  const { data: session } = useSession();
  const clientId = session?.user?.username;
  const [employeeData, setEmployeeData] = useState({
    allowanceEligible: false, // Add this line
    firstName: "",
    middleName: "",
    surname: "",
    dob: new Date(),
    gender: "",
    phoneNumber: "",
    npfNumber: "",
    emailAddress: "",
    village: "",
    status: "ACTIVE",
    hireDate: new Date(),
    jobTitle: "",
    department: "",
    workLocation: "",
    manager: null,
    clientId: clientId,
    employeeId: "",
    paymentMethod: "CHEQUE",
    bankName: "",
    accountName: "",
    accountNumber: "",
    payType: "HOUR",
    ratePerHour: "",
    payFrequency: "Weekly",
    employeeType: "",
    costCenter: "",
    allownces: [],
    deductions: [],
    leaves: [],
    profileImage: "",
    documents: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costCenter, setcostCenter] = useState([]);
  const [manager, setManager] = useState([]);
  const [department, setDepartment] = useState([]);
  const [location, setlocation] = useState([]);
  const [allownce, setAllownce] = useState([]);
  const [deduction, setDeduction] = useState([]);
  const [leave, setLeave] = useState([]);
  const [jobTitle, setJobTitle] = useState([]);
  const [employeeType, setEmployeeType] = useState([]);
  const [Banks, setBank] = useState([]);
  // const [errors, setErrors] = useState({});
  const [selectedAllownces, setselectedAllownces] = useState([]);
  const [selectedDeductions, setselectedDeductions] = useState([]);
  const [profileImage, setProfileImage] = useState();
  const [uploadDocument, setUploadDocument] = useState([]);

  const handleSelectLeaveChange = (leaveID, value, balance) => {
    // Convert to number and handle empty/NaN cases
    const numericValue = Number(value) || 0;

    // Ensure value doesn't exceed the leave type's balance
    const available = Math.min(numericValue, balance);

    // Ensure value isn't negative
    const finalValue = Math.max(0, available);

    setEmployeeData((prev) => ({
      ...prev,
      leaves: prev.leaves.map((leave) =>
        leave.leaveId === leaveID
          ? {
              ...leave,
              available: finalValue,
            }
          : leave
      ),
    }));
  };
  const handleLeaveCheckboxChange = (leaveID) => {
    // Find the leave type to get its balance
    const leaveType = leave.find((l) => l._id === leaveID);

    setEmployeeData((prev) => {
      const existingLeave = prev.leaves.find((l) => l.leaveId === leaveID);

      if (existingLeave) {
        // Remove leave if already selected
        return {
          ...prev,
          leaves: prev.leaves.filter((l) => l.leaveId !== leaveID),
        };
      } else {
        // Add leave with initial value equal to the leave type's balance
        return {
          ...prev,
          leaves: [
            ...prev.leaves,
            {
              leaveId: leaveID,
              available: leaveType?.balance || 0,
            },
          ],
        };
      }
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        costRepsonse,
        depResponse,
        locationResponse,
        deductionResponse,
        allownceResponse,
        jobTitleResponse,
        employeeTypeResponse,
        leaveResponse,
        manResponse,
        bankResponse,
      ] = await Promise.all([
        axios.get(`/api/employees/costCenter?employerId=${clientId}`),
        axios.get(`/api/employees/department?employerId=${clientId}`),
        axios.get(`/api/employees/workLocation?employerId=${clientId}`),
        axios.get(`/api/employees/deduction?employerId=${clientId}`),
        axios.get(`/api/employees/allownce?employerId=${clientId}`),
        axios.get(`/api/employees/jobTitle?employerId=${clientId}`),
        axios.get(`/api/employees/employeeType?employerId=${clientId}`),
        axios.get(`/api/employees/leave?employerId=${clientId}`),
        axios.get(`/api/employees/manager?employerId=${clientId}`),
        axios.get(`/api/employees/bank?employerId=${clientId}`),
      ]);

      setcostCenter(costRepsonse.data.data);
      setDepartment(depResponse.data.data);
      setlocation(locationResponse.data.data);
      setAllownce(allownceResponse.data.data);
      setDeduction(deductionResponse.data.data);
      setJobTitle(jobTitleResponse.data.data);
      setEmployeeType(employeeTypeResponse.data.data);
      setLeave(leaveResponse.data.data);
      setManager(manResponse.data.data);
      setBank(bankResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (employeeToEdit) {
      setEmployeeData(employeeToEdit);
      setselectedDeductions(employeeToEdit.deductions);
      setselectedAllownces(employeeToEdit.allownces);
    } else {
      generateEmployeeId();
    }
  }, [employeeToEdit]);

  const generateEmployeeId = async () => {
    try {
      const response = await axios.get(`/api/employees?employerId=${clientId}`);
      const employees = response?.data?.data || [];
      const clientNumber = employeeData?.clientId?.split("-")[1];
      if (!clientNumber) throw new Error("Client ID is invalid or missing");

      const clientEmployees = employees.filter(
        (emp) => emp.clientId === employeeData.clientId
      );

      const maxId = clientEmployees.length
        ? Math.max(
            ...clientEmployees.map((emp) =>
              parseInt(emp.employeeId.split("-")[1], 10)
            )
          )
        : 0;

      const nextEmployeeNumber = String(maxId + 1).padStart(4, "0");
      setEmployeeData((prev) => ({
        ...prev,
        employeeId: `${clientNumber}-${nextEmployeeNumber}`,
      }));
    } catch (error) {
      console.error("Error generating employee ID:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployeeData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (id, type) => {
    if (type === "allownce") {
      setselectedAllownces((prevSelected) => {
        const updatedSelected = prevSelected.includes(id)
          ? prevSelected.filter((item) => item !== id)
          : [...prevSelected, id];
        setEmployeeData((prevData) => ({
          ...prevData,
          allownces: updatedSelected,
        }));
        return updatedSelected;
      });
    } else if (type === "deduction") {
      setselectedDeductions((prevSelected) => {
        const updatedSelected = prevSelected.includes(id)
          ? prevSelected.filter((item) => item !== id)
          : [...prevSelected, id];
        setEmployeeData((prevData) => ({
          ...prevData,
          deductions: updatedSelected,
        }));
        return updatedSelected;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let profileImageUrl =
        employeeData.profileImage ||
        `/uploads/profileImage/No_image_placeholder.gif`;
      let docURL = [...(employeeData.documents || [])];

      if (employeeToEdit) {
        if (profileImage && profileImage instanceof Blob) {
          const formData = new FormData();
          formData.append("file", profileImage);
          const Imageresponse = await axios.post("/api/upload/image", formData);
          profileImageUrl = Imageresponse.data.url;
        }

        if (uploadDocument.length > 0) {
          const formData2 = new FormData();
          uploadDocument.forEach((doc) => formData2.append("files", doc.file));
          const DocResponse = await axios.post(
            "/api/upload/document",
            formData2
          );
          const newDocuments = DocResponse.data.files.map((file, index) => ({
            url: file.url,
            name: file.name,
            description: uploadDocument[index].description,
          }));
          docURL = [...docURL, ...newDocuments];
        }

        const response = await axios.put(
          `/api/employees/${employeeToEdit._id}`,
          {
            ...employeeData,
            profileImage: profileImageUrl,
            documents: docURL,
          }
        );
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employeeToEdit._id ? response.data.data : emp
          )
        );
      } else {
        if (profileImage && profileImage instanceof Blob) {
          const formData = new FormData();
          formData.append("file", profileImage);
          const Imageresponse = await axios.post("/api/upload/image", formData);
          profileImageUrl = Imageresponse.data.url;
        }

        if (uploadDocument.length > 0) {
          const formData2 = new FormData();
          uploadDocument.forEach((doc) => formData2.append("files", doc.file));
          const DocResponse = await axios.post(
            "/api/upload/document",
            formData2
          );
          docURL = DocResponse.data.files.map((file, index) => ({
            url: file.url,
            name: file.name,
            description: uploadDocument[index].description,
          }));
        }

        const response = await axios.post("/api/employees", {
          ...employeeData,
          profileImage: profileImageUrl,
          documents: docURL,
        });
        setEmployees((prev) => [...prev, response.data.data]);
      }
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e, type) => {
    if (type === "profileImage") {
      setProfileImage(e.target.files[0]);
    } else if (type === "documents") {
      const files = Array.from(e.target.files);
      const newDocuments = files.map((file) => ({
        file,
        name: file.name,
        description: "",
      }));
      setUploadDocument(newDocuments);
    }
  };

  const removeDocument = (index) => {
    setEmployeeData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
    setUploadDocument((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDescriptionChange = (index, description) => {
    const updatedDocuments =
      uploadDocument.length > 0
        ? [...uploadDocument]
        : [...employeeData.documents];
    updatedDocuments[index].description = description;
    setUploadDocument(updatedDocuments);
  };

  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <EmployeeFormDialog
      employeeToEdit={employeeToEdit}
      onClose={onClose}
      handleSubmit={handleSubmit}
      employeeData={employeeData}
      setEmployeeData={setEmployeeData}
      handleChange={handleChange}
      handleFileChange={handleFileChange}
      profileImage={profileImage}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      jobTitle={jobTitle}
      department={department}
      location={location}
      manager={manager}
      costCenter={costCenter}
      employeeType={employeeType}
      allownce={allownce}
      deduction={deduction}
      leave={leave}
      selectedAllownces={selectedAllownces}
      selectedDeductions={selectedDeductions}
      uploadDocument={uploadDocument}
      Banks={Banks}
      handleDescriptionChange={handleDescriptionChange}
      removeDocument={removeDocument}
      handleSelectChange={handleSelectChange}
      handleLeaveCheckboxChange={handleLeaveCheckboxChange}
      handleSelectLeaveChange={handleSelectLeaveChange}
    />
  );
};

export default PopupForm;
