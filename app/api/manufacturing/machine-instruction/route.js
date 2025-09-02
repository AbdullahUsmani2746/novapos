// app/api/machine-instruction/route.js
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const machines = await prisma.mACHINE_INSTRUCTION_MASTER.findMany({
      include: {
        machineDetails: {
          include: { item: true },
        },
        item: true,
      },
    });
    const formatted = machines.map(machine => ({
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
    }));
    return Response.json({ data: formatted }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { machineId, timeMin, descr, details } = data;
    const master = await prisma.mACHINE_INSTRUCTION_MASTER.create({
      data: {
        machine_id: parseInt(machineId),
        time_min: timeMin,
        descr,
      },
    });
    for (const det of details) {
      await prisma.mACHINE_INSTRUCTION_DETAIL.create({
        data: {
          rec_id: master.rec_id,
          machine_id: parseInt(det.machineId),
          part: det.part,
          time_min: det.timeMin,
          instructions: det.instructions,
        },
      });
    }
    const newMachine = await prisma.mACHINE_INSTRUCTION_MASTER.findUnique({
      where: { rec_id: master.rec_id },
      include: {
        machineDetails: {
          include: { item: true },
        },
        item: true,
      },
    });
    const formattedNew = {
      id: newMachine.rec_id,
      machineId: newMachine.machine_id,
      productName: newMachine.item.item,
      timeMin: newMachine.time_min,
      descr: newMachine.descr,
      details: newMachine.machineDetails.map(detail => ({
        id: detail.id,
        machineId: detail.machine_id,
        part: detail.part,
        timeMin: detail.time_min,
        instructions: detail.instructions,
        name: detail.item.item,
      })),
    };
    return Response.json(formattedNew, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}