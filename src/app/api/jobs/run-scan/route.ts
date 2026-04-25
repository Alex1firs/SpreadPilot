import { NextResponse } from 'next/server';
import { runScanner } from '@/jobs/scan-prices';
import { runAlertCheck } from '@/jobs/check-alerts';
import { validateEnv } from '@/lib/env';

export async function POST(request: Request) {
  validateEnv();
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('--- Triggering Scheduled Scan Job ---');
    const scanResult = await runScanner();
    
    let alertResult = null;
    if (scanResult.status === 'completed') {
      alertResult = await runAlertCheck();
    }

    return NextResponse.json({
      success: true,
      scan: scanResult,
      alerts: alertResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Job Route Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
