import { calculateFootprint } from '../../../lib/scoring';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Fallback to ensure we have a valid object
    const answers = body.answers || body || {};
    const region = body.region || answers.GQ1 || 'terai';
    
    const result = calculateFootprint(answers, region);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate footprint', details: error.message }, { status: 500 });
  }
}
