import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = "C:\\Users\\acer\\.gemini\\antigravity\\brain\\40a72aca-d4a0-460a-a75d-cd0fddfcfcf9\\person_pumping_1780609110370.png";
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error) {
    return new NextResponse('Error loading image', { status: 500 });
  }
}
