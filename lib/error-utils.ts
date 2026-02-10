export type UnknownError = unknown;

export function getErrorMessage(error: UnknownError): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export function pickErrorDetails(error: UnknownError): Record<string, unknown> | undefined {
  if (!error || typeof error !== 'object') return undefined;

  const obj = error as Record<string, unknown>;
  const details: Record<string, unknown> = {};

  for (const key of ['message', 'code', 'details', 'hint', 'status', 'name']) {
    if (obj[key] != null) details[key] = obj[key];
  }

  return Object.keys(details).length > 0 ? details : undefined;
}
