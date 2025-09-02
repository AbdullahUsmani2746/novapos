// app/api/machine-instruction/[id]/route.js
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const machine = await prisma.mACHINE_INSTRUCTION_MASTER.findUnique({
      where: { rec_id: parseInt(params.id) },
      include: {
        machineDetails: {
          include: { item: true },
        },
        item: true,
      },
    });
    if (!machine) return Response.json({ error: 'Not found' }, { status: 404 });
    const formatted = {
      id: machine.rec_id,
      machineId: machine.machine_id,
      productName: machine.item.item,
      timeMin: machine.time_min,
      descr: machine.descr,
      details: machine.machineDetails.map(detail => ({
        id: detail.id,
        machineId: detail.machine_id,
        part: detail.part,
        timeMin: detail.time_min,
        instructions: detail.instructions,
        name: detail.item.item,
      })),
    };
    return Response.json(formatted, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { machineId, timeMin, descr, details } = data;
    await prisma.mACHINE_INSTRUCTION_MASTER.update({
      where: { rec_id: parseInt(params.id) },
      data: {
        machine_id: parseInt(machineId),
        time_min: timeMin,
        descr,
      },
    });
    await prisma.mACHINE_INSTRUCTION_DETAIL.deleteMany({ where: { rec_id: parseInt(params.id) } });
    for (const det of details) {
      await prisma.mACHINE_INSTRUCTION_DETAIL.create({
        data: {
          rec_id: parseInt(params.id),
          machine_id: parseInt(det.machineId),
          part: det.part,
          time_min: det.timeMin,
          instructions: det.instructions,
        },
      });
    }
    const updatedMachine = await prisma.mACHINE_INSTRUCTION_MASTER.findUnique({
      where: { rec_id: parseInt(params.id) },
      include: {
        machineDetails: {
          include: { item: true },
        },
        item: true,
      },
    });
    const formattedUpdated = {
      id: updatedMachine.rec_id,
      machineId: updatedMachine.machine_id,
      productName: updatedMachine.item.item,
      timeMin: updatedMachine.time_min,
      descr: updatedMachine.descr,
      details: updatedMachine.machineDetails.map(detail => ({
        id: detail.id,
        machineId: detail.machine_id,
        part: detail.part,
        timeMin: detail.time_min,
        instructions: detail.instructions,
        name: detail.item.item,
      })),
    };
    return Response.json(formattedUpdated, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.mACHINE_INSTRUCTION_DETAIL.deleteMany({ where: { rec_id: parseInt(params.id) } });
    await prisma.mACHINE_INSTRUCTION_MASTER.delete({ where: { rec_id: parseInt(params.id) } });
    return Response.json({}, { status: 204 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}