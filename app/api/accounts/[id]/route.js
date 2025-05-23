// // pages/api/accounts/[id].js
// import prisma from "@/lib/prisma";

// export default async function handler(req, res) {
//   const { id } = req.query;

//   switch (req.method) {
//     case 'PUT':
//       try {
//         const {
//           level1, level1Name,
//           level2, level2Name,
//           level3, level3Name,
//           level4, level4Name
//         } = req.body;

//         // Update all levels in the correct order
//         const updatedMbscd = await prisma.mBSCD.upsert({
//           where: { bscd: parseInt(level1) },
//           update: { bscdDetail: level1Name },
//           create: { bscd: parseInt(level1), bscdDetail: level1Name }
//         });

//         const updatedBscd = await prisma.bSCD.upsert({
//           where: { bscd: parseInt(level2) },
//           update: { 
//             bscdDetail: level2Name,
//             mbscd: parseInt(level1)
//           },
//           create: {
//             bscd: parseInt(level2),
//             bscdDetail: level2Name,
//             mbscd: parseInt(level1)
//           }
//         });

//         const updatedMacno = await prisma.mACNO.upsert({
//           where: { macno: parseInt(level3) },
//           update: {
//             macname: level3Name,
//             bscd: parseInt(level2)
//           },
//           create: {
//             macno: parseInt(level3),
//             macname: level3Name,
//             bscd: parseInt(level2)
//           }
//         });

//         const updatedAcno = await prisma.aCNO.upsert({
//           where: { 
//             macno_acno: {
//               macno: parseInt(level3),
//               acno: parseInt(level4)
//             }
//           },
//           update: { acname: level4Name },
//           create: {
//             macno: parseInt(level3),
//             acno: parseInt(level4),
//             acname: level4Name
//           }
//         });

//         res.status(200).json(updatedAcno);
//       } catch (error) {
//         console.error('Update error:', error);
//         res.status(500).json({ error: 'Failed to update account' });
//       }
//       break;

//     case 'DELETE':
//       try {
//         const account = await prisma.aCNO.delete({
//           where: { id: parseInt(id) }
//         });
//         res.status(200).json(account);
//       } catch (error) {
//         res.status(500).json({ error: 'Failed to delete account' });
//       }
//       break;

//     default:
//       res.setHeader('Allow', ['PUT', 'DELETE']);
//       res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }