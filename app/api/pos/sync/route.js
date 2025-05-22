import { syncFromWooCommerce } from '@/services/wooCommerceSync';
import { NextResponse } from 'next/server';

export async function POST() {
  await syncFromWooCommerce();
  return NextResponse.json({ message: 'Sync completed' });
}