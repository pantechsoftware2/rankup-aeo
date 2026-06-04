import crypto from 'node:crypto';

const FALLBACK_ADMIN_EMAIL = 'yourss.naman@gmail.com';
const GMAIL_API_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export type EmailProvider = 'brevo' | 'google_workspace';

export interface LeadContactDetails {
  name: string;
  email: string;
  phone: string;
  company?: string;
  website?: string;
}

export interface QuickWin {
  title: string;
  description: string;
}

export interface TransactionalEmailArgs {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent: string;
  replyTo?: { email: string; name?: string };
  attachments?: { name: string; content: string }[];
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+()\-\s]/g, '').trim();
}

export function isLikelyValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7;
}

export function getLeadEmailConfig() {
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    FALLBACK_ADMIN_EMAIL;
  const senderEmail =
    process.env.FROM_EMAIL?.trim() ||
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    adminEmail;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://www.rankupaeo.com';
  const bookDemoUrl =
    process.env.NEXT_PUBLIC_PAID_CALL_URL?.trim() ||
    process.env.NEXT_PUBLIC_PAID_CAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_BOOK_DEMO_URL?.trim();
  const reviewAdminToken = process.env.DEEP_REPORT_ADMIN_TOKEN?.trim() || '';
  const emailProvider = (
    process.env.EMAIL_PROVIDER?.trim().toLowerCase() ||
    (process.env.GOOGLE_WORKSPACE_CLIENT_EMAIL ? 'google_workspace' : 'brevo')
  ) as EmailProvider;
  const googleWorkspaceClientEmail =
    process.env.GOOGLE_WORKSPACE_CLIENT_EMAIL?.trim() ||
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ||
    '';
  const googleWorkspacePrivateKey = (
    process.env.GOOGLE_WORKSPACE_PRIVATE_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    ''
  ).replace(/\\n/g, '\n');
  const googleWorkspaceImpersonatedUser =
    process.env.GOOGLE_WORKSPACE_IMPERSONATED_USER?.trim() ||
    process.env.GMAIL_WORKSPACE_USER?.trim() ||
    senderEmail;

  return {
    adminEmail,
    senderEmail,
    appUrl,
    bookDemoUrl,
    reviewAdminToken,
    emailProvider,
    googleWorkspaceClientEmail,
    googleWorkspacePrivateKey,
    googleWorkspaceImpersonatedUser,
  };
}

export function buildReviewUrl(path = '/review') {
  const { appUrl, reviewAdminToken } = getLeadEmailConfig();
  const base = `${appUrl}${path}`;

  if (!reviewAdminToken) {
    return base;
  }

  const separator = path.includes('?') ? '&' : '?';
  return `${base}${separator}token=${encodeURIComponent(reviewAdminToken)}`;
}

