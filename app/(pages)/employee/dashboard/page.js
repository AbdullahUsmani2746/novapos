"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  elements,
} from "chart.js";
import LoadingSpinner from "@/components/Others/spinner";
import AttendanceSummary from "@/components/User/attendance-summary";
import Header from "@/components/Others/breadcumb";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

 


  return (
    <>
      <Header heading="Dashboard" />
      {isLoading ? (<LoadingSpinner/>):
      (
        <div className="text-center"><AttendanceSummary/></div>
      )
}
    </>
  );
};

export default Dashboard;
