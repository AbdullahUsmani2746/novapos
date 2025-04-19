import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const financialYears = await prisma.financialYear.findMany()
  return Response.json(financialYears)
}

export async function POST(req) {
  const body = await req.json()
  const { date_from, date_to, ...rest } = body

  if (!date_from || isNaN(Date.parse(date_from))) {
    return new Response(JSON.stringify({ error: "Invalid or missing date_from" }), { status: 400 })
  }

  if (!date_to || isNaN(Date.parse(date_to))) {
    return new Response(JSON.stringify({ error: "Invalid or missing date_to" }), { status: 400 })
  }

  try {
    const newFinancialYear = await prisma.financialYear.create({
      data: {
        ...rest,
        date_from: new Date(date_from),
        date_to: new Date(date_to),
      },
    })

    return Response.json(newFinancialYear)
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create financial year", details: error.message }), { status: 500 })
  }
}

