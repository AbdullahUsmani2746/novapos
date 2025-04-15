import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_, { params }) {
  const company = await prisma.company.findUnique({
    where: { company_id: Number(params.company_id) },
  })
  return Response.json(company)
}

export async function PUT(req, { params }) {
  const body = await req.json()

  const updated = await prisma.company.update({
    where: { company_id: Number(params.company_id) },
    data: body,
  })

  return Response.json(updated)
}

export async function DELETE(_, { params }) {
  const deleted = await prisma.company.delete({
    where: { company_id: Number(params.company_id) },
  })

  return Response.json(deleted)
}