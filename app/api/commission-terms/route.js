import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const commissionTerms = await prisma.commissionTerm.findMany({
    })
    return Response.json(commissionTerms)
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Error fetching commission terms' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()

    const newCommissionTerm = await prisma.commissionTerm.create({
      data: body,
    })

    return Response.json(newCommissionTerm)
  } catch (error) {
    console.log(error)  
    return new Response(JSON.stringify({ error: 'Error creating commission term' }), { status: 500 })
  }
}
