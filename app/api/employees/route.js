import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
 try {
   const employees = await prisma.employee.findMany({
     include: {
       leaves: true,
       documents: true,
       manager: true,
       employer: true
     }
   })
   return Response.json(employees)
 } catch (error) {
   console.log(error)
   return new Response(JSON.stringify({ error: 'Error fetching employees' }), { status: 500 })
 }
}

export async function POST(req) {
 try {
   const body = await req.json()

   const newEmployee = await prisma.employee.create({
     data: {
       first_name: body.first_name,
       middle_name: body.middle_name,
       surname: body.surname,
       dob: new Date(body.dob),
       gender: body.gender,
       phone_number: body.phone_number,
       npf_number: body.npf_number,
       email_address: body.email_address,
       village: body.village,
       status: body.status,
       hire_date: new Date(body.hire_date),
       job_title: body.job_title,
       department: body.department,
       work_location: body.work_location,
      //  manager_id: body.manager_id,
      //  client_id: body.client_id ?? null,
      //  employee_id: body.employee_id,
      //  payment_method: body.payment_method,
       bank_name: body.bank_name,
       account_name: body.account_name,
       account_number: body.account_number,
       pay_type: body.pay_type,
       rate_per_hour: parseFloat(body.rate_per_hour),
       pay_frequency: body.pay_frequency,
       employee_type: body.employee_type,
       cost_center: body.cost_center,
       allownces: body.allownces,
       allownce_eligible: body.allownce_eligible || false,
       deductions: body.deductions,
       profile_image: body.profile_image
     },
   })

   return Response.json(newEmployee)
 } catch (error) {
   console.log(error)
   return new Response(JSON.stringify({ error: 'Error creating employee' }), { status: 500 })
 }
}