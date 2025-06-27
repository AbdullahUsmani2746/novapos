// app/dashboard/page.js
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, Calculator, Users, BarChart3, ShoppingCart, DollarSign } from "lucide-react"
import { redirectByRole } from "@/lib/auth-helpers"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      // Redirect based on role
      const redirectUrl = redirectByRole(session.user.role)
      if (redirectUrl !== "/dashboard") {
        router.push(redirectUrl)
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const userRole = session?.user?.role

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Role: <span className="font-medium capitalize">{userRole?.toLowerCase()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* POS Access */}
          {["ADMIN", "MANAGER", "CASHIER"].includes(userRole) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/pos/dashboard")}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Point of Sale</CardTitle>
                    <CardDescription>Manage sales and transactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Open POS System
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Accounting Access */}
          {["ADMIN", "ACCOUNTANT", "MANAGER"].includes(userRole) && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/accounting/dashboard")}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calculator className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Accounting</CardTitle>
                    <CardDescription>Financial management and reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Open Accounting
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Panel */}
          {userRole === "ADMIN" && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin/dashboard")}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Admin Panel</CardTitle>
                    <CardDescription>User management and settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Open Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today&apos;s Sales</p>
                  <p className="text-2xl font-bold text-gray-900">$2,350</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$45,231</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">573</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// app/pos/dashboard/page.js
// export default function POSDashboard() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">POS Dashboard</h1>
//           <p className="text-gray-600 mt-2">Point of Sale System</p>
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle>Current Sale</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="text-center py-12 text-gray-500">
//                   <Store className="w-12 h-12 mx-auto mb-4" />
//                   <p>No items in cart</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Quick Actions</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <Button className="w-full">New Sale</Button>
//               <Button className="w-full" variant="outline">View Products</Button>
//               <Button className="w-full" variant="outline">Sales History</Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

// // app/accounting/dashboard/page.js
// export default function AccountingDashboard() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Accounting Dashboard</h1>
//           <p className="text-gray-600 mt-2">Financial Management System</p>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Revenue</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600">$45,231.89</div>
//               <p className="text-sm text-gray-600">+20.1% from last month</p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Expenses</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600">$12,234.56</div>
//               <p className="text-sm text-gray-600">+5.4% from last month</p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Profit</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-600">$32,997.33</div>
//               <p className="text-sm text-gray-600">+15.3% from last month</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

// // app/admin/dashboard/page.js
// export default function AdminDashboard() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-600 mt-2">System Administration</p>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Total Users</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">24</div>
//               <p className="text-sm text-gray-600">Active users</p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Admins</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">3</div>
//               <p className="text-sm text-gray-600">System administrators</p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Cashiers</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">12</div>
//               <p className="text-sm text-gray-600">POS operators</p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Accountants</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">4</div>
//               <p className="text-sm text-gray-600">Financial staff</p>
//             </CardContent>
//           </Card>
//           </div>
//           </div>
//           </div>

//           )}