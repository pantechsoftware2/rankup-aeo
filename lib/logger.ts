export function debugLog(message: string, meta?: unknown) {
  if (process.env.NODE_ENV === 'production' || process.env.DEBUG_LOGS !== 'true') {
    return;
  }

  if (meta === undefined) {
    console.info(message);
    return;
  }

  console.info(message, meta);
}
