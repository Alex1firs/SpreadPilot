import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL || 'postgresql://readonly:password@ep-placeholder.us-east-1.aws.neon.tech/neondb');
export const db = drizzle(sql);
