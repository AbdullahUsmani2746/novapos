import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const companies = await prisma.company.findMany()
  return Response.json(companies)
}

export async function POST(req) {
  const body = await req.json()

  const newCompany = await prisma.company.create({
    data: body,
  })

  return Response.json(newCompany)
}
