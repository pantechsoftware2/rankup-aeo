import { createCheckoutSession } from '@/backend/controllers/payment.controller';

export async function POST(req: Request) {
  return createCheckoutSession(req);
}
