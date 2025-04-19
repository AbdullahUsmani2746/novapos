import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const departments = await prisma.costCenter.findMany({
      include: {
        company: true
      }
    })
    return Response.json(departments)
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error fetching departments' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { dept_code, dept_name, company_id } = body

    const newCostCenter = await prisma.costCenter.create({
      data: {
        dept_code,
        dept_name,
        company_id: parseInt(company_id),
      },
    })

    return Response.json(newCostCenter)
  } catch (error) {
    console.log(error)  
    return new Response(JSON.stringify({ error: 'Error creating department' }), { status: 500 })
  }
}
