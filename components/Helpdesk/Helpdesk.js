"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from '@/lib/axiosInstance';
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Save, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
};

const Helpdesk = ({ onClose }) => {
  const { data: session } = useSession();
  const employeeId = session?.user?.username;
  const employerId = `CLIENT-${employeeId.split("-")[1]}`;
  const [tickets, setTickets] = useState([]);
  const [fields, setFields] = useState([
    { title: "", description: "", priority: "Medium" },
  ]);
  // const [setting, setSetting] = useState({});

  // useEffect(() => {
  //   console.log("Effect triggered for employerId:", employerId);
  //   fetchSetting();
  // }, [employeeId]);
  // const fetchSetting = async () => {
  //   try {
  //     const res = await axios.get(`/api/setting/${employerId}`);
  //     const data = res.data.data;
  //     setSetting(data);
  //   } catch (error) {
  //     console.error("Error fetching seetings:", error);
  //   }
  // };

  const isDash = false;
    // Object.keys(setting).length > 0 &&
    // setting?.helpdesk?.[0]?.chat === employeeId
    //   ? true
    //   : false;

  // const isDash = session?.user?.isDash || false;
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedFields = fields.map((field) => ({
      title: field.title.trim(),
      description: field.description.trim(),
    }));

    const hasEmptyFields = cleanedFields.some(
      (field) => field.title === "" || field.description === ""
    );

    if (hasEmptyFields) {
      toast.error("All fields are required!", {
        className: "bg-red-500 text-white",
      });
      return;
    }

    const newTicket = {
      employeeId,
      employerId,
      isAdmin: isDash ? true : false,
      questions: fields.map((field) => ({
        subject: field.title,
        description: field.description,
        priority: field.priority,
      })),
    };

    try {
      const response = await axios.post(
        `/api/helpdesk/${employeeId}`,
        newTicket,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setTickets([...tickets, response.data]);
      setFields([{ title: "", description: "", priority: "Medium" }]);

      toast.success("Complaint submitted successfully!", {
        className: "bg-green-500 text-white",
      });
      onClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to submit complaint.");
    }
  };

  const addField = () => {
    setFields([...fields, { title: "", description: "", priority: "Medium" }]);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  return (
    <>
      <Card className="w-full max-w-3xl  border-white/10">
        <CardHeader className="px-4 py-3 border-b border-background/10">
          <CardTitle className="text-2xl text-foreground font-bold mb-3">
            Raise New Tickets
          </CardTitle>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={index}
                  variants={ANIMATION_VARIANTS.item}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 p-4 rounded-lg bg-background/5 border border-background/10"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Question {index + 1}
                    </h3>

                    <div className="space-y-2">
                      <label
                        htmlFor="requestType"
                        className="text-sm text-foreground/60"
                      >
                        Request Type
                      </label>
                      <select
                        id="requestType"
                        value={field.title}
                        onChange={(e) =>
                          updateField(index, "title", e.target.value)
                        }
                        className="w-full p-2 rounded border border-background/10 bg-transparent text-foreground focus:ring-2 focus:ring-background/20"
                      >
                        <option
                          value=""
                          disabled
                          hidden
                          className="text-foreground/60"
                        >
                          Select a request type
                        </option>
                        <option
                          value="Payroll Processing"
                          className="bg-background text-foreground"
                        >
                          Payroll Processing
                        </option>
                        <option
                          value="System Access"
                          className="bg-background text-foreground"
                        >
                          System Access
                        </option>
                        <option
                          value="Employee Information"
                          className="bg-background text-foreground"
                        >
                          Employee Information
                        </option>
                        <option
                          value="Reporting"
                          className="bg-background text-foreground"
                        >
                          Reporting
                        </option>
                        <option
                          value="Technical Issue"
                          className="bg-background text-foreground"
                        >
                          Technical Issue
                        </option>
                        <option
                          value="General Inquiry"
                          className="bg-background text-foreground"
                        >
                          General Inquiry
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-foreground/60">
                        Priority
                      </label>
                      <select
                        value={field.priority}
                        onChange={(e) =>
                          updateField(index, "priority", e.target.value)
                        }
                        className="w-full p-2 rounded-md border border-background/10 bg-transparent text-foreground"
                      >
                        <option
                          value="High"
                          className="bg-background text-foreground"
                        >
                          High
                        </option>
                        <option
                          value="Medium"
                          className="text-foreground bg-background"
                        >
                          Medium
                        </option>
                        <option
                          value="Low"
                          className="text-foreground bg-background"
                        >
                          Low
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-foreground/60">
                        Description
                      </label>
                      <Textarea
                        value={field.description}
                        onChange={(e) =>
                          updateField(index, "description", e.target.value)
                        }
                        placeholder="Enter details about your request"
                        className="bg-transparent border-background/10 text-foreground placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {index > 0 && (
                    <motion.div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => removeField(index)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex justify-end w-full gap-3  pt-4 border-t border-background/10">
              <Button
                type="button"
                onClick={addField}
                variant="outline"
                className="w-full md:w-auto  hover:text-background hover:bg-red_foreground  text-foreground bg-background transition-all duration-200 shadow-xl hover:shadow-background/20 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Another
              </Button>
              <Button
                type="submit"
                className="w-full md:w-auto hover:text-foreground hover:border hover:border-foreground/5 hover:bg-background  transition-all duration-200 shadow-xl hover:shadow-background/20 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
              >
                <Save className="w-4 h-4 mr-2" /> Submit
              </Button>
            </div>
          </motion.form>
        </CardHeader>
      </Card>
    </>
  );
};

export default Helpdesk;
