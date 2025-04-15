import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const companies = await prisma.company.findMany()
  return Response.json(companies)
}

export async function POST(req) {
  const body = await req.json()

  const newCompany = await prisma.company.create({
    data: {
      name: body.name,
      address1: body.address1,
      address2: body.address2,
      city: body.city,
      phone: body.phone,
      fax: body.fax,
      email: body.email
    }
  })

  return Response.json(newCompany)
}
