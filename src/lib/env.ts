/**
 * Environment variable validation for SpreadPilot.
 * This ensures the app doesn't start with missing configuration.
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'TELEGRAM_BOT_TOKEN',
  'CRON_SECRET',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Critical configuration missing: ${missing.join(', ')}`);
    }
  }
}

export const env = {
  get DATABASE_URL() { return process.env.DATABASE_URL!; },
  get CLERK_SECRET_KEY() { return process.env.CLERK_SECRET_KEY!; },
  get NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY() { return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!; },
  get TELEGRAM_BOT_TOKEN() { return process.env.TELEGRAM_BOT_TOKEN!; },
  get CRON_SECRET() { return process.env.CRON_SECRET!; },
  get PAYSTACK_SECRET_KEY() { return process.env.PAYSTACK_SECRET_KEY!; },
  get NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY() { return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!; },
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL!; },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
};
