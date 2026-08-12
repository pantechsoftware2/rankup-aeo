import { confirmCheckoutSession } from '@/backend/controllers/payment.controller';

export async function POST(req: Request) {
  return confirmCheckoutSession(req);
}
