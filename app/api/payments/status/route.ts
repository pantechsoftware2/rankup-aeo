import { getPaymentStatus } from '@/backend/controllers/payment.controller';

export async function GET() {
  return getPaymentStatus();
}
