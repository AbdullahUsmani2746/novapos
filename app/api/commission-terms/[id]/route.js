import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const { id } = params
  try {
    const commissionTerm = await prisma.commissionTerm.findUnique({
      where: { id: parseInt(id) },
    })
    return Response.json(commissionTerm)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Commission term not found' }), { status: 404 })
  }
}

export async function PUT(req, { params }) {
  const body = await req.json()

  try {
    const { id } = params

    const updatedCommissionTerm = await prisma.commissionTerm.update({
      where: { id: parseInt(id) },
      data: body,
    })

    return Response.json(updatedCommissionTerm)
  }
  catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error updating commissionTerm' }), { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = params
  try {
    await prisma.commissionTerm.delete({
      where: { id: parseInt(id) }
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting cost center' }), { status: 500 })
  }
}
