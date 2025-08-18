
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Employee from "@/models/Employee/employee.models";
import Department from "@/models/Employee/department.models";
import JobTitle from "@/models/Employee/job_title.models";
import EmployeeType from "@/models/Employee/employee_type.models";
import CostCenter from "@/models/Employee/cost-center.models";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import connectDB from "@/utils/dbConnect"; // Ensure you connect to the database
import noProfile from "@/public/uploads/profileImage/No_image_placeholder.gif";
import Header from "@/components/Others/breadcumb";

const profileComponent = async (props) => {
  // Fetch Employee Data
  await connectDB(); // Connect to the database
  const employee = await Employee.findOne({ employeeId: "001-0005" }).lean();
  const department = await Department.findById((employee.department));
  const jobTitle = await JobTitle.findById((employee.jobTitle));
  const employeeType = await EmployeeType.findById((employee.employeeType));
  const costCenter = await CostCenter.findById((employee.costCenter));

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-foreground text-lg">Employee not found</h1>
      </div>
    );
  }

  return (
    <>
      <Header heading="Employee Profile" />
      <div className="min-h-screen bg-background py-10 px-4">
        {/* Container */}
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Profile Header */}
          <div className="flex space-x-6  justify-center">
            <Card className="p-6 bg-foreground text-background w-[35%] h-[150px]">
              <div className="flex items-center">

                <Avatar className="w-24 h-24 rounded-full">
                  <AvatarImage src={employee.profileImage} alt="Employee Profile Image" />
                  <AvatarFallback className="rounded-lg">{noProfile.src}</AvatarFallback>
                </Avatar>
                <div className="ml-6 ">
                  <h1 className="text-2xl font-bold text-background">{employee.firstName} {employee.surname}</h1>
                  <p className="text-background">{jobTitle.job_title}</p>
                  <p className="text-background text-sm">{employee.emailAddress}</p>
                  <p className="text-background text-sm">{employee.phoneNumber}</p>
                </div>
              </div>
            </Card>

            {/* Employee Details Section */}
            <Card className="w-[45%]">
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Gender</TableCell>
                      <TableCell>{employee.gender}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Date of Birth</TableCell>
                      <TableCell>{new Date(employee.dob).toLocaleDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Hire Date</TableCell>
                      <TableCell>{new Date(employee.hireDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>{department.department}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pay Type</TableCell>
                      <TableCell>{employee.payType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rate Per Hour</TableCell>
                      <TableCell>${employee.ratePerHour}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Employee Type</TableCell>
                      <TableCell>{employeeType.employee_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cost Center</TableCell>
                      <TableCell>{costCenter.cost_center}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          {/* Documents Section */}
          {employee.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {employee.documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between bg-background p-3 rounded-md">
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-foreground">{doc.description}</p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default profileComponent;


