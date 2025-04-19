import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const godowns = await prisma.godown.findMany({
      include: {
        company: true
      }
    })
    return Response.json(godowns)
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error fetching godowns' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { godown, company_id } = body

    const newGodown = await prisma.godown.create({
      data: {
        godown,
        company_id: parseInt(company_id),
      },
    })

    return Response.json(newGodown)
  } catch (error) {
    console.log(error)  
    return new Response(JSON.stringify({ error: 'Error creating godown' }), { status: 500 })
  }
}
