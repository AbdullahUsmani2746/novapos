"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from '@/lib/axiosInstance';
import { format } from "date-fns";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  },
};

const HelpdeskModal = ({
  complaint,
  onClose,
  onStatusUpdate = "",
  clients = null,
}) => {
  const { data: session } = useSession();
  const [setting, setSetting] = useState({});
  const id = session?.user?.username;
  const employerId = id.startsWith("CLIENT-")
    ? id
    : `CLIENT-${id.split("-")[0]}`;
  // useEffect(() => {
  //   console.log("Effect triggered for employerId:", employerId);
  //   fetchSetting();
  // }, [id]);
  // const fetchSetting = async () => {
  //   try {
  //     const res = await axios.get(`/api/setting/${employerId}`);
  //     const data = res.data.data;
  //     setSetting(data);
  //   } catch (error) {
  //     console.error("Error fetching seetings:", error);
  //   }
  // };

  console.log(setting);

  //   console.log(setting?.helpdesk[0]["resolve"]);
  let isResolver = false;

  if (
    // (Object.keys(setting).length > 0 &&
    //   setting?.helpdesk?.[0]?.resolve === id) ||
       session?.user?.role === "SuperAdmin" 
      // session?.user?.role === "Admin"
  ) {
    isResolver = true;
  }
  // const isResolver = true;
  const [employeeName, setEmployeeName] = useState("Unknown Employee");
  const [questions, setQuestions] = useState(complaint.questions || []);
  const [complaintStatus, setComplaintStatus] = useState(
    complaint.status || "Open"
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clientName, setClientName] = useState("N/A");


  useEffect(() => {
   
      axios
        .get(`${(complaint.employeeId).startsWith('CLIENT') ? `/api/employers/${complaint.employeeId}`  : `/api/employees/${complaint.employeeId}`}`)
        .then((response) =>
          setEmployeeName(((complaint.employeeId).startsWith('CLIENT') ? response.data.businessName  : response.data.data) || "Unknown Employee")
        )
        .catch(() => setEmployeeName("Unknown Employee"));
    
  }, [complaint.employeeId]);

  const handleStatusChange = (index, newStatus) => {
    if (newStatus === "Rejected") {
      setSelectedIndex(index);
      setShowRejectDialog(true);
    } else {
      const updatedQuestions = [...questions];
      updatedQuestions[index].status = newStatus;
      setQuestions(updatedQuestions);
    }
  };

  const handleRejectConfirm = async () => {
    const updatedQuestions = [...questions];
    updatedQuestions[selectedIndex].status = "Rejected";
    updatedQuestions[selectedIndex].rejectionReason = rejectionReason;
    setQuestions(updatedQuestions);

    try {
      await axios.put(`/api/helpdesk/${complaint._id}`, {
        status: "Rejected",
        rejectionReason,
        index: selectedIndex,
        complaint: false,
      });
      toast.success("Rejection reason saved successfully!", {
        className: "bg-green-500 text-white",
      });
      const allClosed = questions.every(
        (q) => q.status === "Resolved" || q.status === "Rejected"
      );

      if (allClosed) {
        setComplaintStatus("Closed");
        await axios.put(`/api/helpdesk/${complaint._id}`, {
          status: "Closed",
          complaint: true,
        });
      }

      setShowRejectDialog(false);
      onClose();
      onStatusUpdate();
    } catch (error) {
      console.error("Error saving rejection reason:", error);
      toast.error("Failed to save rejection reason.");
    }
  };

  const handleAnswerChange = (index, answers) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answers = answers;
    setQuestions(updatedQuestions);
  };

  const handleUpdateStatus = async (index) => {
    const updatedQuestion = questions[index];
    console.log(updatedQuestion.status);
    try {
      await axios.put(`/api/helpdesk/${complaint._id}`, {
        status: updatedQuestion.status,
        answer: updatedQuestion.answers,
        index: index,
        complaint: false,
      });

      const allClosed = questions.every(
        (q) => q.status === "Resolved" || q.status === "Rejected"
      );

      if (allClosed) {
        setComplaintStatus("Closed");
        await axios.put(`/api/helpdesk/${complaint._id}`, {
          status: "Closed",
          complaint: true,
        });
      }

      onStatusUpdate();
      onClose();

      toast.success("Status updated successfully!", {
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };
  const handleSaveAnswer = async (index) => {
    const updatedQuestion = questions[index];
    try {
      await axios.put(`/api/helpdesk/${complaint._id}`, {
        answer: updatedQuestion.answers,
        status: updatedQuestion.status,
        index: index,
        complaint: false,
      });

      onClose();

      const allClosed = questions.every(
        (q) => q.status === "Resolved" || q.status === "Rejected"
      );

      if (allClosed) {
        setComplaintStatus("Closed");
        await axios.put(`/api/helpdesk/${complaint._id}`, {
          status: "Closed",
          complaint: true,
        });
      }
      toast.success("Answer saved successfully!", {
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save answer.");
    }
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto"
    >
      <Card className=" border-white/10 ">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-text_background">
            Helpdesk Ticket Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background/5 border  border-background/10">
               
             
                  <motion.div variants={ANIMATION_VARIANTS.item}>
                    <label className="text-sm text-text_background/60">
                    {(complaint.employeeId.startsWith('CLIENT')) ? "Client ID" : "Employee ID"}
                    </label>
                    <p className="mt-1 text-text_background">
                      {complaint.employeeId || "N/A"}
                    </p>
                  </motion.div>

                  <motion.div variants={ANIMATION_VARIANTS.item}>
                    <label className="text-sm text-text_background/60">
                      {(complaint.employeeId.startsWith('CLIENT')) ? "Client Name" : "Employee Name"}
                    </label>
                    <p className="mt-1 text-text_background">
                      {employeeName || "N/A"}
                    </p>
                  </motion.div>
              
              

              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-text_background/60">Ticket #</label>
                <p className="mt-1 text-text_background">
                  <span>{complaint.complaintNumber}</span>
                </p>
              </motion.div>
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label className="text-sm text-text_background/60">Date</label>
                <p className="mt-1 text-text_background">
                  {format(new Date(complaint.date), "dd MMM yyyy")}
                </p>
              </motion.div>
            </div>

            <Accordion
              type="single"
              collapsible
              className=" bg-red_foreground rounded-lg text-background border data-[state=closed]:border-blue"
            >
              {questions.map((question, index) => (
                <AccordionItem
                  key={index}
                  value={`question-${index}`}
                  className="border-b rounded-xl"
                >
                  <AccordionTrigger className="text-base p-3 font-semibold text-background  !no-underline">
                    <div className="flex justify-between flex-col sm:flex-row items-center w-full pr-2">
                      <p>
                        #{index + 1}:{" "}
                        {question.subject.length > 20
                          ? question.subject.slice(0, 20) + "..."
                          : question.subject}
                      </p>

                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <Badge
                          className={`relative flex items-center gap-1 text-white px-2 py-1 text-xs sm:text-sm ${
                            question.priority === "High"
                              ? "bg-red-600"
                              : question.priority === "Medium"
                              ? "bg-yellow-600"
                              : question.priority === "Low"
                              ? "bg-green-500"
                              : ""
                          }`}
                        >
                          {question.priority}
                        </Badge>

                        {/* Status Badge with Tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                key={question.status}
                                className={`relative flex items-center gap-1 bg-[#5369da] text-background px-2 py-1 text-xs sm:text-sm ${
                                  question.status === "In Progress"
                                    ? "bg-[#F5A623]"
                                    : question.status === "To Do"
                                    ? ""
                                    : question.status === "On Hold"
                                    ? "bg-[#2D9CDB]"
                                    : question.status === "Resolved"
                                    ? "bg-green-600"
                                    : question.status === "Rejected"
                                    ? "bg-[#D0021B]"
                                    : ""
                                }`}
                              >
                                {question.status}
                                {question.status === "Rejected" && (
                                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Badge>
                            </TooltipTrigger>
                            {question.status === "Rejected" && (
                              <TooltipContent className="bg-gray-800 text-white p-2 rounded-md shadow-lg">
                                <p className="text-sm">
                                  Reason:{" "}
                                  {question.rejectionReason ||
                                    "No reason provided"}
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-3 space-y-2 bg-background border-background/5">
                    <h3 className="text-sm font-medium text-text_background/80">
                      Request Type
                    </h3>
                    <textarea
                      className="w-full p-2 border border-background/5 shadow-sm rounded-md  text-text_background"
                      disabled
                      value={question.subject}
                    />
                    <h3 className="text-sm font-medium text-text_background/80">
                      Description
                    </h3>
                    <textarea
                      className="w-full p-2 border border-background/10 rounded-md  text-text_background"
                      disabled
                      value={question.description}
                    />
                    <h3 className="text-sm font-medium text-text_background/80">
                      Answer
                    </h3>
                    <div className="relative w-full">
                      <textarea
                        className="w-full h-20 sm:h-24 p-3 sm:p-4 border border-background/10 rounded-md  text-text_background text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base pr-12 sm:pr-16"
                        placeholder="Write your answer here..."
                        value={question.answers || ""}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
                        disabled={!isResolver}
                      />
                      {isResolver && (
                        <Button
                          onClick={() => {
                            if (question.answers?.trim()) {
                              handleSaveAnswer(index);
                            } else {
                              toast.error("Answer field cannot be empty!", {
                                className: "bg-red-500 text-white",
                              });
                            }
                          }}
                          className="absolute bottom-3 right-2 bg-foreground text-background hover:text-foreground px-4 py-1 rounded-md "
                        >
                          Save
                        </Button>
                      )}
                    </div>

                    {isResolver && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-text_background/80">
                          Status
                        </h3>
                        <Select
                          value={question.status}
                          onValueChange={(value) => {
                            console.log(value !== "Rejected");
                            handleStatusChange(index, value);
                            value !== "Rejected"
                              ? handleUpdateStatus(index)
                              : handleStatusChange(index, value);
                          }}
                          className="bg-background/5 border-background/10 text-background w-[200px]"
                        >
                          <SelectTrigger className=" rounded-md">
                            <SelectValue placeholder="Select Status" className="text-background" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Rejected",
                              "Resolved",
                              "In Progress",
                              "On Hold",
                            ].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </CardContent>
      </Card>
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Rejection Reason</DialogTitle>
            <DialogDescription>
              Please specify why this ticket is being rejected.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full h-24 p-2 border rounded-md"
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <Button
            onClick={handleRejectConfirm}
            className="mt-4 bg-red-500 text-white"
          >
            Confirm Rejection
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HelpdeskModal;
