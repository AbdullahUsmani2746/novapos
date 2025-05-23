import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Database fetching functions
async function fetchMbscd() {
  try {
    const data = await prisma.mBSCD.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching MBSCD:", error);
    return [];
  }
}

async function fetchBscd() {
  try {
    const data = await prisma.bSCD.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching BSCD:", error);
    return [];
  }
}

async function fetchMacno() {
  try {
    const data = await prisma.mACNO.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching MACNO:", error);
    return [];
  }
}

async function fetchAcno() {
  try {
    const data = await prisma.aCNO.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching ACNO:", error);
    return [];
  }
}

// Utility function to build structured account data
function buildAccountsHierarchy(mbscdData, bscdData, macnoData, acnoData) {
  const formattedData = [];
  
  for (const l1 of mbscdData) {
    // Filter level 2 (bscd) for this mbscd
    const level2Items = bscdData.filter(l2 => l2.mbscd === l1.bscd);
    
    for (const l2 of level2Items) {
      // Filter level 3 (macno) for this bscd
      const level3Items = macnoData.filter(l3 => l3.bscd === l2.bscd);
      
      for (const l3 of level3Items) {
        // Filter level 4 (acno) for this macno
        const level4Items = acnoData.filter(l4 => l4.macno === l3.macno);
        
        formattedData.push({
          balanceSheetCode: `${l1.bscd} ${l1.bscdDetail}`,
          balanceSheetCategory: `${l2.bscd} ${l2.bscdDetail}`,
          mainAccounts: `${l3.macno} ${l3.macname}`,
          subAccounts: level4Items.map(acc => `${acc.acno} ${acc.acname}`)
        });
      }
    }
  }
  
  return formattedData;
}

// API handler for all data (used for exports)
export async function GET() {
  try {
    // Fetch all data
    const [mbscdData, bscdData, macnoData, acnoData] = await Promise.all([
      fetchMbscd(),
      fetchBscd(),
      fetchMacno(),
      fetchAcno()
    ]);
    
    // Build the hierarchical structure
    const allData = buildAccountsHierarchy(mbscdData, bscdData, macnoData, acnoData);
    
    return NextResponse.json({
      success: true,
      data: allData
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch all account data" },
      { status: 500 }
    );
  }
}