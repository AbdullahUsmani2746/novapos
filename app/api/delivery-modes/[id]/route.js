import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const { id } = params
  try {
    const deliveryMode = await prisma.deliveryMode.findUnique({
      where: { id: parseInt(id) },
      include: { company: true }
    })
    return Response.json(deliveryMode)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Delivery mode not found' }), { status: 404 })
  }
}

export async function PUT(req, { params }) {
  const body = await req.json()

  try {
    const { id } = params

    const updatedDeliveryMode = await prisma.deliveryMode.update({
      where: { id: parseInt(id) },
      data: {
        delivery_mode: body.delivery_mode,
        rate_kg: parseFloat(body.rate_kg),
      },
    })

    return Response.json(updatedDeliveryMode)
  }
  catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error updating deliveryMode' }), { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = params
  try {
    await prisma.deliveryMode.delete({
      where: { id: parseInt(id) }
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting cost center' }), { status: 500 })
  }
}
