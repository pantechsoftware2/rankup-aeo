import { logOut } from '@/backend/controllers/auth.controller';

export async function POST() {
  return logOut();
}
