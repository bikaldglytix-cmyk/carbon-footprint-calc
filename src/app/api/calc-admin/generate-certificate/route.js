import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import CertificatePDF from '../../../../components/CertificatePDF';

import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { submission } = await request.json();

    if (!submission) {
      return NextResponse.json({ error: 'Missing submission data' }, { status: 400 });
    }

    const logoPath = path.join(process.cwd(), 'public', 'atl-logo.png');
    let logoDataUri = null;
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');
      logoDataUri = `data:image/png;base64,${logoBase64}`;
    }

    // Render the React component to a PDF stream
    const stream = await renderToStream(<CertificatePDF submission={submission} logoDataUri={logoDataUri} />);
    
    // Collect the stream into a Buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Climate_Certificate_${submission.name?.replace(/\s+/g, '_') || 'Traveler'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating Certificate:', error);
    return NextResponse.json({ error: 'Failed to generate Certificate' }, { status: 500 });
  }
}
