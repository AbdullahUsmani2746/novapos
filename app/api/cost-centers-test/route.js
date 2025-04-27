import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const costCenters = await prisma.costCenter.findMany({
      include: {
        company: true
      }
    })
    return Response.json(costCenters)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching cost centers' }), { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { ccno, ccname, company_id } = body

    const newCostCenter = await prisma.costCenter.create({
      data: {
        ccno: parseInt(ccno),
        ccname,
        company_id: parseInt(company_id),
      },
    })

    return Response.json(newCostCenter)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating cost center'+error }), { status: 500 })
  }
}
