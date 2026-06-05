import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    // Install mammoth synchronously
    execSync('npm install mammoth --no-save', { encoding: 'utf-8', shell: 'cmd.exe', cwd: process.cwd() });
    
    // Import mammoth
    const mammoth = require('mammoth');
    
    // Extract text
    const result = await mammoth.extractRawText({path: "C:\\Users\\acer\\Desktop\\HW PRO\\DSC\\Shoes\\Drifter\\Trial\\public\\EF_and_Questions (1).docx"});
    
    return NextResponse.json({ success: true, text: result.value });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
