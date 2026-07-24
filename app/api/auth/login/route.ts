import { logIn } from '@/backend/controllers/auth.controller';

export async function POST(req: Request) {
  return logIn(req);
}
