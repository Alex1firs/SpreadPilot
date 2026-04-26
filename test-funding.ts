import { config } from 'dotenv';
config({ path: '.env.local' });
import { runFundingScanner } from './src/jobs/scan-funding';

runFundingScanner().then(res => console.log('Result:', res)).catch(err => console.error('Error:', err));
