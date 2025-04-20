import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_, { params }) {
  const financialYear = await prisma.financialYear.findUnique({
    where: { id: Number(params.id) },
  })
  return Response.json(financialYear)
}

export async function PUT(req, { params }) {
  const body = await req.json()
  const { date_from, date_to, ...rest } = body

  const updated = await prisma.financialYear.update({
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
  const deleted = await prisma.financialYear.delete({
    where: { id: Number(params.id) },
  })

  return Response.json(deleted)
}