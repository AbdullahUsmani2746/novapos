import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const deliveryModes = await prisma.deliveryMode.findMany({
    })
    return Response.json(deliveryModes)
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error fetching delivery modes' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()

    const newDeliveryMode = await prisma.deliveryMode.create({
      data: {
        delivery_mode: body.delivery_mode,
        rate_kg: parseFloat(body.rate_kg),
      },
    })

    return Response.json(newDeliveryMode)
  } catch (error) {
    console.log(error)  
    return new Response(JSON.stringify({ error: 'Error creating delivery mode' }), { status: 500 })
  }
}
