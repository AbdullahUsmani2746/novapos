import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const companies = await prisma.poPrdCat.findMany()
  return Response.json(companies)
}

export async function POST(req) {
  const body = await req.json()

  const newCompany = await prisma.poPrdCat.create({
    data: body,
  })

  return Response.json(newCompany)
}
