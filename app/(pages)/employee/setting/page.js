"use client";
import React, { useState, useEffect, act } from "react";
import {
  Plus,
  X,
  ChevronRight,
  Settings as SettingsIcon,
  Save,
  Mail,
  AlertCircle,
  Users,
  Coins,
  Clock,
  Menu,
  Building,
  UserCog,
  Banknote,
  Shield,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSession } from "next-auth/react";

const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("tax");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("Monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showEmailInstructions, setShowEmailInstructions] = useState(false);

  // ------ PASSWORD CHANGE STATES -------
  const [credentials, setCredentials] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    company: {
      name: "BRAVOS LIMITED",
      address: "2nd Floor, Potoi Building, Matafele, Apia, Samoa",
      phone: "(+685) 609061",
      currency: "WST",
    },
    payroll: {
      baseHoursPerWeek: 40,
      overtimeMultiplier: 1.5,
      weeklyPayMultipliers: { weekly: 1, fortnightly: 2, monthly: 4.33 },
      maxRegularHoursPerDay: 8,
      workingDaysPerWeek: 5,
      paymentDueDays: 7,
    },
    tax: {
      acc: { employee: 1, employer: 1 },
      npf: { employee: 10, employer: 10 },
      paye: {
        weekly: [
          { min: 0, max: 288, rate: 0, subtract: 0 },
          { min: 288.01, max: 481, rate: 20, subtract: 57.6 },
          { min: 481.01, max: Infinity, rate: 27, subtract: 91.27 },
        ],
        fortnightly: [
          { min: 0, max: 576, rate: 0, subtract: 0 },
          { min: 576.01, max: 962, rate: 20, subtract: 115.2 },
          { min: 962.01, max: Infinity, rate: 27, subtract: 182.54 },
        ],
        monthly: [
          { min: 0, max: 1250, rate: 0, subtract: 0 },
          { min: 1250.01, max: 2083, rate: 20, subtract: 250 },
          { min: 2083.01, max: Infinity, rate: 27, subtract: 395.81 },
        ],
      },
    },
    email: {
      enabled: true,
      companyName: "BRAVOS LIMITED",
      companyEmail: "team@bravoslimited.com",
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpSecure: false,
      appPassword: "",
      template: `Dear {employeeName},\n\nYour payslip for {period} is attached.\n\nGross: {grossPay}\nDeductions: {totalDeductions}\nNet: {netPay}\n\nHR Department`,
      subjectTemplate: `Your Payslip for {startDate} - {endDate}`,
      textTemplate: `Dear {employeeName},\n\nYour payslip for {period} is attached.\n\nGross: {grossPay}\nDeductions: {totalDeductions}\nNet: {netPay}\n\nHR Department`,
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>{headStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h2>{companyName} Payroll</h2>
              <p>Pay Period: {startDate} to {endDate}</p>
            </div>
            <!-- rest of the template -->
          </div>
        </body>
        </html>
      `,
      pdfTemplate: `
        <!DOCTYPE html>
        <html>
        <head>{headStyles}</head>
        <body>
          <div class="company-header">
            <h2>{companyName}</h2>
            <p>{companyAddress}</p>
            <!-- rest of the PDF template -->
          </div>
        </body>
        </html>
      `,
    },
    users: [
      {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        permissions: ["Dashboard", "Settings"],
      },
      {
        id: 2,
        name: "Payroll",
        email: "payroll@example.com",
        permissions: ["Dashboard"],
      },
    ],
    permissions: ["Dashboard", "Settings", "Reports", "Payroll", "Employees"],
  });

  const tabs = [
    { id: "company", label: "Company", icon: <Building size={18} /> },
    { id: "payroll", label: "Payroll", icon: <Banknote size={18} /> },
    { id: "tax", label: "Tax", icon: <Coins size={18} /> },
    { id: "email", label: "Email", icon: <Mail size={18} /> },
    { id: "helpdesk", label: "Helpdesk", icon: <UserCog size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
  ];

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Add useEffect to fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    if (activeTab === "helpdesk") {
      fetchEmployees();
    }
  }, [activeTab]);

  // Add company logo handling
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNestedSetting("company.logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    setIsLoading(true);
    localStorage.setItem("appSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
    setIsLoading(false);
  };

  const updateNestedSetting = (path, value) => {
    setSettings((prev) => {
      const parts = path.split(".");
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]] = { ...current[parts[i]] };
      }
      current[parts[parts.length - 1]] = value;
      return newState;
    });
  };

  const addTaxBracket = (period) => {
    const brackets = settings.tax.paye[period.toLowerCase()];
    const lastBracket = brackets[brackets.length - 1];
    const newBracket = {
      min: lastBracket.max,
      max: lastBracket.max * 1.5,
      rate: lastBracket.rate + 5,
      subtract: lastBracket.subtract * 1.2,
    };
    updateNestedSetting(`tax.paye.${period.toLowerCase()}`, [
      ...brackets,
      newBracket,
    ]);
  };

  const testEmailConnection = async () => {
    setTestLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Email connection successful");
    } catch {
      toast.error("Failed to connect to email server");
    }
    setTestLoading(false);
  };

  // Security ---------- Tab
  // ------ PASSWORD HAnDle Change -------
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (
      !credentials.currentPassword ||
      !credentials.newPassword ||
      !credentials.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (credentials.newPassword !== credentials.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsLoading(true);

    try {
      const session = await getSession();

      const response = await fetch(`/api/update-password/${session.user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: credentials.currentPassword,
          newPassword: credentials.newPassword,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        toast.success("Password updated successfully!");
        setCredentials({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Password update failed");
      }
    } catch (err) {
      toast.error("An error occurred, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-xl"
      >
        <SettingsIcon className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          >
            <div className="flex h-full">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className=" absolute top-4 left-4 p-2 bg-white rounded-lg shadow-lg"
              >
                <Menu className="w-5 h-5" />
              </button>

              <motion.div
                variants={sidebarVariants}
                animate={isMobileMenuOpen ? "open" : "closed"}
                className="absolute md:relative w-64 h-full bg-white border-r"
              >
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold">System Settings</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className=" absolute top-3 right-3"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-2 space-y-1">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </motion.div>

              <motion.div
                key={activeTab}
                variants={contentVariants}
                className="flex-1 bg-white overflow-y-auto"
              >
                <div className="p-6 max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={saveSettings}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {activeTab === "company" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <motion.label
                            whileHover={{ scale: 1.05 }}
                            className="cursor-pointer"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            {settings.company.logo ? (
                              <img
                                src={settings.company.logo}
                                alt="Company Logo"
                                className="w-24 h-24 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center">
                                <Plus className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </motion.label>
                        </div>
                        <div className="flex-1">
                          <Label>Company Name</Label>
                          <Input
                            value={settings.company.name}
                            onChange={(e) =>
                              updateNestedSetting(
                                "company.name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Currency</Label>
                          <Select
                            value={settings.company.currency}
                            onValueChange={(v) =>
                              updateNestedSetting("company.currency", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WST">
                                Samoan Tālā (WST)
                              </SelectItem>
                              <SelectItem value="USD">
                                US Dollar (USD)
                              </SelectItem>
                              <SelectItem value="NZD">
                                NZ Dollar (NZD)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={settings.company.address}
                          onChange={(e) =>
                            updateNestedSetting(
                              "company.address",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "payroll" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Base Hours/Week</Label>
                          <Input
                            type="number"
                            value={settings.payroll.baseHoursPerWeek}
                            onChange={(e) =>
                              updateNestedSetting(
                                "payroll.baseHoursPerWeek",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Overtime Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={settings.payroll.overtimeMultiplier}
                            onChange={(e) =>
                              updateNestedSetting(
                                "payroll.overtimeMultiplier",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Payment Due Days</Label>
                          <Input
                            type="number"
                            value={settings.payroll.paymentDueDays}
                            onChange={(e) =>
                              updateNestedSetting(
                                "payroll.paymentDueDays",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Working Days/Week</Label>
                          <Input
                            type="number"
                            value={settings.payroll.workingDaysPerWeek}
                            onChange={(e) =>
                              updateNestedSetting(
                                "payroll.workingDaysPerWeek",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "tax" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>ACC Employee (%)</Label>
                          <Input
                            type="number"
                            value={settings.tax.acc.employee}
                            onChange={(e) =>
                              updateNestedSetting(
                                "tax.acc.employee",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>ACC Employer (%)</Label>
                          <Input
                            type="number"
                            value={settings.tax.acc.employer}
                            onChange={(e) =>
                              updateNestedSetting(
                                "tax.acc.employer",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>NPF Employee (%)</Label>
                          <Input
                            type="number"
                            value={settings.tax.npf.employee}
                            onChange={(e) =>
                              updateNestedSetting(
                                "tax.acc.employee",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>NPF Employer (%)</Label>
                          <Input
                            type="number"
                            value={settings.tax.npf.employer}
                            onChange={(e) =>
                              updateNestedSetting(
                                "tax.acc.employer",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">PAYE Tax Brackets</h4>
                          <Select
                            value={selectedPayPeriod}
                            onValueChange={setSelectedPayPeriod}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Fortnightly">
                                Fortnightly
                              </SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {settings.tax.paye[selectedPayPeriod.toLowerCase()].map(
                          (bracket, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-4 gap-4 mb-2"
                            >
                              <Input
                                type="number"
                                value={bracket.min}
                                onChange={(e) => {
                                  const updated = [
                                    ...settings.tax.paye[
                                      selectedPayPeriod.toLowerCase()
                                    ],
                                  ];
                                  updated[index].min = Number(e.target.value);
                                  updateNestedSetting(
                                    `tax.paye.${selectedPayPeriod.toLowerCase()}`,
                                    updated
                                  );
                                }}
                              />
                              <Input
                                type="number"
                                value={bracket.max}
                                onChange={(e) => {
                                  const updated = [
                                    ...settings.tax.paye[
                                      selectedPayPeriod.toLowerCase()
                                    ],
                                  ];
                                  updated[index].max = Number(e.target.value);
                                  updateNestedSetting(
                                    `tax.paye.${selectedPayPeriod.toLowerCase()}`,
                                    updated
                                  );
                                }}
                              />
                              <Input
                                type="number"
                                value={bracket.rate}
                                onChange={(e) => {
                                  const updated = [
                                    ...settings.tax.paye[
                                      selectedPayPeriod.toLowerCase()
                                    ],
                                  ];
                                  updated[index].rate = Number(e.target.value);
                                  updateNestedSetting(
                                    `tax.paye.${selectedPayPeriod.toLowerCase()}`,
                                    updated
                                  );
                                }}
                              />
                              <Input
                                type="number"
                                value={bracket.subtract}
                                onChange={(e) => {
                                  const updated = [
                                    ...settings.tax.paye[
                                      selectedPayPeriod.toLowerCase()
                                    ],
                                  ];
                                  updated[index].subtract = Number(
                                    e.target.value
                                  );
                                  updateNestedSetting(
                                    `tax.paye.${selectedPayPeriod.toLowerCase()}`,
                                    updated
                                  );
                                }}
                              />
                            </div>
                          )
                        )}
                        <button
                          onClick={() => addTaxBracket(selectedPayPeriod)}
                          className="flex items-center gap-2 text-blue-600"
                        >
                          <Plus className="w-4 h-4" />
                          Add Tax Bracket
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "email" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>SMTP Host</Label>
                          <Input
                            value={settings.email.smtpHost}
                            onChange={(e) =>
                              updateNestedSetting(
                                "email.smtpHost",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>SMTP Port</Label>
                          <Input
                            type="number"
                            value={settings.email.smtpPort}
                            onChange={(e) =>
                              updateNestedSetting(
                                "email.smtpPort",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>App Password</Label>
                        <Input
                          type="password"
                          value={settings.email.appPassword}
                          onChange={(e) =>
                            updateNestedSetting(
                              "email.appPassword",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            Email Configuration
                          </h3>
                          <div className="flex gap-4">
                            <button
                              onClick={() =>
                                setShowEmailInstructions(!showEmailInstructions)
                              }
                              className="flex items-center gap-2 px-3 py-1.5 bg-muted text-foreground rounded-md hover:bg-muted/80"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Setup Instructions
                            </button>
                            <button
                              onClick={testEmailConnection}
                              disabled={testLoading}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                            >
                              <Mail className="w-4 h-4" />
                              {testLoading ? "Testing..." : "Test Connection"}
                            </button>
                          </div>
                        </div>
                        {showEmailInstructions && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">
                              Gmail App Password Instructions:
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                              <li>Go to your Google Account Security page</li>
                              <li>
                                Enable 2-Step Verification if not already
                                enabled
                              </li>
                              <li>
                                Under &apos;Signing in to Google&apos;, select
                                App passwords
                              </li>
                              <li>
                                Select app type &apos;Other&apos; and enter
                                &apos;HRMS App&apos; as name
                              </li>
                              <li>
                                Click Generate and use the provided password
                              </li>
                            </ol>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Email Subject Template</Label>
                        <Input
                          value={settings.email.subjectTemplate}
                          onChange={(e) =>
                            updateNestedSetting(
                              "email.subjectTemplate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Text Email Template</Label>
                        <textarea
                          className="w-full h-32 p-2 border rounded"
                          value={settings.email.textTemplate}
                          onChange={(e) =>
                            updateNestedSetting(
                              "email.textTemplate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>HTML Email Template</Label>
                        <textarea
                          className="w-full h-64 p-2 border rounded"
                          value={settings.email.htmlTemplate}
                          onChange={(e) =>
                            updateNestedSetting(
                              "email.htmlTemplate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>PDF Template</Label>
                        <textarea
                          className="w-full h-96 p-2 border rounded"
                          value={settings.email.pdfTemplate}
                          onChange={(e) =>
                            updateNestedSetting(
                              "email.pdfTemplate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "users" && (
                    <div className="space-y-4">
                      {settings.users.map((user) => (
                        <div key={user.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h4 className="font-medium">{user.name}</h4>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                            </div>
                            <Select>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Permissions" />
                              </SelectTrigger>
                              <SelectContent>
                                {settings.permissions.map((permission) => (
                                  <SelectItem
                                    key={permission}
                                    value={permission}
                                  >
                                    {permission}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Security-------Tab */}
                  {activeTab === "security" && (
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div className="space-y-1">
                        <Label>Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            value={credentials.currentPassword}
                            onChange={(e) =>
                              setCredentials({
                                ...credentials,
                                currentPassword: e.target.value,
                              })
                            }
                            className="h-12 pl-8"
                            disabled={isLoading}
                          />
                          {/* <button
                                              type="button"
                                              className="absolute right-0 top-0 h-12 w-10 px-3 text-gray-100 hover:text-white"
                                              onClick={() => setShowPassword(!showPassword)}
                                            ></button> */}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            value={credentials.newPassword}
                            onChange={(e) =>
                              setCredentials({
                                ...credentials,
                                newPassword: e.target.value,
                              })
                            }
                            className="h-12 pl-8"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            value={credentials.confirmPassword}
                            onChange={(e) =>
                              setCredentials({
                                ...credentials,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="h-12 pl-8 "
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsModal;