function toBase64Url(input: Buffer | string) {
  const value = Buffer.isBuffer(input) ? input.toString('base64') : Buffer.from(input).toString('base64');
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encodeMimeWord(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function formatEmailAddress(value: { email: string; name?: string }) {
  if (!value.name) {
    return value.email;
  }

  const safeName = value.name.replace(/"/g, '\\"');
  return `"${safeName}" <${value.email}>`;
}

function buildMimeEmail(args: TransactionalEmailArgs, senderEmail: string) {
  const mixedBoundary = `mixed_${crypto.randomBytes(8).toString('hex')}`;
  const altBoundary = `alt_${crypto.randomBytes(8).toString('hex')}`;

  const lines = [
    `From: ${formatEmailAddress({ email: senderEmail, name: 'RankUp AEO' })}`,
    `To: ${args.to.map(formatEmailAddress).join(', ')}`,
    `Subject: ${encodeMimeWord(args.subject)}`,
    'MIME-Version: 1.0',
  ];

  if (args.replyTo) {
    lines.push(`Reply-To: ${formatEmailAddress(args.replyTo)}`);
  }

  if (args.attachments?.length) {
    lines.push(`Content-Type: multipart/mixed; boundary="${mixedBoundary}"`, '');
    lines.push(`--${mixedBoundary}`);
    lines.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`, '');
  } else {
    lines.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`, '');
  }

  lines.push(`--${altBoundary}`);
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: base64', '');
  lines.push(Buffer.from(args.textContent, 'utf8').toString('base64'), '');

  lines.push(`--${altBoundary}`);
  lines.push('Content-Type: text/html; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: base64', '');
  lines.push(Buffer.from(args.htmlContent, 'utf8').toString('base64'), '');
  lines.push(`--${altBoundary}--`);

  if (args.attachments?.length) {
    for (const attachment of args.attachments) {
      lines.push('', `--${mixedBoundary}`);
      lines.push(
        `Content-Type: application/octet-stream; name="${attachment.name}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.name}"`,
        '',
        attachment.content
      );
    }
    lines.push(`--${mixedBoundary}--`);
  }

  return lines.join('\r\n');
}

let cachedGoogleAccessToken: { accessToken: string; expiresAt: number } | null = null;

async function getGoogleWorkspaceAccessToken() {
  if (cachedGoogleAccessToken && cachedGoogleAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedGoogleAccessToken.accessToken;
  }

  const {
    googleWorkspaceClientEmail,
    googleWorkspacePrivateKey,
    googleWorkspaceImpersonatedUser,
  } = getLeadEmailConfig();

  if (!googleWorkspaceClientEmail || !googleWorkspacePrivateKey || !googleWorkspaceImpersonatedUser) {
    throw new Error(
      'Google Workspace email is not fully configured. Set GOOGLE_WORKSPACE_CLIENT_EMAIL, GOOGLE_WORKSPACE_PRIVATE_KEY, and GOOGLE_WORKSPACE_IMPERSONATED_USER.'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      iss: googleWorkspaceClientEmail,
      scope: GMAIL_API_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      sub: googleWorkspaceImpersonatedUser,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = signer.sign(googleWorkspacePrivateKey);
  const assertion = `${header}.${payload}.${toBase64Url(signature)}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Workspace token error ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in?: number };
  cachedGoogleAccessToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Math.max(300, data.expires_in || 3600) * 1000,
  };
  return data.access_token;
}

async function sendGoogleWorkspaceEmail(args: TransactionalEmailArgs) {
  const accessToken = await getGoogleWorkspaceAccessToken();
  const { senderEmail } = getLeadEmailConfig();
  const raw = toBase64Url(buildMimeEmail(args, senderEmail));

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Workspace email error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function sendBrevoApiEmail(args: TransactionalEmailArgs) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const { senderEmail } = getLeadEmailConfig();
  const { attachments, ...emailArgs } = args;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: 'RankUp AEO',
      },
      attachment: attachments,
      ...emailArgs,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo email error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export async function sendTransactionalEmail(args: TransactionalEmailArgs) {
  const { emailProvider } = getLeadEmailConfig();

  if (emailProvider === 'google_workspace') {
    return sendGoogleWorkspaceEmail(args);
  }

  return sendBrevoApiEmail(args);
}

export async function sendBrevoEmail(args: TransactionalEmailArgs) {
  return sendTransactionalEmail(args);
}

export function extractQuickWins(reportData: any): QuickWin[] {
  const actions = reportData?.deep?.priorityActions || reportData?.report?.priorityActions || [];

  if (Array.isArray(actions) && actions.length > 0) {
    return actions.slice(0, 3).map((action: any) => ({
      title: action?.title || 'Fix the highest-impact visibility issue',
      description: action?.description || 'Tighten this area first to improve visibility and conversion quality.',
    }));
  }

  const fallback: QuickWin[] = [];

  if (reportData?.fast?.clarity?.critique) {
    fallback.push({
      title: 'Clarify the homepage message',
      description: reportData.fast.clarity.critique,
    });
  }

  if (Array.isArray(reportData?.fast?.technical?.deductions) && reportData.fast.technical.deductions.length > 0) {
    const deduction = reportData.fast.technical.deductions[0];
    fallback.push({
      title: 'Fix the top technical issue',
      description: `${deduction.reason} is dragging down discoverability and trust.`,
    });
  }

  if (reportData?.fast?.presence?.summary) {
    fallback.push({
      title: 'Strengthen off-site visibility',
      description: reportData.fast.presence.summary,
    });
  }

  return fallback.slice(0, 3);
}

export function getBrandLabel(website?: string, reportData?: any): string {
  if (reportData?.fast?.classification?.niche) {
    return reportData.fast.classification.niche;
  }

  if (!website) {
    return 'your site';
  }

  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}
