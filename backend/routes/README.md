Route handlers live in `app/api` so the existing Next.js application can deploy without a second HTTP server.

Those route files should stay thin and call controllers from `backend/controllers`.
