import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_, { params }) {
  const company = await prisma.company.findUnique({
    where: { id: Number(params.id) },
  })
  return Response.json(company)
}

export async function PUT(req, { params }) {
  const body = await req.json()

  const updated = await prisma.company.update({
    where: { id: Number(params.id) },
    data: body,
  })

  return Response.json(updated)
}

export async function DELETE(_, { params }) {
  const deleted = await prisma.company.delete({
    where: { id: Number(params.id) },
  })

  return Response.json(deleted)
}