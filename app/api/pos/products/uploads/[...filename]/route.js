import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import mime from 'mime-types';

export async function GET(req, { params }) {
  const filenameParts = params.filename; // it's an array like ['uploads', 'products', 'file.jpg']
  const filePath = path.join(process.cwd(), 'public', ...filenameParts);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
    },
  });
}
