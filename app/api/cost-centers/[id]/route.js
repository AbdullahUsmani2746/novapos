import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const { id } = params
  try {
    const costCenter = await prisma.costCenter.findUnique({
      where: { id: parseInt(id) },
      include: { company: true }
    })
    return Response.json(costCenter)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Cost center not found' }), { status: 404 })
  }
}

export async function PUT(req, { params }) {
  const body = await req.json()

  const updated = await prisma.costCenter.update({
    where: { id: Number(params.id) },
    data: body,
  })

  return Response.json(updated)
}

export async function DELETE(req, { params }) {
  const { id } = params
  try {
    await prisma.costCenter.delete({
      where: { id: parseInt(id) }
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting cost center' }), { status: 500 })
  }
}
