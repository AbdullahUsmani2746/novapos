import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const seasons = await prisma.season.findMany()
  return Response.json(seasons)
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
    const newSeason = await prisma.season.create({
      data: {
        ...rest,
        date_from: new Date(date_from),
        date_to: new Date(date_to),
      },
    })

    return Response.json(newSeason)
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create season", details: error.message }), { status: 500 })
  }
}

