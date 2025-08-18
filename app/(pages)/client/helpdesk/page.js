"use client";
import Helpdesk from '@/components/Helpdesk/Helpdesk';
import React, { useState } from 'react';
import Header from "@/components/Others/breadcumb";
import DataManagementPage from "@/components/Dynamic/DataManagement";
import { useSession } from 'next-auth/react';
import HelpdeskDashboard from '@/components/Helpdesk/HelpdeskDashboard';
import { format } from 'date-fns';

const Page = () => {
  const { data: session } = useSession();
  const [refreshDashboard, setRefreshDashboard] = useState(false);

  const employerId = session?.user?.username;
  const isResolver = false;
  const id = isResolver ? employerId : employerId;

  const columns = [
    { key: 'complaintNumber', header: 'Ticket No' },
   
      {
        key: 'date',
        header: 'Date',
        cell: (item) => format(new Date(item.date), 'dd MMM yyyy')
      },
      
    { key: 'status', header: 'Status' }

  ];

  const handleStatusUpdate = () => {
    setRefreshDashboard((prev) => !prev);
  };

  return (
    <div>
      <Header heading="Help Desk" />

      {/* {isResolver && <HelpdeskDashboard  client={true} refreshDashboard={refreshDashboard} />} */}

      <DataManagementPage
        pageTitle="Help Desk"
        pageDescription="Manage and track your tickets efficiently"
        addButtonText={isResolver ? "" : "Report Issue"}
        Helpdesk={true}
        apiEndpoint={id ? `/api/helpdesk/${id}` : null}
        columns={columns}
        employerId={id}
        searchKeys={['complaintNumber', 'status']}
        FormComponent={Helpdesk}
        onStatusUpdate={handleStatusUpdate}
        userRole="Employer"
      />
    </div>
  );
};

export default Page;
