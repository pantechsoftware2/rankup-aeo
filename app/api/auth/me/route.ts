import { getMe } from '@/backend/controllers/auth.controller';

export async function GET() {
  return getMe();
}
