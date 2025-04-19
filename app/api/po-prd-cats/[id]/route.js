import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_, { params }) {
  const poPrdCat = await prisma.poPrdCat.findUnique({
    where: { id: Number(params.id) },
  })
  return Response.json(poPrdCat)
}

export async function PUT(req, { params }) {
  const body = await req.json()

  const updated = await prisma.poPrdCat.update({
    where: { id: Number(params.id) },
    data: body,
  })

  return Response.json(updated)
}

export async function DELETE(_, { params }) {
  const deleted = await prisma.poPrdCat.delete({
    where: { id: Number(params.id) },
  })

  return Response.json(deleted)
}