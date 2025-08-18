import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from '@/lib/axiosInstance';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaHourglassHalf, FaList, FaPauseCircle, FaThumbsUp, FaTimesCircle } from "react-icons/fa";

const HelpdeskDashboard = ({ refreshDashboard = false, isAdmin, client=false }) => {

    const { data: session } = useSession();
    const [questionCounts, setQuestionCounts] = useState({});
    const [complaintStatusCounts, setComplaintStatusCounts] = useState({});

    const stats = [
        { title: "Total Tickets", value: (complaintStatusCounts.Closed) + (complaintStatusCounts.open), icon: <FaList className="text-blue-500 text-3xl" />, color: "text-blue-600" },
        { title: "Open Tickets", value: (complaintStatusCounts.open), icon: <FaExclamationCircle className="text-yellow-500 text-3xl" />, color: "text-yellow-600" },
        { title: "Closed Tickets", value: (complaintStatusCounts.Closed), icon: <FaCheckCircle className="text-green-500 text-3xl" />, color: "text-green-600" },
        { title: "On Hold", value: (questionCounts["On Hold"]), icon: <FaPauseCircle className="text-blue-500 text-3xl" />, color: "text-blue-600" },
        { title: "In Progress", value: (questionCounts["In Progress"]), icon: <FaHourglassHalf className="text-orange-500 text-3xl" />, color: "text-orange-600" },
        { title: "Resolved Tickets", value: (questionCounts.Resolved), icon: <FaThumbsUp className="text-purple-500 text-3xl" />, color: "text-purple-600" },
        { title: "Rejected Tickets", value: (questionCounts.Rejected), icon: <FaTimesCircle className="text-red-500 text-3xl" />, color: "text-red-600" },

    ];

    const employeeId = session?.user?.username;
    const employerId = client ? session?.user?.username :  `CLIENT-${employeeId.split("-")[0]}`;


    useEffect(() => {

        fetchCounts();
    }, [refreshDashboard])

    const fetchCounts = async () => {

        try {
            const response = await axios.get(`/api/helpdesk/${isAdmin ? "admin" : employerId}`);

            if (response) {
                setQuestionCounts(response.data.questionStatusCounts)
                setComplaintStatusCounts(response.data.complaintStatusCounts)
            }
        } catch (error) {
            console.error("Error fetching helpdesk data:", error); 

        }
    }

    return (
        <div className="p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-center gap-6">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="flex items-center flex-col justify-center bg-background shadow-xl rounded-xl px-4 py-2 max-h-[120px] transition-transform transform hover:scale-105 w-44 h-44 border-none"
                    >
                        <CardHeader className=" p-0 flex flex-row items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                                {stat.icon}
                            </div>
                            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 flex items-center justify-between">
                            <p className={`text-xl font-semibold ${stat.color}`}>
                                {isNaN(stat.value) || stat.value === undefined ? "0" : stat.value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default HelpdeskDashboard;
