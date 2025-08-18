
import DynamicRequestApproval from "@/components/DynamicRequest";
import Header from "@/components/Others/breadcumb";

const Page = () => {

  return (
    <div className="min-h-screen bg-background">
      <Header heading="Leave Approvals"/>
      <DynamicRequestApproval type="leave" headerTitle="Leave Request Approvals Dashboard" />
    </div>
  );
};

export default Page;
