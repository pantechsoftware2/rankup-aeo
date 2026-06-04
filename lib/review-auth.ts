export function getReviewAdminToken() {
  return process.env.DEEP_REPORT_ADMIN_TOKEN?.trim() || '';
}

export function hasReviewRouteAccess(req: Request) {
  const token = getReviewAdminToken();

  if (!token) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const searchToken = new URL(req.url).searchParams.get('token')?.trim();

  return authHeader === token || searchToken === token;
}

export function hasReviewPageAccess(searchToken?: string | string[]) {
  const token = getReviewAdminToken();
  const value = Array.isArray(searchToken) ? searchToken[0] : searchToken;

  if (!token) {
    return process.env.NODE_ENV !== 'production';
  }

  return value?.trim() === token;
}
