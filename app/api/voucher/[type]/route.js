import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const MODEL_MAP = {
  payment: prisma.paymentVoucher,
  receipt: prisma.receiptVoucher,
  journal: prisma.journalVoucher
}

export async function GET(request, { params }) {
  const { type } = params

  const model = MODEL_MAP[type]
  if (!model) return Response.json({ error: 'Invalid voucher type' }, { status: 400 })

  const vouchers = await model.findMany({
    orderBy: { id: 'desc' },
    take: 50
  })

  return Response.json(vouchers)
}

export async function POST(request, { params }) {
  const { type } = params

  const model = MODEL_MAP[type]
  if (!model) return Response.json({ error: 'Invalid voucher type' }, { status: 400 })

  const data = await request.json()

  try {
    const created = await model.create({ data })
    return Response.json(created)
  } catch (err) {
    return Response.json({ error: 'Error creating voucher', details: err.message }, { status: 500 })
  }
}
