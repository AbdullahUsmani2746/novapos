import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const { id } = params
  try {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: { company: true }
    })
    return Response.json(department)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Department not found' }), { status: 404 })
  }
}

export async function PUT(req, { params }) {
  const body = await req.json()

  try {
    const { id } = params
    const { dept_name, company_id } = body

    const updatedCostCenter = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        dept_name,
        company_id: parseInt(company_id),
      },
    })

    return Response.json(updatedCostCenter)
  }
  catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating department' }), { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = params
  try {
    await prisma.department.delete({
      where: { id: parseInt(id) }
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting cost center' }), { status: 500 })
  }
}
