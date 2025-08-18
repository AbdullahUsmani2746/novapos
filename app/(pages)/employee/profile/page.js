"use client";
import { useState, useEffect } from "react";
import { Venus, Mars, CircleSmall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  User,
  Briefcase,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Building2,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Header from "@/components/Others/breadcumb";
import LoadingSpinner from "@/components/Others/spinner";

const EmployeeProfile = () => {
  const { data: session } = useSession();

  const employeeId = session?.user?.username;
  const [employee, setEmployee] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  // Add new state variables at the top of the component
  const [costCenters, setCostCenters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);

  useEffect(() => {
    // Modified fetchData function
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // First fetch employee data
        const employeeResponse = await axios.get(
          `/api/employees/${employeeId}`
        );
        const employeeData = employeeResponse.data.EmployeeData;
        setEmployee(employeeData);

        // Get employer ID from employee data
        const employerId = employeeData.clientId;

        // Then fetch related data using employerId
        const [
          costResponse,
          depResponse,
          locationResponse,
          jobTitleResponse,
          employeeTypeResponse,
        ] = await Promise.all([
          axios.get(`/api/employees/costCenter?employerId=${employerId}`),
          axios.get(`/api/employees/department?employerId=${employerId}`),
          axios.get(`/api/employees/workLocation?employerId=${employerId}`),
          axios.get(`/api/employees/jobTitle?employerId=${employerId}`),
          axios.get(`/api/employees/employeeType?employerId=${employerId}`),
        ]);

        // Update state with fetched data
        setCostCenters(costResponse.data.data);
        setDepartments(depResponse.data.data);
        setLocations(locationResponse.data.data);
        setJobTitles(jobTitleResponse.data.data);
        setEmployeeTypes(employeeTypeResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (employeeId) fetchData();
  }, [employeeId]);

  // Utility function to get display name from ID
  const getDisplayName = (id, collection, field) => {
    return collection.find((item) => item._id === id)?.[field] || "N/A";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="">
      <div className="container mx-auto px-4 lg:px-4">
        <Header heading="Employee Profile" />

        <AnimatePresence>
          {isLoading ? (
            <LoadingSpinner
              variant="pulse"
              size="large"
              text="Processing..."
              fullscreen={true}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className=" rounded-2xl overflow-hidden"
              >
                <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 relative">
                  {/* Profile Image */}
                  <motion.div
                    variants={itemVariants}
                    className="relative group"
                  >
                    <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-white shadow-lg">
                      <AvatarImage
                        src={
                          employee.profileImage !==
                          "/uploads/profileImage/No_image_placeholder.gif"
                            ? employee.profileImage
                            : undefined
                        }
                        alt={`${employee.firstName} ${employee.surname}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {employee.profileImage ===
                        "/uploads/profileImage/No_image_placeholder.gif" ? (
                          <div className="flex items-center justify-center h-full">
                            {employee.gender === "FEMALE" ? (
                              <Venus className="w-8 h-8 text-pink-600" />
                            ) : employee.gender === "MALE" ? (
                              <Mars className="w-8 h-8 text-foreground" />
                            ) : (
                              <CircleSmall className="w-8 h-8 text-purple-600" />
                            )}
                          </div>
                        ) : (
                          <span>
                            {employee.firstName?.[0]}
                            {employee.surname?.[0]}
                          </span>
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="absolute bottom-0 right-0"
                    >
                      <Badge
                        className={`  
                          ${
                            employee.status === "ACTIVE"
                              ? "bg-green-500 text-white hover:text-foreground"
                              : "bg-red-500 text-white hover:text-background"
                          } 
                          flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                        `}
                      >
                        {employee.status === "ACTIVE" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {employee.status}
                      </Badge>
                    </motion.div>
                  </motion.div>

                  {/* Personal Info */}
                  <motion.div
                    variants={itemVariants}
                    className="text-center lg:text-left flex-1"
                  >
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-text_background mb-2  ">
                      {employee.firstName} {employee.middleName}{" "}
                      {employee.surname}
                    </h1>
                    <div className="flex flex-col lg:flex-row gap-4 justify-center lg:justify-start mt-4 ">
                      {[
                        {
                          icon: Briefcase,
                          text: getDisplayName(
                            employee.jobTitle,
                            jobTitles,
                            "job_title"
                          ),
                        },
                        {
                          icon: Building2,
                          text: getDisplayName(
                            employee.department,
                            departments,
                            "department"
                          ),
                        },
                        {
                          icon: MapPin,
                          text: getDisplayName(
                            employee.workLocation,
                            locations,
                            "work_location"
                          ),
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 text-text_background bg-gray-100 px-3 py-1.5 rounded-full"
                        >
                          <item.icon className="w-4 h-4 text-red_foreground" />
                          <span className="text-sm font-medium">
                            {item.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Tabs Section */}
              <Tabs
                defaultValue="personal"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                {/* Tab Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <TabsList className="grid grid-cols-4 gap-2 bg-white shadow-md rounded-xl p-1.5 mb-6">
                    {["personal", "employment", "payroll", "documents"].map(
                      (tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className={`
                          capitalize text-sm font-semibold 
                          ${
                            activeTab === tab
                              ? "bg-gradient-to-l from-red_foreground to-red_foreground !text-background"
                              : "text-text_background hover:text-background hover:bg-red_foreground"
                          }
                          transition-all duration-300 rounded-lg py-2
                        `}
                        >
                          {tab}
                        </TabsTrigger>
                      )
                    )}
                  </TabsList>
                </motion.div>

                {/* Tab Content */}
                {["personal", "employment", "payroll", "documents"].map(
                  (tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-6">
                      <AnimatePresence mode="wait">
                        {activeTab === tab && (
                          <motion.div
                            key={tab}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: "tween" }}
                          >
                            <Card className="bg-white border-none  rounded-2xl overflow-hidden">
                              <CardHeader className="bg-gradient-to-l from-background  to-red_foreground py-5 px-6">
                                <CardTitle className="text-xl font-bold text-background">
                                  {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                                  Information
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-6 lg:p-8">
                                {tab === "documents" ? (
                                  <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                  >
                                    {employee.documents?.map((doc, index) => (
                                      <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                                      >
                                        <div className="flex items-center gap-3 mb-3">
                                          <FileText className="w-6 h-6 text-text_background" />
                                          <h3 className="font-semibold text-gray-800">
                                            {doc.name}
                                          </h3>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                          {doc.description}
                                        </p>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(
                                      tab === "personal"
                                        ? {
                                            "Date of Birth": formatDate(
                                              employee.dob
                                            ),
                                            Gender: employee.gender,
                                            Phone: employee.phoneNumber,
                                            Email: employee.emailAddress,
                                          }
                                        : tab === "employment"
                                        ? {
                                            "Hire Date": formatDate(
                                              employee.hireDate
                                            ),
                                            "Employee Type": getDisplayName(
                                              employee.employeeType,
                                              employeeTypes,
                                              "employee_type"
                                            ),
                                            "Cost Center": getDisplayName(
                                              employee.costCenter,
                                              costCenters,
                                              "cost_center"
                                            ),
                                          }
                                        : {
                                            "Pay Type": employee.payType,
                                            "Payment Method":
                                              employee.paymentMethod,
                                            "Bank Name": employee.bankName,
                                            "Account Name":
                                              employee.accountName,
                                          }
                                    ).map(([key, value], index) => (
                                      <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          delay: index * 0.1,
                                          type: "spring",
                                          stiffness: 100,
                                        }}
                                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                                      >
                                        <div className="flex items-center gap-3 mb-2">
                                          {getIcon(
                                            key,
                                            "w-5 h-5 text-red_foreground"
                                          )}
                                          <p className="text-sm font-medium text-text_background">
                                            {key}
                                          </p>
                                        </div>
                                        <p className="text-base font-semibold text-text_background">
                                          {value}
                                        </p>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                  )
                )}
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const getIcon = (key, className) => {
  const icons = {
    "Date of Birth": Calendar,
    Gender: User,
    Phone: Phone,
    Email: Mail,
    "Hire Date": Calendar,
    "Employee Type": Briefcase,
    "Cost Center": Building2,
    "Pay Type": DollarSign,
    "Payment Method": CreditCard,
    "Bank Name": Building2,
    "Account Name": User,
  };
  const IconComponent = icons[key] || User;
  return <IconComponent className={className} />;
};

export default EmployeeProfile;
