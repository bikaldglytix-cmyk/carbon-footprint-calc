import { calculateFootprint } from '../../../lib/scoring';
import { NextResponse } from 'next/server';

// Manual QA endpoint (GET /api/test-score) verifying the worksheet scoring rules.
export async function GET() {
  const results = [];
  const check = (name, actual, expected) =>
    results.push({ name, passed: Math.abs(actual - expected) < 0.01, expected, actual });

  try {
    // 1. A3 "mixed": regional firewood (rural hills/terai = 1000) x 0.74 x stove(1.0) = 740. GQ3=1.
    const t1 = calculateFootprint({
      GQ1: 'hilly', GQ2: 'rural_hills_terai', GQ3: '1', A3: 'mixed', A4: 'traditional',
    });
    check('A3 Mixed = firewood x 0.74', t1.byDomain.A, 740);

    // 2. A3 LPG scores 0 (counted in A5). A5 = 1 cylinder/month = 509. GQ3=1.
    const t2 = calculateFootprint({ GQ2: 'urban', GQ3: '1', A3: 'lpg', A5: '1' });
    check('A3 LPG counted in A5', t2.byDomain.A, 509);

    // 3. Per-capita: household firewood (rural hills = 1000) divided by GQ3=2 => 500.
    const t3 = calculateFootprint({
      GQ2: 'rural_hills_terai', GQ3: '2', A3: 'firewood', A4: 'traditional',
    });
    check('Household firewood / GQ3(2)', t3.byDomain.A, 500);

    // 4. A5 custom = 1.5 cylinders/month x 508.8 = 763.2, household / GQ3=1.
    const t4 = calculateFootprint({ GQ2: 'urban', GQ3: '1', A5: 'custom', A5_value: '1.5' });
    check('A5 custom cylinders', t4.byDomain.A, 763.2);

    // 5. B1 "own" scores 0; B2 car<100km = 655 (household), GQ3=1.
    const t5 = calculateFootprint({ GQ3: '1', B1: 'own', B2: 'car_under100' });
    check('B1 own=0, B2 car=655', t5.byDomain.B, 655);

    // 6. Individual question (B4 long-haul flight = 1500) is NOT divided by GQ3=5.
    const t6 = calculateFootprint({ GQ3: '5', B4: '1long' });
    check('B4 flight not divided', t6.byDomain.B, 1500);

    // 7. A7 electricity is 0 regardless of option.
    const t7 = calculateFootprint({ GQ3: '1', A7: '12plus' });
    check('A7 electricity = 0', t7.byDomain.A, 0);

    const allPassed = results.every((r) => r.passed);
    return NextResponse.json({ success: allPassed, tests: results });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
