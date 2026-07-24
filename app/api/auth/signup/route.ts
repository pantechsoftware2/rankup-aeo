import { signUp } from '@/backend/controllers/auth.controller';

export async function POST(req: Request) {
  return signUp(req);
}
