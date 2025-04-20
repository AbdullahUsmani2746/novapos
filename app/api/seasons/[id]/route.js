import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_, { params }) {
  const season = await prisma.season.findUnique({
    where: { id: Number(params.id) },
  })
  return Response.json(season)
}

export async function PUT(req, { params }) {
  const body = await req.json()
  const { date_from, date_to, ...rest } = body

  const updated = await prisma.season.update({
    where: { id: Number(params.id) },
    data: {
      ...rest,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined,
    },
  })

  return Response.json(updated)
}

export async function DELETE(_, { params }) {
  const deleted = await prisma.season.delete({
    where: { id: Number(params.id) },
  })

  return Response.json(deleted)
}