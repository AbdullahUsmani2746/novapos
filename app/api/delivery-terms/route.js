import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const deliveryTerms = await prisma.deliveryTerm.findMany({
    })
    return Response.json(deliveryTerms)
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error fetching delivery terms' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()

    const newDeliveryTerm = await prisma.deliveryTerm.create({
      data: body,
    })

    return Response.json(newDeliveryTerm)
  } catch (error) {
    console.log(error)  
    return new Response(JSON.stringify({ error: 'Error creating delivery term' }), { status: 500 })
  }
}
